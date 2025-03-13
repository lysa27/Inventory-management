// src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

export type JWTPayload = {
  userId: string;
  role: string;
  email: string;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePasswords(
  providedPassword: string,
  storedHash: string
): Promise<boolean> {
  return await bcrypt.compare(providedPassword, storedHash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated(
  request: NextRequest
): Promise<{ isAuth: boolean; user?: JWTPayload }> {
  // Get token from cookies or Authorization header
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return { isAuth: false };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { isAuth: false };
  }

  return { isAuth: true, user: decoded };
}

export async function createSystemLog(userId: string, actionType: string) {
  await prisma.systemLog.create({
    data: {
      userId,
      actionType,
    },
  });
}

export function checkPermission(userRole: string, requiredRole: string): boolean {
  // Simple role check - can be expanded for more complex permission systems
  if (requiredRole === "INVENTORY_MANAGER" && userRole !== "INVENTORY_MANAGER") {
    return false;
  }
  return true;
}