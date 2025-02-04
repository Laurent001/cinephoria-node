const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");

router.get("/:id/seats", screeningController.getSeatsByScreeningId);
router.get("/:id", screeningController.getScreeningById);

module.exports = router;
