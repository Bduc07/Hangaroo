const { Router } = require("express");
const adminRouter = Router();
const { Admin: adminModel, User } = require("../db");
const Event = require("../models/Event");
const Report = require("../models/Report");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_ADMIN_PASSWORD } = require("../config");

// ADMIN SIGNUP — Hash password
adminRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.json({ message: "Signup success" });
  } catch (err) {
    res.status(400).json({ message: "Signup failed", error: err.message });
  }
});

// ADMIN SIGNIN — Compare hashed password
adminRouter.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  const admin = await adminModel.findOne({ email });

  if (!admin) {
    return res.status(403).json({ message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(403).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD);

  res.json({ token });
});

// ADMIN DASHBOARD
adminRouter.get("/dashboard", adminMiddleware, async function (req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    res.json({ totalUsers, totalEvents });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error", error: err.message });
  }
});

// ADMIN REPORTS (GET all reports)
adminRouter.get("/reports", adminMiddleware, async function (req, res) {
  try {
    // Populate the user email and event title so frontend can display it easily
    const reports = await Report.find()
      .populate('userId', 'email firstName lastName')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reports", error: err.message });
  }
});

// ADMIN USERS
adminRouter.get("/users", adminMiddleware, async function (req, res) {
  try {
    const users = await User.find().select("-password").sort({ _id: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete("/users/:userId", adminMiddleware, async function (req, res) {
  try {
    await Event.deleteMany({ host: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: "User and associated events deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADMIN EVENTS
adminRouter.get("/events", adminMiddleware, async function (req, res) {
  try {
    const events = await Event.find().populate('host', 'email firstName').sort({ _id: -1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete("/events/:eventId", adminMiddleware, async function (req, res) {
  try {
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ success: true, message: "Event permanently deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = adminRouter;
