import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export type UserRole = "user" | "director" | "admin";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: UserRole;
    userEmail?: string;
    needsPasswordSetup?: boolean;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(allowedRoles?: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (allowedRoles && !allowedRoles.includes(req.session.userRole!)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

export function getCurrentUser(req: Request) {
  return {
    id: req.session.userId,
    role: req.session.userRole,
    email: req.session.userEmail,
    needsPasswordSetup: req.session.needsPasswordSetup,
  };
}
