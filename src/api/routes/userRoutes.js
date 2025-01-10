const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const authMiddleware = require('../middlewares/auth');

// Route publique pour l'inscription
router.post("/register", userController.createUser);

// Route publique pour la connexion
router.post("/login", userController.loginUser);

// Routes protégées (nécessitent une authentification)
//router.use(authMiddleware);

// Obtenir tous les utilisateurs
router.get("/", userController.getUsers);

// Obtenir un utilisateur spécifique
router.get("/:id", userController.getUserById);

// Mettre à jour un utilisateur
router.put("/:id", userController.updateUser);

// Supprimer un utilisateur
router.delete("/:id", userController.deleteUser);

module.exports = router;
