const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

router.get("/", incidentController.getIncidents);

module.exports = router;
