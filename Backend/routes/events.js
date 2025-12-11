const { Router } = require("express");
const Event = require("../models/Event");
const userMiddleware = require("../middleware/userMiddleware"); // ✅ correct import

const eventRouter = Router();
eventRouter.use(userMiddleware); // all routes protected

// CREATE EVENT
eventRouter.post("/", async (req, res) => {
  try {
    const eventData = { ...req.body, host: req.userId };
    const event = await Event.create(eventData);
    await event.populate("host", "firstName lastName email");

    res
      .status(201)
      .json({ success: true, message: "Event created successfully", event });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET ALL EVENTS
eventRouter.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
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

// GET SINGLE EVENT
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

// JOIN EVENT
eventRouter.post("/:eventId/join", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event)
      return res.status(404).json({ success: false, error: "Event not found" });

    if (event.participants.includes(req.userId)) {
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

module.exports = eventRouter;
