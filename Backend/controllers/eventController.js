const crypto = require("crypto");
const axios = require("axios");
const Event = require("../models/Event");
const { User } = require("../db");
const Notification = require("../models/Notification");
const admin = require("firebase-admin");

// -------------------------------
// PLACE "ORDER" -> Join Event + Save Payment
// -------------------------------
exports.placeOrder = async (req, res) => {
  try {
    const { eventId, transaction_uuid, paymentMethod } = req.body;

    if (!eventId || !transaction_uuid) {
      return res.status(400).json({
        success: false,
        message: "Missing eventId or transaction UUID",
      });
    }

    // 1️⃣ Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // 2️⃣ Check if user already joined
    if (event.participants.some((p) => p.equals(req.userId))) {
      return res
        .status(400)
        .json({ success: false, message: "Already joined this event" });
    }

    // 2.5️⃣ Check Capacity Limits
    const maxCapacity = event.maxParticipants || 50;
    if (event.participants.length >= maxCapacity) {
      return res.status(400).json({ success: false, message: "Event is already full" });
    }

    // 3️⃣ Add user to participants
    event.participants.push(req.userId);
    event.payment = {
      method: paymentMethod || "Bank Transfer",
      transactionUuid: transaction_uuid,
    };
    await event.save();

    // 4️⃣ Notify user
    const user = await User.findById(req.userId);
    const title = "Payment Verified ✅";
    const body = `You have successfully joined ${event.title}. See you there!`;

    await Notification.create({ title, body, userId: req.userId });

    if (user?.fcmToken) {
      admin
        .messaging()
        .send({
          token: user.fcmToken,
          notification: { title, body },
        })
        .catch((e) => console.log("Push Error:", e.message));
    }

    res
      .status(201)
      .json({ success: true, message: "Event joined successfully", event });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to join event",
    });
  }
};

// -------------------------------
// GENERATE eSEWA SIGNATURE
// -------------------------------
exports.generateSignature = async (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const dataToSign = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    res.json({ signature });
  } catch (error) {
    console.error("Generate Signature Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------
// VERIFY PAYMENT FROM eSEWA
// -------------------------------
exports.verifyPayment = async (req, res) => {
  try {
    const { encodedData, eventId, total_amount, transaction_uuid } = req.body;

    if (!eventId)
      return res
        .status(400)
        .json({ success: false, message: "No eventId provided" });

    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    let decodedData = null;
    let resolvedTransactionUuid = transaction_uuid;
    let resolvedTotalAmount = total_amount;
    let resolvedProductCode = "EPAYTEST";
    let resolvedTransactionCode = null;

    if (encodedData) {
      const decodedStr = Buffer.from(encodedData, "base64").toString("utf-8");
      decodedData = JSON.parse(decodedStr);

      const {
        status,
        signature,
        signed_field_names,
        transaction_uuid: callbackTransactionUuid,
        total_amount: callbackTotalAmount,
        product_code,
        transaction_code,
      } = decodedData;

      const signedFieldNamesArray = String(signed_field_names || "")
        .split(",")
        .filter(Boolean);
      const dataToSign = signedFieldNamesArray
        .map((field) => `${field}=${decodedData[field] || ""}`)
        .join(",");

      const expectedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid signature received from eSewa.",
        });
      }

      if (status !== "COMPLETE") {
        return res.status(400).json({
          success: false,
          message: `Payment status is ${status || "UNKNOWN"}.`,
        });
      }

      resolvedTransactionUuid = callbackTransactionUuid || resolvedTransactionUuid;
      resolvedTotalAmount = callbackTotalAmount || resolvedTotalAmount;
      resolvedProductCode = product_code || resolvedProductCode;
      resolvedTransactionCode = transaction_code || null;
    }

    if (!resolvedTransactionUuid || !resolvedTotalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction UUID or total amount for verification.",
      });
    }

    const statusEndpoint =
      process.env.ESEWA_STATUS_URL ||
      "https://rc.esewa.com.np/api/epay/transaction/status/";
    const statusResponse = await axios.get(statusEndpoint, {
      params: {
        product_code: resolvedProductCode,
        total_amount: resolvedTotalAmount,
        transaction_uuid: resolvedTransactionUuid,
      },
    });

    if (statusResponse.data?.status !== "COMPLETE") {
      return res.status(400).json({
        success: false,
        message: `eSewa status check returned ${statusResponse.data?.status || "UNKNOWN"}.`,
        esewa: statusResponse.data,
      });
    }

    // Update event payment info
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    event.payment = {
      method: event.payment?.method || "eSewa",
      amount: resolvedTotalAmount,
      transactionUuid: resolvedTransactionUuid,
      referenceId:
        statusResponse.data?.ref_id || resolvedTransactionCode || null,
      status: "Paid",
    };

    // Add participant with capacity check
    const maxCapacity = event.maxParticipants || 50;
    if (event.participants.length >= maxCapacity && !event.participants.some((p) => p.equals(req.userId))) {
      return res.status(400).json({
        success: false,
        message: "Event is completely full. Cannot process payment enrollment.",
      });
    }

    if (!event.participants.some((p) => p.equals(req.userId))) {
      event.participants.push(req.userId);
    }

    await event.save();

    const user = await User.findById(req.userId);
    const title = "Payment Verified ✅";
    const body = `You have successfully joined ${event.title}. See you there!`;

    await Notification.create({ title, body, userId: req.userId });

    if (user?.fcmToken) {
      admin
        .messaging()
        .send({
          token: user.fcmToken,
          notification: { title, body },
        })
        .catch((e) => console.log("Push Error:", e.message));
    }

    res.json({
      success: true,
      message: "Payment verified and event joined successfully",
      event,
      esewa: statusResponse.data,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};
