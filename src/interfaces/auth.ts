import { JwtPayload } from "jsonwebtoken";

export interface BaseUser {
  id: number;
  email: string;
  role: string;
}

export interface UserWithNewPassword extends BaseUser {
  newPassword: string;
}

export interface ResetBody {
  newPassword: string;
  reset_token: string;
}

export interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
  role: string;
}
