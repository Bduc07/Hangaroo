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
    const mongoose = require('mongoose');

    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();

    // 1. Top Host
    const topHostData = await Event.aggregate([
      { $group: { _id: "$host", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    let topHost = null;
    if (topHostData.length > 0 && topHostData[0]._id) {
      topHost = await User.findById(topHostData[0]._id).select("firstName lastName email");
      if (topHost) {
        topHost = { ...topHost._doc, eventCount: topHostData[0].count };
      }
    }

    // 2. Most Popular Event
    const popularEventData = await Event.aggregate([
      { $project: { title: 1, _id: 1, numParticipants: { $size: { $ifNull: ["$participants", []] } } } },
      { $sort: { numParticipants: -1 } },
      { $limit: 1 }
    ]);
    
    let popularEvent = null;
    if (popularEventData.length > 0) {
      popularEvent = popularEventData[0];
    }

    // 3. Last 7 Days Activity & Chart Data
    let last7DaysEventsTotal = 0;
    let last7DaysUsersTotal = 0;
    const chartData = [];
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date(today);
      startOfDay.setDate(today.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setDate(today.getDate() - i);
      endOfDay.setHours(23, 59, 59, 999);

      // Events for the day
      const dailyEvents = await Event.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      // Users for the day (using ObjectId timestamp)
      const startObjId = mongoose.Types.ObjectId.createFromTime(Math.floor(startOfDay.getTime() / 1000));
      const endObjId = mongoose.Types.ObjectId.createFromTime(Math.floor(endOfDay.getTime() / 1000));
      const dailyUsers = await User.countDocuments({
        _id: { $gte: startObjId, $lte: endObjId }
      });

      last7DaysEventsTotal += dailyEvents;
      last7DaysUsersTotal += dailyUsers;

      const dateStr = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });
      chartData.push({ date: dateStr, newUsers: dailyUsers, newEvents: dailyEvents });
    }

    res.json({ 
      totalUsers, 
      totalEvents, 
      topHost, 
      popularEvent, 
      last7Days: {
        events: last7DaysEventsTotal,
        users: last7DaysUsersTotal,
        chart: chartData
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
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
