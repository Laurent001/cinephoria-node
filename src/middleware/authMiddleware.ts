import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../interfaces/auth.ts";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentification requise" });
    return;
  }

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in environment variables.");
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;

    if (!decoded.id || !decoded.email) {
      res.status(403).json({ message: "Token invalide" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    } as DecodedToken;

    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide" });
  }
};

export default authMiddleware;
