const express = require("express");
const router = express.Router();
const dbController = require("../controllers/dbController");

router.get("/run-setup", dbController.runSetup);

module.exports = router;
