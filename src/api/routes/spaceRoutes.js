const express = require("express");
const router = express.Router();
const spaceController = require("../controllers/spaceController");

router.get("/user/:id", spaceController.getSpaceByUserId);

module.exports = router;
