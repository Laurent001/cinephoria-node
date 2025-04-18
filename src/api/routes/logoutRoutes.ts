import express from "express";
import { getLogout } from "../controllers/logoutController";

const router = express.Router();

router.get("/", getLogout);

export default router;
