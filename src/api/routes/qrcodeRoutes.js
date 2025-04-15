const express = require("express");
const router = express.Router();
const qrcodeController = require("../controllers/qrcodeController");

router.get("/generate/:bookingId", qrcodeController.getQRCode);
router.get("/verify/:qrcode", qrcodeController.verifyQRCode);

module.exports = router;
