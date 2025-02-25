const express = require("express");
const router = express.Router();
const {
  sendEmailWelcome,
  sendEmailContact,
} = require("../controllers/emailController");

router.post("/send-welcome", sendEmailWelcome);
router.post("/contact", sendEmailContact);

module.exports = router;
