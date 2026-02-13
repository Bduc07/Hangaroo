const express = require("express");
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const { User } = require("../db");
const userMiddleware = require("../middleware/userMiddleware");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const eventRouter = express.Router();
eventRouter.use(userMiddleware);

// ------------------
// Multer config for file uploads
// ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ======================
// CREATE EVENT + SEND NOTIFICATION
// ======================
eventRouter.post("/", upload.single("coverPhoto"), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category,
      maxParticipants,
      price,
      paymentMethod,
      startTime,
      endTime,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const imageUrl = req.file
      ? `http://10.0.2.2:3000/uploads/${req.file.filename}`
      : "";

    const event = await Event.create({
      title,
      description,
      host: req.userId,
      location,
      imageUrl,
      maxParticipants: maxParticipants || 50,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(),
      category: category || "Other",
      payment: {
        method: paymentMethod || "Bank Transfer",
        amount: price || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================
// GET EVENTS JOINED BY LOGGED-IN USER
// ======================
eventRouter.get("/joined", async (req, res) => {
  try {
    const events = await Event.find({ participants: req.userId })
      .populate("host", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .sort({ startTime: 1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// GET EVENTS HOSTED BY LOGGED-IN USER
// ======================
eventRouter.get("/hosted", async (req, res) => {
  try {
    const events = await Event.find({ host: req.userId })
      .populate("host", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .sort({ startTime: 1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
eventRouter.get("/ongoing", async (req, res) => {
  try {
    const events = await Event.find({ host: req.userId, isCompleted: false })
      .populate("participants", "firstName lastName email")
      .sort({ startTime: 1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// GET SINGLE EVENT
// ======================
eventRouter.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("host", "firstName lastName email")
      .populate("participants", "firstName lastName email");

    if (!event)
      return res.status(404).json({ success: false, error: "Event not found" });

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ======================
// GET ALL EVENTS (with search & pagination)
// ======================
eventRouter.get("/ongoing/all", async (req, res) => {
  try {
    // Fetch events where isCompleted is false
    const events = await Event.find({ isCompleted: false })
      .populate("host", "firstName lastName email") // show host info
      .populate("participants", "firstName lastName email") // optional: who joined
      .sort({ startTime: 1 }); // sort by start time ascending

    res.json({ success: true, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// JOIN EVENT
// ======================
eventRouter.post("/:eventId/join", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event)
      return res.status(404).json({ success: false, error: "Event not found" });

    if (event.participants.some((p) => p.equals(req.userId))) {
      return res
        .status(400)
        .json({ success: false, error: "Already joined this event" });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, error: "Event is full" });
    }

    event.participants.push(req.userId);
    await event.save();
    await event.populate("participants", "firstName lastName email");

    res.json({ success: true, message: "Successfully joined event", event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// MARK EVENT AS COMPLETED
// ======================
eventRouter.post("/:eventId/complete", async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      host: req.userId, // only host can complete
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found or not authorized",
      });
    }

    event.isCompleted = true;
    await event.save();

    res.json({ success: true, message: "Event marked as completed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = eventRouter;
