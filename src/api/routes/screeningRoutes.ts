import express from "express";
import * as screeningController from "../controllers/screeningController.js";

const router = express.Router();

router.get("/", screeningController.getScreenings);
router.get("/:id/seats", screeningController.getSeatsByScreeningId);
router.get("/:id", screeningController.getScreeningById);
router.get("/film/:filmId", screeningController.getScreeningsByFilmId);
router.get(
  "/film/:filmId/cinema/:cinemaId",
  screeningController.getFilmScreeningsByCinemaId
);

export default router;
