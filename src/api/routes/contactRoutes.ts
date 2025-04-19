import express from "express";
import { getContact } from "../controllers/contactController.js";

const router = express.Router();

router.get("/", getContact);

export default router;
