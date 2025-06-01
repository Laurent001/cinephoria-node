import { BaseUser, UserWithNewPassword } from "../../interfaces/auth";

declare global {
  namespace Express {
    interface Request {
      user?: BaseUser | UserWithNewPassword | DecodedToken;
    }
  }
}

export {};
