import express from "express";
import { getAdmin } from "../controllers/adminController";

const router = express.Router();

router.get("/", getAdmin);

export default router;
