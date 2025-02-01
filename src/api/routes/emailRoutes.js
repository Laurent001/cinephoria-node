const express = require("express");
const router = express.Router();
const { sendWelcome } = require("../controllers/emailController");

router.post("/send-welcome", sendWelcome);

module.exports = router;
