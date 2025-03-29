const mariadbService = require("../../services/mariadb.service");
const jwt = require("jsonwebtoken");
const ROLE_ADMIN = 1;
const ROLE_STAFF = 2;
const ROLE_USER = 3;

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
    const rows = await mariadbService.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        r.id as role_id,
        r.name as role_name         
        FROM user u 
        INNER JOIN role r ON r.id = u.role_id`
    );

    const users = rows.map((row) => ({
      id: rows[0].id,
      email: rows[0].email,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      role: {
        id: rows[0].role_id,
        name: rows[0].role_name,
      },
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
      message: `Erreur lors de la récupération des utilisateurs avec les rôles ${roles.join(
        ", "
      )}`,
      error: error.message,
    });
  }
};

const fetchUsersByRole = async (role_id) => {
  try {
    const rows = await mariadbService.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        r.id as role_id,
        r.name as role_name         
        FROM user u 
        INNER JOIN role r ON r.id = u.role_id 
        WHERE r.id = ?`,
      [role_id]
    );

    const users = rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      role: {
        id: row.role_id,
        name: row.role_name,
      },
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
    const rows = await mariadbService.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        r.id as role_id,
        r.name as role_name         
        FROM user u 
        INNER JOIN role r ON r.id = u.role_id 
        WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = {
      id: rows[0].id,
      email: rows[0].email,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      role: {
        id: rows[0].role_id,
        name: rows[0].role_name,
      },
    };

    return user;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur: ${error.message}`
    );
  }
};

const getEmployees = async (req, res) => {
  try {
    const staffUsers = await fetchUsersByRole(ROLE_STAFF);
    const adminUsers = await fetchUsersByRole(ROLE_ADMIN);
    const employees = [...staffUsers, ...adminUsers];
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des employés",
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

const updateUser = async (req, res) => {
  const { id, email, first_name, last_name, role } = req.body;

  try {
    const user = await fetchUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const result = await mariadbService.query(
      `UPDATE user 
      SET email = ?, first_name = ?, last_name = ?, role_id = ? 
      WHERE id = ?`,
      [email, first_name, last_name, role.id, id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Utilisateur mis à jour avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la mise à jour de l'utilisateur" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await fetchUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const result = await mariadbService.query(`DELETE FROM user WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "Utilisateur supprimé avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la suppression de l'utilisateur" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur",
      error: error.message,
    });
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
  getEmployees,
  updateUser,
  deleteUser,
};
