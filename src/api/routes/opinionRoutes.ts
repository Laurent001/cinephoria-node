import express from "express";
import {
  getOpinionByUserIdAndFilmId,
  getOpinions,
  addOpinion,
  updateOpinion,
  updateOpinionStatus,
  deleteOpinionById,
} from "../controllers/opinionController";

const router = express.Router();

router.get("/user/:userId/film/:filmId", getOpinionByUserIdAndFilmId);
router.get("/", getOpinions);
router.post("/", addOpinion);
router.put("/update", updateOpinion);
router.put("/update/status", updateOpinionStatus);
router.delete("/delete/:id", deleteOpinionById);

export default router;
