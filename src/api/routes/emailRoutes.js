const express = require("express");
const router = express.Router();
const { sendWelcomeEmail } = require("../controllers/emailController");

router.post("/send-welcome-email", sendWelcomeEmail);

module.exports = router;
