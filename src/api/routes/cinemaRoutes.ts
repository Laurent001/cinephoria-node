import express, { Request, Response } from "express";
import {
  getCinemaById,
  getCinemaByScreeningId,
  getCinemas,
} from "../controllers/cinemaController.ts";

const router = express.Router();

router.get("/", getCinemas);
router.get("/screening/:id", getCinemaByScreeningId);
router.get("/:id", getCinemaById);

export default router;
