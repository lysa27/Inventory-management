// src/app/api/people/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

// Get all people (borrowers)
export async function GET() {
  try {
    const people = await prisma.person.findMany({
      orderBy: {
        fullName: 'asc',
      },
    });
    
    return NextResponse.json(people);
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json(
      { message: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

// Create new person (borrower)
export async function POST(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated(request);
    
    if (!isAuth || user?.role !== "INVENTORY_MANAGER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const { 
      fullName, 
      nationalId, 
      email, 
      phoneNumber, 
      residence,
      assurerName,
      assurerContact
    } = await request.json();
    
    // Validate required fields
    if (!fullName || !nationalId || !email || !phoneNumber || !residence) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }
    
    // Check if national ID already exists
    const existingPerson = await prisma.person.findUnique({
      where: { nationalId },
    });
    
    if (existingPerson) {
      return NextResponse.json(
        { message: "Person with this National ID already exists" },
        { status: 409 }
      );
    }
    
    // Create new person
    const newPerson = await prisma.person.create({
      data: {
        fullName,
        nationalId,
        email,
        phoneNumber,
        residence,
        assurerName,
        assurerContact,
      },
    });
    
    // Log the action
    await createSystemLog(
      user.userId, 
      `Added new person: ${fullName}`
    );
    
    return NextResponse.json(newPerson, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json(
      { message: "Failed to create person" },
      { status: 500 }
    );
  }
}
