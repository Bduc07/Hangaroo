// routes/auth/google.js
const { Router } = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../../db").User; // Your User model
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../../config");

const router = Router();
const WEB_CLIENT_ID =
  "648562511944-8ge762038einhanai1st5ugc6jbv5pgk.apps.googleusercontent.com";
const client = new OAuth2Client(WEB_CLIENT_ID);

router.post("/", async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1️⃣ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // 2️⃣ Split name into first/last
    const nameParts = (name || "Google User").split(" ");
    const firstName = nameParts[0] || "Google";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // 3️⃣ CHECK if user exists in MongoDB
    let user = await User.findOne({ email });

    // 4️⃣ If NOT, CREATE new user in MongoDB
    if (!user) {
      console.log(`📝 Creating new Google user: ${email}`);
      user = await User.create({
        email,
        firstName,
        lastName,
        googleId,
        profilePicture: picture,
        password: "GOOGLE_AUTH", // Dummy password since they use Google
        isVerified: true, // Google emails are already verified
        createdAt: new Date(),
      });
    } else {
      console.log(`✅ Existing user found: ${email}`);
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // 5️⃣ Generate JWT token with user ID from MongoDB
    const token = jwt.sign(
      {
        id: user._id, // MongoDB _id
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_USER_PASSWORD,
      { expiresIn: "7d" },
    );

    // 6️⃣ Return user data FROM MONGODB to frontend
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture || picture,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({
      success: false,
      error: "Google authentication failed",
    });
  }
});

module.exports = router;
