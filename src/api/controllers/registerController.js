const dbService = require("../../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const { sendEmailWelcome } = require("./emailController");

const ROLE_ADMIN = "admin";
const ROLE_EMPLOYE = "employe";
const ROLE_USER = "user";

const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (![ROLE_ADMIN, ROLE_EMPLOYE, ROLE_USER].includes(role)) {
      return res.status(400).json({ message: "role incorrect" });
    }

    const [existingUsers] = await dbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: "email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });

    const result = await dbService.query(
      "INSERT INTO user (email, token, password, reset_token, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [email, token, hashedPassword, null, firstName, lastName, role]
    );

    if (result && result.affectedRows > 0) {
      sendEmailWelcome(email, firstName);
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
