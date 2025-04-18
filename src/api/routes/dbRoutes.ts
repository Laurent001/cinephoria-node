import express from "express";
import { runSetup } from "../controllers/dbController.ts";

const router = express.Router();

router.get("/run-setup", runSetup);

export default router;
