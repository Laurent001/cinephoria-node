import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

router.get(
  "/token/:token",
  userController.verifyToken,
  userController.getUserById
);
router.post("/login", userController.getUsers);
router.get("/employees", userController.getEmployees);
router.get("/:role", userController.getUsersByRole);
router.put("/update", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);

export default router;
