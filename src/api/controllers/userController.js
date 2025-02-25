const dbService = require("../../services/database.service");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res) => {
  try {
    const rows = await dbService.query("SELECT * FROM user");
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await dbService.query("SELECT * FROM user WHERE user.id = ?", [
      userId,
    ]);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return res.status(403).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide", error: error.message });
  }
};

module.exports = {
  getUsers,
  verifyToken,
  getUserById,
};
