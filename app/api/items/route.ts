// src/app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

// Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Build filter conditions
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}

// Create new inventory item (only for Inventory Managers)
export async function POST(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated(request);
    
    if (!isAuth || user?.role !== "INVENTORY_MANAGER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const { name, category, serialNumber, condition } = await request.json();
    
    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { message: "Name and category are required" },
        { status: 400 }
      );
    }
    
    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { serialNumber },
      });
      
      if (existingItem) {
        return NextResponse.json(
          { message: "Serial number already exists" },
          { status: 409 }
        );
      }
    }
    
    // Create new item
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        serialNumber: serialNumber || null,
        condition: condition || "NEW",
      },
    });
    
    // Log the action
    await createSystemLog(user.userId, `Created new inventory item: ${name}`);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}