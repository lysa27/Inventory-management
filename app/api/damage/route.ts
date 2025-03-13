// src/app/api/damage/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

// Get all damage reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {};
    
    if (status) {
      where.repairStatus = status;
    }
    
    const damageReports = await prisma.damageReport.findMany({
      where,
      include: {
        item: true,
        reportedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        reportedDate: 'desc',
      },
    });
    
    return NextResponse.json(damageReports);
  } catch (error) {
    console.error("Error fetching damage reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch damage reports" },
      { status: 500 }
    );
  }
}

// Create new damage report
export async function POST(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated(request);
    
    if (!isAuth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { itemId, damageReason } = await request.json();
    
    // Validate required fields
    if (!itemId || !damageReason) {
      return NextResponse.json(
        { message: "Item ID and damage reason are required" },
        { status: 400 }
      );
    }
    
    // Check if item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    
    if (!item) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }
    
    // Create damage report and update item status in a transaction
    const [newDamageReport] = await prisma.$transaction([
      // Create the damage report
      prisma.damageReport.create({
        data: {
          itemId,
          reportedById: user!.userId,
          damageReason,
          repairStatus: "PENDING",
        },
      }),
      
      // Update the item status to DAMAGED
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          status: "DAMAGED",
          condition: "BROKEN",
        },
      }),
    ]);
    
    // Log the action
    await createSystemLog(
      user!.userId, 
      `Reported damage for item: ${item.name}`
    );
    
    return NextResponse.json(newDamageReport, { status: 201 });
  } catch (error) {
    console.error("Error creating damage report:", error);
    return NextResponse.json(
      { message: "Failed to create damage report" },
      { status: 500 }
    );
  }
}

// Update damage report status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAuth, user } = await isAuthenticated(request);
    
    if (!isAuth || user?.role !== "INVENTORY_MANAGER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const id = params.id;
    const { repairStatus } = await request.json();
    
    // Check if damage report exists
    const damageReport = await prisma.damageReport.findUnique({
      where: { id },
      include: { item: true },
    });
    
    if (!damageReport) {
      return NextResponse.json(
        { message: "Damage report not found" },
        { status: 404 }
      );
    }
    
    // Determine new item status based on repair status
    let newItemStatus = "DAMAGED";
    let newItemCondition = damageReport.item.condition;
    
    if (repairStatus === "REPAIRED") {
      newItemStatus = "AVAILABLE";
      newItemCondition = "GOOD";
    } else if (repairStatus === "DISPOSED") {
      newItemStatus = "DISPOSED";
    }
    
    // Update both damage report and item status
    const [updatedDamageReport] = await prisma.$transaction([
      // Update the damage report
      prisma.damageReport.update({
        where: { id },
        data: { repairStatus },
      }),
      
      // Update the item status
      prisma.inventoryItem.update({
        where: { id: damageReport.itemId },
        data: {
          status: newItemStatus,
          condition: newItemCondition,
        },
      }),
    ]);
    
    // Log the action
    await createSystemLog(
      user.userId, 
      `Updated damage report status to ${repairStatus} for item: ${damageReport.item.name}`
    );
    
    return NextResponse.json(updatedDamageReport);
  } catch (error) {
    console.error("Error updating damage report:", error);
    return NextResponse.json(
      { message: "Failed to update damage report" },
      { status: 500 }
    );
  }
}