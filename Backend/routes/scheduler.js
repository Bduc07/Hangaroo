const cron = require("node-cron");
const Event = require("../models/Event");
const { User } = require("../db");
const admin = require("firebase-admin");
const Notification = require("../models/Notification");

// Runs every hour on the hour
cron.schedule("0 * * * *", async () => {
  console.log("Checking for upcoming events (24h reminder)...");

  try {
    const now = new Date();
    const tomorrowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Find events starting in the next 23-24 hours
    const upcomingEvents = await Event.find({
      startTime: { $gte: tomorrowStart, $lt: tomorrowEnd },
      isCompleted: false,
    }).populate("participants");

    for (const event of upcomingEvents) {
      const participantIds = event.participants.map((p) => p._id);

      // 2. Fetch tokens for these specific participants
      const users = await User.find({
        _id: { $in: participantIds },
        fcmToken: { $exists: true, $ne: "" },
      });

      const tokens = users.map((u) => u.fcmToken);

      if (tokens.length > 0) {
        const title = "See you tomorrow! 😉";
        const body = `Reminder: "${event.title}" starts in 24 hours at ${event.location}.`;

        // 3. Send Push Notification
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: { title, body },
        });

        // 4. Save to history for each user
        const historyEntries = participantIds.map((uid) => ({
          title,
          body,
          userId: uid,
          createdAt: new Date(),
        }));
        await Notification.insertMany(historyEntries);

        console.log(`Sent 24h reminder for: ${event.title}`);
      }
    }
  } catch (err) {
    console.error("Scheduler Error:", err);
  }
});
