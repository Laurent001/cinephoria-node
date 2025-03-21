const express = require("express");
const router = express.Router();
const opinionController = require("../controllers/opinionController");

router.get(
  "/user/:userId/film/:filmId",
  opinionController.getOpinionByUserIdAndFilmId
);
router.get("/", opinionController.getOpinions);
router.post("/", opinionController.addOpinion);
router.put("/update", opinionController.updateOpinion);
router.put("/update/status", opinionController.updateOpinionStatus);
router.delete("/delete/:id", opinionController.deleteOpinionById);

module.exports = router;
