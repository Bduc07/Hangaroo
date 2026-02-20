const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 50 },

    category: {
      type: String,
      enum: ["Sports", "Festivals", "Music", "Workshop", "Business", "Other"],
      default: "Other",
    },
    

    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ This will store full URL from multer upload
    imageUrl: String,

    payment: {
      method: {
        type: String,
        enum: ["Bank Transfer", "Cash"],
        default: "Bank Transfer",
      },
      amount: { type: Number, default: 0 },
    },
  },

  
  { timestamps: true },
  
);

module.exports = mongoose.model("Event", eventSchema);
