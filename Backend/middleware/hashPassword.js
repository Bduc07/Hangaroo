const bcrypt = require("bcrypt");

const hashPassword = async (req, res, next) => {
  try {
    if (req.body.password) {
      const saltRounds = 10;
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Password hashing failed" });
  }
};

module.exports = { hashPassword };
