import express from "express";
import * as spaceController from "../controllers/spaceController.ts";

const router = express.Router();

router.get("/user/:id", spaceController.getSpaceByUserId);

export default router;
