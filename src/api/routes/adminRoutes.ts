import express from "express";
import { getAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmin);

export default router;
