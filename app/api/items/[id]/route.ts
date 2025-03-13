// src/app/api/items/[id]/route.ts
// This file would be created in a separate file, but showing here for completeness
// src/app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = params.id;
      
      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
          borrowings: {
            include: {
              borrower: true,
            },
          },
          damageReports: {
            include: {
              reportedBy: true,
            },
          },
        },
      });
      
      if (!item) {
        return NextResponse.json(
          { message: "Item not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(item);
    } catch (error) {
      console.error("Error fetching item detail:", error);
      return NextResponse.json(
        { message: "Failed to fetch item details" },
        { status: 500 }
      );
    }
  }
  
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
      const { name, category, serialNumber, condition, status } = await request.json();
      
      // Check if item exists
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id },
      });
      
      if (!existingItem) {
        return NextResponse.json(
          { message: "Item not found" },
          { status: 404 }
        );
      }
      
      // Check if serial number is already used by another item
      if (serialNumber && serialNumber !== existingItem.serialNumber) {
        const itemWithSameSerial = await prisma.inventoryItem.findUnique({
          where: { serialNumber },
        });
        
        if (itemWithSameSerial && itemWithSameSerial.id !== id) {
          return NextResponse.json(
            { message: "Serial number already exists on another item" },
            { status: 409 }
          );
        }
      }
      
      // Update item
      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: {
          name: name || undefined,
          category: category || undefined,
          serialNumber: serialNumber || null,
          condition: condition || undefined,
          status: status || undefined,
        },
      });
      
      // Log the action
      await createSystemLog(user.userId, `Updated inventory item: ${updatedItem.name}`);
      
      return NextResponse.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      return NextResponse.json(
        { message: "Failed to update inventory item" },
        { status: 500 }
      );
    }
  }
  
  export async function DELETE(
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
      
      // Check if item exists
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id },
      });
      
      if (!existingItem) {
        return NextResponse.json(
          { message: "Item not found" },
          { status: 404 }
        );
      }
      
      // Check if item is currently borrowed
      const activeBorrowing = await prisma.borrowing.findFirst({
        where: {
          itemId: id,
          returnDate: null,
        },
      });
      
      if (activeBorrowing) {
        return NextResponse.json(
          { message: "Cannot delete an item that is currently borrowed" },
          { status: 400 }
        );
      }
      
      // Delete associated records first
      await prisma.damageReport.deleteMany({
        where: { itemId: id },
      });
      
      await prisma.borrowing.deleteMany({
        where: { itemId: id },
      });
      
      // Delete the item
      await prisma.inventoryItem.delete({
        where: { id },
      });
      
      // Log the action
      await createSystemLog(user.userId, `Deleted inventory item: ${existingItem.name}`);
      
      return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      return NextResponse.json(
        { message: "Failed to delete inventory item" },
        { status: 500 }
      );
    }
  }