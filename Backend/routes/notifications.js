const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const Notification = require("../models/Notification");
const { User } = require("../db");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ======================
// POST /api/notifications/send
// ======================
router.post("/send", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "title and body required" });
  }

  try {
    // 1. Save in DB (History)
    const newNotification = new Notification({ title, body });
    await newNotification.save();

    // 2. Get FCM tokens from User collection
    const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });
    const tokens = users.map((u) => u.fcmToken);

    if (tokens.length > 0) {
      const messaging = admin.messaging();

      // 🔹 FIX: Use sendEachForMulticast (v12+ standard)
      const messagePayload = {
        tokens: tokens,
        notification: {
          title: title,
          body: body,
        },
        // Optional: helps notification show up when app is in background
        android: {
          priority: "high",
          notification: {
            channelId: "default",
          },
        },
      };

      const response = await messaging.sendEachForMulticast(messagePayload);

      // 🔹 OPTIONAL BUT GOOD FOR FYP: Log failures (dead tokens)
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log("Failed tokens count:", failedTokens.length);
      }

      return res.json({
        success: true,
        message: "Notifications processed",
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    }

    res.json({
      success: true,
      message: "Saved to DB, but no tokens found in User list",
    });
  } catch (err) {
    console.error("FCM Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// GET /api/notifications
// ======================
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
