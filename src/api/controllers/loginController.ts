import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ResetBody, UserWithNewPassword } from "../../interfaces/auth.ts";
import mariadbService from "../../services/mariadb.service.ts";
import { getErrorMessage } from "../../utils/error.ts";
import {
  sendEmailResetRequest,
  sendEmailResetSuccess,
} from "./emailController.ts";

const saltRounds = 10;

const getLogin = async (req: Request, res: Response) => {
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
      res.status(404).json({ message: "No user for this role" });
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

      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        throw new Error("SECRET_KEY is not defined in environment variables.");
      }

      if (passwordMatch) {
        const token = jwt.sign(
          { id: user.id.toString(), email: user.email },
          secretKey,
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
      error: getErrorMessage(error),
    });
  }
};

const sendEmailReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [user] = await mariadbService.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (!user) {
      res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("SECRET_KEY is not defined in environment variables.");
    }
    const userId = user.id.toString();
    const reset_token = jwt.sign({ id: userId, email: user.email }, secretKey, {
      expiresIn: "1h",
    });

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
    res.status(500).json({
      message: "Erreur lors de l'envoi de l'email à l'utilisateur",
      error: getErrorMessage(error),
    });
  }
};

const passwordReset = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "user manquant" });
      return;
    }
    const { id, email, newPassword } = req.user as UserWithNewPassword;
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
    res.status(500).json({
      message: "Erreur lors de la récupération du mot de passe",
      error: getErrorMessage(error),
    });
  }
};

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, reset_token } = req.body as ResetBody;

  if (!reset_token) {
    res.status(403).json({ message: "Token manquant" });
  }

  const result = await mariadbService.query(
    "SELECT id FROM user WHERE reset_token = ?",
    [reset_token]
  );

  if (!result || result.length === 0) {
    res.status(403).json({ message: "Token invalide ou expiré" });
  }

  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("SECRET_KEY is not defined in environment variables.");
    }

    const decoded = jwt.verify(reset_token, secretKey) as JwtPayload & {
      id: number;
      email: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      newPassword: newPassword,
    } as UserWithNewPassword;

    next();
  } catch (error) {
    res.status(403).json({
      message: "Token invalide",
      error: getErrorMessage(error),
    });
  }
};

export { getLogin, passwordReset, sendEmailReset, verifyToken };
