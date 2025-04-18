import express from "express";
import {
  sendUserEmailWelcome,
  sendEmailContact,
} from "../controllers/emailController.ts";

const router = express.Router();

router.post("/send-welcome", (req, res) => {
  const { email, name } = req.body;
  sendUserEmailWelcome(email, name);
  res.status(200).json({ message: "Welcome email sent successfully" });
});
router.post("/contact", sendEmailContact);

export default router;
