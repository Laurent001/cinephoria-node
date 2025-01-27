const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");

router.get("/:id", screeningController.getSeatsByScreeningId);

module.exports = router;
