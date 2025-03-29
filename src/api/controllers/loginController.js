const mariadbService = require("../../services/mariadb.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const {
  sendEmailResetRequest,
  sendEmailResetSuccess,
} = require("./emailController");

const getLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const rows = await mariadbService.query(
      `SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.password,
        r.id as role_id,
        r.name as role_name
        FROM user u
        INNER JOIN role r ON r.id = u.role_id
        WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = {
      id: rows[0].id,
      email: rows[0].email,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      password: rows[0].password,
      role: {
        id: rows[0].role_id,
        name: rows[0].role_name,
      },
    };

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = jwt.sign(
          { id: user.id.toString(), email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: "24h" }
        );

        res.json({ user: { ...user, password: undefined }, token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du login",
      error: error.message,
    });
  }
};

const sendEmailReset = async (req, res) => {
  try {
    const { email } = req.body;

    const [user] = await mariadbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (!user) {
      res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const userId = user.id.toString();
    const reset_token = jwt.sign(
      { id: userId, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    const result = await mariadbService.query(
      "UPDATE user SET reset_token = ? WHERE id = ?",
      [reset_token, userId]
    );

    if (result && result.affectedRows > 0) {
      sendEmailResetRequest(email, user.first_name, reset_token);
      res.status(201).json({ message: "email reset envoyé avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de l'envoi de l'email à l'utilisateur" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi de l'email à l'utilisateur",
      error: error.message,
    });
  }
};

const passwordReset = async (req, res) => {
  try {
    const { id, email, newPassword } = req.user;
    const [user] = await mariadbService.query(
      "SELECT * FROM user WHERE id = ?",
      [id]
    );
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const result = await mariadbService.query(
      "UPDATE user SET password = ? WHERE id = ?",
      [hashedNewPassword, id]
    );

    if (result && result.affectedRows > 0) {
      sendEmailResetSuccess(email, user.first_name);

      await mariadbService.query(
        "UPDATE user SET reset_token = ? WHERE id = ?",
        [null, id]
      );
      res.status(201).json({ message: "Mot de passe modifié avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de l'envoi de l'email à l'utilisateur" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi de l'email à l'utilisateur",
      error: error.message,
    });
  }
};

const verifyToken = async (req, res, next) => {
  const { newPassword, reset_token } = req.body;

  const result = await mariadbService.query(
    "SELECT id FROM user WHERE reset_token = ?",
    [reset_token]
  );

  if (!reset_token || result.length === 0) {
    return res.status(403).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(reset_token, process.env.SECRET_KEY);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      newPassword: newPassword,
    };

    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide", error: error.message });
  }
};

module.exports = {
  getLogin,
  sendEmailReset,
  passwordReset,
  verifyToken,
};
