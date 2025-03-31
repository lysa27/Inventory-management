// lib/auth.ts
import prisma from "@/lib/db";
import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define an interface for your JWT payload
interface MyJwtPayload extends JwtPayload {
  id: number | string;
  email?: string;
  role?: string;
}

// Helper function to log authentication without creating a SystemLog
function logAuthentication(user: any) {
  console.log(`User authenticated: ${user.fullName} (${user.email}) at ${new Date().toISOString()}`);
}

// Add the missing hashPassword function
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function isAuthenticated(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return { isAuth: false, user: null };
    }
    
    // Type the decoded token properly
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as MyJwtPayload;
    
    // Now TypeScript knows decoded.id exists
    const userId = String(decoded.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Use string ID
    });
    
    if (!user) {
      return { isAuth: false, user: null };
    }
    
    // Log authentication to console instead of database
    logAuthentication(user);
    
    return {
      isAuth: true,
      user
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { isAuth: false, user: null };
  }
}

// If you need to create logs elsewhere, use this function
export function createSystemLog(userId: number | string, logMessage: string) {
  // Just log to console for now
  console.log(`SYSTEM LOG [User ID: ${userId}]: ${logMessage}`);
}