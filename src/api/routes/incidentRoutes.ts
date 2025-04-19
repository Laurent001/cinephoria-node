import express from "express";
import {
  getIncidents,
  updateIncident,
  addIncident,
  deleteIncidentById,
} from "../controllers/incidentController.js";

const router = express.Router();

router.get("/", getIncidents);
router.post("/update", updateIncident);
router.post("/add", addIncident);
router.delete("/delete/:id", deleteIncidentById);

export default router;
