const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get(
  "/token/:token",
  userController.verifyToken,
  userController.getUserById
);
router.post("/login", userController.getUsers);

module.exports = router;
