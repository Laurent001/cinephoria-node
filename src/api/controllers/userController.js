const dbService = require("../../services/database.service");
const jwt = require("jsonwebtoken");

const EMPLOYEE_ROLE = "employee";
const ADMIN_ROLE = "admin";

const getUsers = async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

const fetchUsers = async () => {
  try {
    const rows = await dbService.query("SELECT * FROM user");

    const users = rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
    }));

    return users;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des utilisateurs avec le role ${role}: ${error.message}`
    );
  }
};

const getUsersByRole = async (req, res) => {
  const role = req.params.role;

  try {
    const users = await fetchUsersByRole(role);
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors de la récupération des utilisateurs avec le role ${role}`,
      error: error.message,
    });
  }
};

const fetchUsersByRole = async (role) => {
  try {
    const rows = await dbService.query("SELECT * FROM user WHERE role = ?", [
      role,
    ]);

    const users = rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
    }));

    return users;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des utilisateurs: ${error.message}`
    );
  }
};

const getUserById = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await fetchUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur",
      error: error.message,
    });
  }
};

const fetchUserById = async (userId) => {
  try {
    const rows = await dbService.query("SELECT * FROM user WHERE user.id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return null;
    }

    const user = {
      id: rows[0].id,
      email: rows[0].email,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      role: rows[0].role,
    };

    return user;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur: ${error.message}`
    );
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
  fetchUserById,
  fetchUsersByRole,
  getUsersByRole,
  fetchUsers,
};
