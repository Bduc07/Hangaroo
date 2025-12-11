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
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRouter;
