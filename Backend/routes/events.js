const express = require("express");
const multer = require("multer"); // ✅ import multer
const path = require("path");
const Event = require("../models/Event");
const userMiddleware = require("../middleware/userMiddleware");

const eventRouter = express.Router();
eventRouter.use(userMiddleware);

// Multer config — put it here, inside the route file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }); // ✅ define upload

// Example route using Multer
eventRouter.post("/", upload.single("coverPhoto"), async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { title, description, location } = req.body;

    if (!title || !description || !location) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
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
      maxParticipants: 50,
      startTime: new Date(),
      endTime: new Date(),
      category: "Other",
      payment: { method: "Bank Transfer", amount: 0 },
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// ======================
// GET EVENTS JOINED BY LOGGED-IN USER
// Must come BEFORE /:eventId route
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
eventRouter.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 20, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(filter)
      .populate("host", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .sort({ startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
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

    // ✅ Check if already joined
    if (event.participants.some((p) => p.equals(req.userId))) {
      return res
        .status(400)
        .json({ success: false, error: "Already joined this event" });
    }

    // ✅ Check max participants
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

module.exports = eventRouter;
