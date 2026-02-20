const axios = require("axios");
const Transaction = require("../models/Transaction");
const Event = require("../models/Event");

exports.verifyManualPayment = async (req, res) => {
  const { refId, eventId, userId, amount } = req.body;

  try {
    // 1. Prevent Re-use: Check if Ref ID already exists in your DB
    const duplicate = await Transaction.findOne({ refId });
    if (duplicate) return res.status(400).json({ message: "ID already used." });

    // 2. eSewa UAT (Test) Verification API
    const esewaUrl = `https://uat.esewa.com.np/api/epay/txn/status?product_code=EPAYTEST&total_amount=${amount}&transaction_uuid=${refId}`;

    const response = await axios.get(esewaUrl);

    if (response.data.status === "COMPLETE") {
      // 3. Update DB: Create Transaction & Join Event
      await Transaction.create({
        eventId,
        payerId: userId,
        amount,
        refId,
        status: "COMPLETE",
      });

      await Event.findByIdAndUpdate(eventId, {
        $addToSet: { participants: userId },
      });

      res.status(200).json({ success: true, message: "Successfully joined!" });
    } else {
      res.status(400).json({ message: "Payment not verified by eSewa." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during verification." });
  }
};
