import express from "express";
import { upload } from "../../services/cloudinary.service.ts";
import {
  addAuditorium,
  deleteAuditoriumById,
  getAuditoriums,
  updateAuditorium,
} from "../controllers/auditoriumController.ts";
import {
  addFilm,
  deleteFilm,
  updateFilm,
} from "../controllers/filmController.ts";
import { getIntranet } from "../controllers/intranetController.ts";
import {
  addScreening,
  deleteScreeningById,
  updateScreening,
} from "../controllers/screeningController.ts";

const router = express.Router();

router.get("/", getIntranet);

router.put("/screening/update", updateScreening);
router.post("/screening/add", addScreening);
router.delete("/screening/delete/:id", deleteScreeningById);

router.put("/film/update", upload.single("poster_file"), updateFilm);
router.post("/film/add", upload.single("poster_file"), addFilm);
router.delete("/film/delete/:id", deleteFilm);

router.get("/auditorium", getAuditoriums);
router.put("/auditorium/update", updateAuditorium);
router.post("/auditorium/add", addAuditorium);
router.delete("/auditorium/delete/:id", deleteAuditoriumById);

export default router;
