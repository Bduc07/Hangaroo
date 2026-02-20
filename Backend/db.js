const mongoose = require("mongoose");

// USER SCHEMA
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
  fcmToken: { type: String },
  points: { type: Number, default: 0 },
});

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
});

// MODELS
const User = mongoose.model("User", userSchema); // ✅ Capital "U"
const Admin = mongoose.model("Admin", adminSchema); // ✅ Capital "A"

module.exports = {
  User,
  Admin,
};
