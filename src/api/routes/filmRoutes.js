const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  dest: "public/images",
  limits: { fileSize: 5 * 1024 * 1024 },
});
const filmController = require("../controllers/filmController");

router.get("/", filmController.getFilms);
router.put("/update", upload.single("poster_file"), filmController.updateFilm);
router.post("/add", upload.single("poster_file"), filmController.addFilm);
router.get("/cinema/:id", filmController.getFilmsByCinemaId);
router.get("/genre/:id", filmController.getFilmsByGenreId);
router.get("/date/:date", filmController.getFilmsByDate);

module.exports = router;
