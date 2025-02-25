const dbService = require("../../services/database.service");
const bcrypt = require("bcrypt");
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

    if (firstName === "" || lastName === "") {
      return res.status(400).json({ message: "nom et prénom incorrect" });
    }

    const [existingUsers] = await dbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: "email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await dbService.query(
      "INSERT INTO user (email, reset_token, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
      [email, null, hashedPassword, firstName, lastName, role]
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
