const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const Notification = require("../models/Notification");
const { User } = require("../db");

// Initialize Firebase Admin once
const app = !admin.apps.length
  ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  : admin.app();

// ======================
// POST /api/notifications/send
// Send notification manually & save in DB
// ======================
router.post("/send", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).json({ error: "title and body required" });

  try {
    // Save in DB
    const notification = new Notification({ title, body });
    await notification.save();

    // Send FCM to all users
    const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });
    const tokens = users.map((u) => u.fcmToken);

    if (tokens.length > 0) {
      const response = await admin.messaging().sendMulticast({
        tokens,
        notification: { title, body },
      });
      return res.json({
        success: true,
        message: "Notifications sent!",
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    }

    res.json({ success: true, message: "Notification saved, no tokens found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// GET /api/notifications
// Fetch all notifications
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
