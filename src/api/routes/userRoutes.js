const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const authMiddleware = require('../middlewares/auth');

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);

// Routes protégées (nécessitent une authentification)
//router.use(authMiddleware);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
