
// @ts-nocheck
// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { isAuth } = await isAuthenticated(request);
    
    if (!isAuth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get inventory stats by status
    const itemsByStatus = await prisma.inventoryItem.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
    
    // Get inventory stats by category
    const itemsByCategory = await prisma.inventoryItem.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });
    
    // Get items that are currently borrowed
    const activeBorrowingsCount = await prisma.borrowing.count({
      where: {
        returnDate: null,
      },
    });
    
    // Get overdue items
    const overdueItemsCount = await prisma.borrowing.count({
      where: {
        isOverdue: true,
        returnDate: null,
      },
    });
    
    // Get damaged items pending repair
    const damagedItemsCount = await prisma.damageReport.count({
      where: {
        repairStatus: "PENDING",
      },
    });
    
    // Format the status counts for easy frontend consumption
    const statusCounts = {};
    itemsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });
    
    // Format the category counts
    const categoryCounts = {};
    itemsByCategory.forEach((item) => {
      categoryCounts[item.category] = item._count.category;
    });
    
    return NextResponse.json({
      itemsByStatus: statusCounts,
      itemsByCategory: categoryCounts,
      activeBorrowings: activeBorrowingsCount,
      overdueItems: overdueItemsCount,
      damagedItems: damagedItemsCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch inventory statistics" },
      { status: 500 }
    );
  }
}