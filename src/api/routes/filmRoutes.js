const express = require("express");
const router = express.Router();
const filmController = require("../controllers/filmController");

router.get("/", filmController.getFilms);
router.get("/cinema/:id", filmController.getFilmsByCinemaId);
router.get("/genre/:id", filmController.getFilmsByGenreId);
router.get("/date/:date", filmController.getFilmsByDate);
router.put("/:id/score", filmController.scoreFilmById);

module.exports = router;
