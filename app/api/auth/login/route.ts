// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return Response.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1d" }
    );

    // Log the successful login (using console for now)
    console.log(`User login successful: ${user.fullName} (${user.email}) at ${new Date().toISOString()}`);

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "An error occurred during login" }, { status: 500 });
  }
}