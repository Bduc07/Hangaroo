const { Router } = require("express");
const User = require("../db").User; // assuming you export User model from db.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_USER_PASSWORD } = require("../config");
const userMiddleware = require("../middleware/userMiddleware"); // ✅ correct import

const userRouter = Router();

// SIGNUP
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.json({ message: "Signup success", userId: user._id });
  } catch (err) {
    res.status(400).json({ message: "Signup failed", error: err.message });
  }
});

// SIGNIN
userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(403).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(403).json({ message: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);
  res.json({ token });
});

// TEST PROTECTED ROUTE

userRouter.get("/profile", userMiddleware, async (req, res) => {
  try {
    // Find user and explicitly ensure we get the points field
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Wrap in success: true to match your frontend logic
    res.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points || 0, // Default to 0 if null/undefined
      },
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = userRouter;
