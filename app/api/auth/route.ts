import prisma from "@/lib/db";
import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    console.log("Received PATCH request");
    
    const { isAuth, user } = await isAuthenticated(request);
    console.log("Authentication status:", isAuth, "User:", user);
    
    if (!isAuth || user?.role !== "INVENTORY_MANAGER") {
      console.error("Unauthorized access attempt by:", user);
      return Response.json({ message: "Unauthorized" }, { status: 403 });
    }
    
    const requestData = await request.json();
    
    // Parse borrowingId as string
    const borrowingId = String(requestData.borrowingId || "");
    
    if (!borrowingId) {
      console.error("Invalid borrowing ID format:", requestData.borrowingId);
      return Response.json({ message: "Valid borrowing ID is required" }, { status: 400 });
    }
    
    const returnCondition = requestData.returnCondition;
    console.log("Borrowing ID:", borrowingId, "Return Condition:", returnCondition);
    
    // Validate returnCondition if provided
    const validConditions = ["GOOD", "FAIR", "POOR", "DAMAGED"]; // Adjust based on your actual enum values
    const finalCondition = returnCondition
      ? (validConditions.includes(returnCondition) ? returnCondition : "GOOD")
      : "GOOD";
    
    // Use a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowing.findUnique({
        where: { id: borrowingId },
        include: { item: true },
      });
      
      if (!borrowing || borrowing.returnDate) {
        throw new Error("Invalid or already returned borrowing");
      }
      
      // Update borrowing record
      const updatedBorrowing = await tx.borrowing.update({
        where: { id: borrowingId },
        data: {
          returnDate: new Date(),
          returnCondition: finalCondition,
        },
      });
      
      // Update item status
      await tx.inventoryItem.update({
        where: { id: borrowing.itemId },
        data: { status: "AVAILABLE" },
      });
      
      // Remove the system log creation for now to get the main functionality working
      
      return { borrowing, updatedBorrowing };
    });
    
    // Create a simple log entry outside the transaction
    // We'll log this manually until we fix the SystemLog issue
    console.log(`Item ${result.borrowing.item.name} (ID: ${result.borrowing.itemId}) returned by ${user.fullName} in ${finalCondition} condition`);
    
    console.log(`Item ${result.borrowing.item.name} marked as AVAILABLE`);
    console.log("Borrowing updated:", result.updatedBorrowing);
    
    return Response.json(result.updatedBorrowing);
  } catch (error: unknown) {
    console.error("Error returning item:", error);
    
    if (error instanceof Error) {
      if (error.message === "Invalid or already returned borrowing") {
        return Response.json({ message: error.message }, { status: 400 });
      }
    }
    
    return Response.json({ message: "Failed to return item" }, { status: 500 });
  }
}