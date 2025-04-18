import { Request as ExpressRequest } from "express";
import { JwtPayload } from "jsonwebtoken";

// Interface représentant un utilisateur avec mot de passe
export interface BaseUser {
  id: number;
  email: string;
}

export interface UserWithNewPassword extends BaseUser {
  newPassword: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserWithNewPassword;
}

export interface ResetBody {
  newPassword: string;
  reset_token: string;
}

export interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
}
