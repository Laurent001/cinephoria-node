const dbService = require("../../services/database.service");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { sendWelcomeEmail } = require("./emailController");

const ROLE_ADMIN = 1;
const ROLE_EMPLOYE = 2;
const ROLE_USER = 3;

const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const [existingUsers] = await dbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: "email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const roleId = ROLE_USER;
    const reset_password = 0;

    const result = await dbService.query(
      "INSERT INTO user (email, password, reset_password, first_name, last_name, role_id) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, reset_password, firstName, lastName, roleId]
    );

    if (result && result.affectedRows > 0) {
      sendWelcomeEmail(email, firstName);
      res.status(201).json({ message: "utilisateur créé avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la création de l'utilisateur" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
};
