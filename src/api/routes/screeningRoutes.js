const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");

router.get("/:id/seats", screeningController.getSeatsByScreeningId);
router.get("/:id", screeningController.getScreeningById);
router.get("/film/:filmId", screeningController.getScreeningsByFilmId);
router.get(
  "/film/:filmId/cinema/:cinemaId",
  screeningController.getFilmScreeningsByCinemaId
);

module.exports = router;
