const express = require("express");
const router = express.Router();

// DEMO PAYMENT MODE
router.post("/verify", async (req, res) => {
  const { amount, productId } = req.body;

  console.log("Demo Payment Received:");
  console.log("Amount:", amount);
  console.log("Product ID:", productId);

  // Always return success for showcase
  return res.json({
    success: true,
    transactionId: "TEST" + Date.now(),
  });
});

module.exports = router;
