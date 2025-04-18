import express from "express";
import * as spaceController from "../controllers/spaceController";

const router = express.Router();

router.get("/user/:id", spaceController.getSpaceByUserId);

export default router;
