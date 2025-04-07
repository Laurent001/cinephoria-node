const express = require("express");
const router = express.Router();
const qrcodeController = require("../controllers/qrcodeController");

router.get("/generate/:bookingId", qrcodeController.getQRCode);
router.post("/verify", qrcodeController.verifyQRCode);

module.exports = router;
