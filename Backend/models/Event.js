const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Matches model name in db.js
      required: true,
    },
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    category: {
      type: String,
      enum: ["sports", "social", "education", "business", "other"],
      default: "social",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ✅ Matches model name
      },
    ],
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
