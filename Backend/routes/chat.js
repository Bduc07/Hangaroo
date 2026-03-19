const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.get("/messages/:eventId", async (req, res) => {
  try {
    const messages = await Message.find({
      eventId: req.params.eventId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// 2. Send message using API (optional backup)
router.post("/send", async (req, res) => {
  try {
    const { eventId, senderId, senderName, text } = req.body;

    const newMessage = new Message({
      eventId,
      senderId,
      senderName,
      text,
    });

    const saved = await newMessage.save();

    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
