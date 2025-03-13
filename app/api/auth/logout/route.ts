// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get authentication status
    const { isAuth, user } = await isAuthenticated(request);

    // Delete the token cookie
    (await
          // Delete the token cookie
          cookies()).delete("token");

    // Log the logout if authenticated
    if (isAuth && user) {
      await createSystemLog(user.userId, "User logged out");
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}