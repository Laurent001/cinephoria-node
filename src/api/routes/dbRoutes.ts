import express from "express";
import { runSetup } from "../controllers/dbController.js";

const router = express.Router();

router.get("/run-setup", runSetup);

export default router;
