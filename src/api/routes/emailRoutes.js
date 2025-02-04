const express = require("express");
const router = express.Router();
const { sendWelcome, sendContact } = require("../controllers/emailController");

router.post("/send-welcome", sendWelcome);
router.post("/contact", sendContact);

module.exports = router;
