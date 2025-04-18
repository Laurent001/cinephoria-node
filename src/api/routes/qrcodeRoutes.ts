import express from "express";
import { getQRCode, verifyQRCode } from "../controllers/qrcodeController";

const router = express.Router();

router.get("/generate/:bookingId", getQRCode);
router.get("/verify/:qrcode", verifyQRCode);

export default router;
