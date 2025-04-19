import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";
import {
  sendAdminEmailWelcome,
  sendStaffEmailWelcome,
  sendUserEmailWelcome,
} from "./emailController.js";

const saltRounds = 10;

const ROLE_ADMIN = 1;
const ROLE_STAFF = 2;
const ROLE_USER = 3;

const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, role } = req.body;

    if (![ROLE_ADMIN, ROLE_STAFF, ROLE_USER].includes(role.id)) {
      res.status(400).json({ message: "rôle incorrect" });
    }

    if (first_name === "" || last_name === "") {
      res.status(400).json({ message: "nom et prénom incorrect" });
    }

    const [existingUsers] = await mariadbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (existingUsers && existingUsers.length > 0) {
      res
        .status(400)
        .json({ message: "email déjà utilisé pour cet utilisateur" });
    }

    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await mariadbService.query(
      "INSERT INTO user (email, reset_token, password, first_name, last_name, role_id) VALUES (?, ?, ?, ?, ?, ?)",
      [email, null, hashedPassword, first_name, last_name, role.id]
    );

    if (result && result.affectedRows > 0) {
      role.id === ROLE_USER
        ? sendUserEmailWelcome(email, first_name)
        : role.id === ROLE_STAFF
        ? sendStaffEmailWelcome(email, first_name, email, password)
        : role.id === ROLE_ADMIN
        ? sendAdminEmailWelcome(email, first_name, email, password)
        : null;
      res.status(201).json({ message: "utilisateur créé avec succès" });
    } else {
      res
        .status(500)
        .json({ message: "Echec de la création de l'utilisateur" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: getErrorMessage(error),
    });
  }
};

function generateRandomPassword(length = 12) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export { registerUser };
