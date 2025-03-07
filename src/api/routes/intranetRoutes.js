const express = require("express");
const router = express.Router();
const intranetController = require("../controllers/intranetController");
const screeningController = require("../controllers/screeningController");
const filmController = require("../controllers/filmController");
const auditoriumController = require("../controllers/auditoriumController");
const { upload } = require("../../services/cloudinary.service");

router.get("/", intranetController.getIntranet);

router.put("/screening/update", screeningController.updateScreening);
router.post("/screening/add", screeningController.addScreening);
router.delete("/screening/delete/:id", screeningController.deleteScreeningById);

router.put(
  "/film/update",
  upload.single("poster_file"),
  filmController.updateFilm
);
router.post("/film/add", upload.single("poster_file"), filmController.addFilm);
router.delete("/film/delete/:id", filmController.deleteFilm);

router.get("/auditorium", auditoriumController.getAuditoriums);
router.put("/auditorium/update", auditoriumController.updateAuditorium);
router.post("/auditorium/add", auditoriumController.addAuditorium);
router.delete(
  "/auditorium/delete/:id",
  auditoriumController.deleteAuditoriumById
);

module.exports = router;
