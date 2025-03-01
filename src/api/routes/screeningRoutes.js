const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");

router.get("/", screeningController.getScreenings);
router.post("/update", screeningController.updateScreening);
router.post("/add", screeningController.addScreening);
router.get("/:id/seats", screeningController.getSeatsByScreeningId);
router.get("/:id", screeningController.getScreeningById);
router.get("/film/:filmId", screeningController.getScreeningsByFilmId);
router.get(
  "/film/:filmId/cinema/:cinemaId",
  screeningController.getFilmScreeningsByCinemaId
);
router.delete("/delete/:id", screeningController.deleteScreeningById);

module.exports = router;
