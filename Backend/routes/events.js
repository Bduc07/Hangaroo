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
// HELPER: Send Multicast Notification
// ======================
const sendGlobalNotification = async (title, body) => {
  try {
    const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });
    const tokens = users.map((u) => u.fcmToken);

    if (tokens.length > 0) {
      const messaging = admin.messaging();
      await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        android: { priority: "high" },
      });

      // Also save to Notification History for the "Notifications" screen
      await Notification.create({ title, body });
      console.log(`✅ Global Notification Sent: ${title}`);
    }
  } catch (err) {
    console.error("FCM Global Error:", err.message);
  }
};

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
      maxParticipants: maxParticipants || 50,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(),
      category: category || "Other",
      payment: {
        method: paymentMethod || "Bank Transfer",
        amount: price || 0,
      },
    });

    // 🔹 Trigger Notification to all users
    sendGlobalNotification(
      "New Event Alert! 📢",
      `${title} is happening at ${location}. Check it out!`,
    );

    res
      .status(201)
      .json({ success: true, message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// JOIN EVENT + NOTIFY BOTH + SAVE TO HISTORY
// ======================
eventRouter.post("/:eventId/join", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event)
      return res.status(404).json({ success: false, error: "Event not found" });

    // Check if user already joined
    if (event.participants.some((p) => p.equals(req.userId))) {
      return res
        .status(400)
        .json({ success: false, error: "Already joined this event" });
    }

    event.participants.push(req.userId);
    await event.save();

    const hostUser = await User.findById(event.host);
    const joiningUser = await User.findById(req.userId);

    const title = "Successfully Joined! ✅";
    const body = `You are all set for ${event.title}. See you there!`;

    // 1. 🔹 Save to Notification History (So it shows up in your Notifications screen)
    await Notification.create({
      title,
      body,
      userId: req.userId, // Make sure your Notification model has a userId field to show personal alerts
    });

    // 2. 🔹 Send Push Notification to the Joining User
    if (joiningUser?.fcmToken) {
      admin
        .messaging()
        .send({
          token: joiningUser.fcmToken,
          notification: { title, body },
        })
        .catch((e) => console.log("Push Error:", e.message));
    }

    // 3. 🔹 Notify Host (Push only)
    if (hostUser?.fcmToken) {
      admin
        .messaging()
        .send({
          token: hostUser.fcmToken,
          notification: {
            title: "New Attendee! 👤",
            body: `${joiningUser.firstName || "A user"} just joined your event: ${event.title}`,
          },
        })
        .catch((e) => console.log("Host Push Error:", e.message));
    }

    res.json({ success: true, message: "Successfully joined event", event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ======================
// REMAINING ROUTES (Joined, Hosted, Ongoing, All, Category, Complete)
// ======================

eventRouter.get("/joined", async (req, res) => {
  try {
    const events = await Event.find({
      participants: req.userId,
      isCompleted: true,
    })
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
    const events = await Event.find({ host: req.userId, isCompleted: true })
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

eventRouter.get("/ongoing/all", async (req, res) => {
  try {
    const events = await Event.find({ isCompleted: false })
      .populate("host", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .sort({ startTime: 1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET: Events the user has joined that are still coming up (Ongoing)
eventRouter.get("/joined-active", async (req, res) => {
  try {
    const events = await Event.find({
      participants: req.userId,
      isCompleted: false, // This is the key filter for "Yet to come"
    })
      .populate("host", "firstName lastName email")
      .sort({ startTime: 1 }); // Shows the soonest event first
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ======================
// COMPLETE EVENT: Record Attendance + Award Points
// ======================
eventRouter.post("/:eventId/complete", async (req, res) => {
  const { eventId } = req.params;
  const { attendedParticipantIds } = req.body; // Array of IDs from the app

  try {
    // 1. Find the event and verify the Host
    const event = await Event.findOne({ _id: eventId, host: req.userId });

    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found or unauthorized" });
    }

    // 2. Update Event Status
    event.isCompleted = true;
    await event.save();

    // 3. Award 50 points to each Present user
    if (attendedParticipantIds && attendedParticipantIds.length > 0) {
      // This is the command that actually saves points to MongoDB
      const updateResult = await User.updateMany(
        { _id: { $in: attendedParticipantIds } },
        { $inc: { points: 50 } },
      );

      console.log(`✅ Points awarded to ${updateResult.modifiedCount} users.`);

      // Create a single notification for history
      await Notification.create({
        title: "Event Finalized! 🏁",
        body: `Points have been distributed for ${event.title}.`,
      });
    }

    res.json({
      success: true,
      message: "Event finalized and points distributed.",
    });
  } catch (error) {
    console.error("Complete Event Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET EVENT BY ID
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

// GET BY CATEGORY
eventRouter.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const events = await Event.find({
      isCompleted: false,
      category: { $regex: new RegExp(`^${categoryName}$`, "i") },
    })
      .populate("host", "firstName lastName email")
      .sort({ startTime: 1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = eventRouter;
