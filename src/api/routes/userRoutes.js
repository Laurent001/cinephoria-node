const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get(
  "/token/:token",
  userController.verifyToken,
  userController.getUserById
);
router.post("/login", userController.getUsers);
router.get("/:role", userController.getUsersByRole);
// router.put("/update", userController.updateUser);
// router.post("/add", userController.addUser);
// router.delete("/delete", userController.deleteUser);

module.exports = router;
