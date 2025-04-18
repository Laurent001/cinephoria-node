import express from "express";
import {
  getFilms,
  getFilmsByCinemaId,
  getFilmsByDate,
  getFilmsByGenreId,
  scoreFilmById,
} from "../controllers/filmController";

const router = express.Router();

router.get("/", getFilms);
router.get("/cinema/:id", getFilmsByCinemaId);
router.get("/genre/:id", getFilmsByGenreId);
router.get("/date/:date", getFilmsByDate);
router.put("/:id/score", scoreFilmById);

export default router;
