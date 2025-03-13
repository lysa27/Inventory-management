
// src/app/api/borrowings/[id]/return/route.ts - For returning items

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated, createSystemLog } from "@/lib/auth";


export async function POST(
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
      
      const borrowingId = params.id;
      const { returnCondition } = await request.json();
      
      // Check if borrowing exists
      const borrowing = await prisma.borrowing.findUnique({
        where: { id: borrowingId },
        include: { item: true },
      });
      
      if (!borrowing) {
        return NextResponse.json(
          { message: "Borrowing record not found" },
          { status: 404 }
        );
      }
      
      if (borrowing.returnDate) {
        return NextResponse.json(
          { message: "This item has already been returned" },
          { status: 400 }
        );
      }
      
      // Determine if the item was damaged during borrowing
      const wasDamaged = returnCondition === "BROKEN" || returnCondition === "WORN_OUT";
      const newItemStatus = wasDamaged ? "DAMAGED" : "AVAILABLE";
      
      // Update both the borrowing record and the item status
      const [updatedBorrowing] = await prisma.$transaction([
        // Update the borrowing record
        prisma.borrowing.update({
          where: { id: borrowingId },
          data: {
            returnDate: new Date(),
            returnCondition,
          },
        }),
        
        // Update the item status
        prisma.inventoryItem.update({
          where: { id: borrowing.itemId },
          data: {
            status: newItemStatus,
            condition: returnCondition,
          },
        }),
      ]);
      
      // Log the action
      await createSystemLog(
        user.userId, 
        `Returned item ${borrowing.item.name} in ${returnCondition} condition`
      );
      
      return NextResponse.json(updatedBorrowing);
    } catch (error) {
      console.error("Error returning item:", error);
      return NextResponse.json(
        { message: "Failed to process item return" },
        { status: 500 }
      );
    }
  }