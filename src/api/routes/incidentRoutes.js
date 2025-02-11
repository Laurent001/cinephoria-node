const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

router.get("/", incidentController.getIncidents);
router.post("/update", incidentController.setIncident);
router.delete("/delete/:id", incidentController.deleteIncidentById);

module.exports = router;
