const express = require("express");
const router = express.Router();
const cinemaController = require("../controllers/cinemaController");

router.get("/", cinemaController.getCinemas);
router.get("/screening/:id", cinemaController.getCinemaByScreeningId);

module.exports = router;
