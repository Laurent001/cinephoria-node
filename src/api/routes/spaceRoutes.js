const express = require("express");
const router = express.Router();
const spaceController = require("../controllers/spaceController");

router.get("/", spaceController.getSpace);

module.exports = router;
