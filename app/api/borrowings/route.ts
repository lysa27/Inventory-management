// src/app/api/borrowings/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

// Get all borrowings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isOverdue = searchParams.get('isOverdue');
    const activeOnly = searchParams.get('activeOnly');
    
    // Build simple filter conditions for MVP
    const where: any = {};
    
    if (isOverdue === 'true') {
      where.isOverdue = true;
    }
    
    if (activeOnly === 'true') {
      where.returnDate = null;
    }
    
    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        item: true,
        borrower: true,
        assignedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        borrowDate: 'desc',
      },
    });
    
    return NextResponse.json(borrowings);
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    return NextResponse.json(
      { message: "Failed to fetch borrowings" },
      { status: 500 }
    );
  }
}

// Create new borrowing (only for Inventory Managers)
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
      itemId, 
      borrowerId, 
      borrowDate, 
      expectedReturnDate, 
      initialCondition 
    } = await request.json();
    
    // Validate required fields
    if (!itemId || !borrowerId || !borrowDate || !expectedReturnDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Check if item exists and is available
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    
    if (!item) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }
    
    if (item.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Item is not available for borrowing" },
        { status: 400 }
      );
    }
    
    // Check if borrower exists
    const borrower = await prisma.person.findUnique({
      where: { id: borrowerId },
    });
    
    if (!borrower) {
      return NextResponse.json(
        { message: "Borrower not found" },
        { status: 404 }
      );
    }
    
    // Create transaction to update both item and create borrowing
    const [newBorrowing] = await prisma.$transaction([
      // Create the borrowing record
      prisma.borrowing.create({
        data: {
          itemId,
          borrowerId,
          assignedById: user.userId,
          borrowDate: new Date(borrowDate),
          expectedReturnDate: new Date(expectedReturnDate),
          initialCondition: initialCondition || "GOOD",
        },
      }),
      
      // Update the item status to BORROWED
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { status: "BORROWED" },
      }),
    ]);
    
    // Log the action
    await createSystemLog(
      user.userId, 
      `Assigned item ${item.name} to ${borrower.fullName}`
    );
    
    return NextResponse.json(newBorrowing, { status: 201 });
  } catch (error) {
    console.error("Error creating borrowing:", error);
    return NextResponse.json(
      { message: "Failed to create borrowing record" },
      { status: 500 }
    );
  }
}
