import express from "express";
import { getLogout } from "../controllers/logoutController.js";

const router = express.Router();

router.get("/", getLogout);

export default router;
