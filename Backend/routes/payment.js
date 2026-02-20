const express = require("express");
const router = express.Router();
const axios = require("axios");
const Transaction = require("../models/Transaction");
const Event = require("../models/Event");

router.post("/verify-manual", async (req, res) => {
  const { refId, eventId, userId, amount } = req.body;

  try {
    // 1. Check if this Ref ID has been used before (security)
    const alreadyUsed = await Transaction.findOne({ refId });
    if (alreadyUsed)
      return res.status(400).json({ message: "ID already used." });

    // 2. Call eSewa Test API
    const esewaUrl = `https://uat.esewa.com.np/api/epay/txn/status?product_code=EPAYTEST&total_amount=${amount}&transaction_uuid=${refId}`;
    const response = await axios.get(esewaUrl);

    if (response.data.status === "COMPLETE") {
      // 3. Update DB
      await Transaction.create({ refId, eventId, payerId: userId, amount });
      await Event.findByIdAndUpdate(eventId, {
        $addToSet: { participants: userId },
      });

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Verification failed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
