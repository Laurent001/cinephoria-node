import express from "express";
import setUserRole from "../../middleware/setUserRole.js";
import {
  getFilms,
  getFilmsByCinemaId,
  getFilmsByDate,
  getFilmsByGenreId,
  scoreFilmById,
} from "../controllers/filmController.js";

const router = express.Router();

router.get("/", setUserRole, getFilms);
router.get("/cinema/:id", getFilmsByCinemaId);
router.get("/genre/:id", getFilmsByGenreId);
router.get("/date/:date", getFilmsByDate);
router.put("/:id/score", scoreFilmById);

export default router;
