const express = require("express");
const router = express.Router();
const {
  sendUserEmailWelcome,
  sendEmailContact,
} = require("../controllers/emailController");

router.post("/send-welcome", sendUserEmailWelcome);
router.post("/contact", sendEmailContact);

module.exports = router;
