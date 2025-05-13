import express from "express";
import { loginRateLimiter } from "../../middleware/rateLimiter.js";
import {
  getLogin,
  passwordReset,
  sendEmailReset,
  verifyToken,
} from "../controllers/loginController.js";

const router = express.Router();

router.post("/", loginRateLimiter, getLogin);
router.post("/password-reset/request", sendEmailReset);
router.post("/password-reset", verifyToken, passwordReset);

export default router;
