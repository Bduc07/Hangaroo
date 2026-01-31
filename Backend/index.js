const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Routers
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const eventRouter = require("./routes/events"); // ✅ file name matches

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/events", eventRouter);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running!" });
});

async function main() {
  await mongoose.connect(
    "mongodb+srv://bidusigurung9:sF0r9oMTUPEnl0cV@cluster0.x7irko4.mongodb.net/Hangaroo"
  );
  app.listen(3000, () => console.log("✅ Server running on port 3000"));
  console.log("✅ MongoDB connected");
}

main();
