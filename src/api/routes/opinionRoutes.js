const express = require("express");
const router = express.Router();
const opinionController = require("../controllers/opinionController");

router.get(
  "/user/:userId/film/:filmId",
  opinionController.getOpinionByUserIdAndFilmId
);
router.post("/", opinionController.addOpinion);
router.put("/:id", opinionController.updateOpinion);

module.exports = router;
