import express from "express";
import { getContact } from "../controllers/contactController";

const router = express.Router();

router.get("/", getContact);

export default router;
