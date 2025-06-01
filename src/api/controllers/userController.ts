import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";

const ROLE_ADMIN = 1;
const ROLE_STAFF = 2;
const ROLE_USER = 3;

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: getErrorMessage(error),
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

    const users = rows.map((row: any) => ({
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
      `Erreur lors de la récupération des utilisateurs : ${getErrorMessage(
        error
      )}`
    );
  }
};

const getUsersByRole = async (req: Request, res: Response) => {
  const role = parseInt(req.params.role, 10);

  try {
    const users = await fetchUsersByRole(role);
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors de la récupération des utilisateurs`,
      error: getErrorMessage(error),
    });
  }
};

const fetchUsersByRole = async (roleId: number) => {
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
      [roleId]
    );

    const users = rows.map((row: any) => ({
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
      `Erreur lors de la récupération des utilisateurs : ${getErrorMessage(
        error
      )}`
    );
  }
};

const getUserById = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Utilisateur non authentifié" });
    return;
  }

  const userId = req.user.id;

  try {
    const user = await fetchUserById(userId);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur",
      error: getErrorMessage(error),
    });
  }
};

const fetchUserById = async (userId: number) => {
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
      `Erreur lors de la récupération de l'utilisateur : ${getErrorMessage(
        error
      )}`
    );
  }
};

const getEmployees = async (req: Request, res: Response) => {
  try {
    const staffUsers = await fetchUsersByRole(ROLE_STAFF);
    const adminUsers = await fetchUsersByRole(ROLE_ADMIN);
    const employees = [...staffUsers, ...adminUsers];
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des employés",
      error: getErrorMessage(error),
    });
  }
};

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token;

  if (!token) {
    res.status(403).json({ message: "Token manquant" });
  }

  const secret = process.env.SECRET_KEY;
  if (!secret) {
    res.status(500).json({ message: "Clé secrète manquante sur le serveur" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "string" && decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      next();
    } else {
      res.status(401).json({ message: "Token invalide" });
    }
  } catch (error) {
    res.status(401).json({
      message: "Token invalide",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id, email, first_name, last_name, role } = req.body;

  try {
    const user = await fetchUserById(id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    const result = await mariadbService.query(
      `UPDATE user 
      SET email = ?, first_name = ?, last_name = ?, role_id = ? 
      WHERE id = ?`,
      [email, first_name, last_name, role.id, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la mise à jour de l'utilisateur" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error: getErrorMessage(error),
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const user = await fetchUserById(id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    const result = await mariadbService.query(`DELETE FROM user WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la suppression de l'utilisateur" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur",
      error: getErrorMessage(error),
    });
  }
};

export {
  deleteUser,
  fetchUserById,
  fetchUsers,
  fetchUsersByRole,
  getEmployees,
  getUserById,
  getUsers,
  getUsersByRole,
  updateUser,
  verifyToken,
};
