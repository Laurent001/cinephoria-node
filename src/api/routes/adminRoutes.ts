import express from "express";
import { getAdmin } from "../controllers/adminController.ts";

const router = express.Router();

router.get("/", getAdmin);

export default router;
