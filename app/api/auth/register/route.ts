// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSystemLog } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, phoneNumber, role } = await request.json();

    // Validate input
    if (!fullName || !email || !password || !phoneNumber || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phoneNumber,
        role: role === "INVENTORY_MANAGER" ? "INVENTORY_MANAGER" : "PROGRAM_MANAGER",
      },
    });

    // Log the registration
    await createSystemLog(user.id, "User registered");

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}