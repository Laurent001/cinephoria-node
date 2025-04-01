const express = require("express");
const router = express.Router();
const openingsController = require("../controllers/openingsController");

router.get("/:id", openingsController.getOpeningsByCinemaId);

module.exports = router;
