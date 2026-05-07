require("dotenv").config();
const mongoose = require("mongoose");
const { User, Event } = require("./db"); // Wait, db.js might export User directly, but Event is require("./models/Event")

const EventModel = require("./models/Event");

async function check() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hangaroo");
  
  const mostRecentUser = await User.findOne().sort({_id: -1}).lean();
  const mostRecentEvent = await EventModel.findOne().sort({createdAt: -1}).lean();
  
  console.log("Most recent user created at:", mostRecentUser ? mostRecentUser._id.getTimestamp() : "None");
  console.log("Most recent event created at:", mostRecentEvent ? mostRecentEvent.createdAt : "None");
  
  process.exit();
}
check();
