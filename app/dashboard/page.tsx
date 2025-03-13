// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type StatsData = {
  itemsByStatus: Record<string, number>;
  itemsByCategory: Record<string, number>;
  activeBorrowings: number;
  overdueItems: number;
  damagedItems: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        toast.error("Error loading dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.itemsByStatus?.AVAILABLE || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Borrowed Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.itemsByStatus?.BORROWED || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Borrowings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.activeBorrowings || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 text-red-500">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats?.overdueItems || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Available</span>
                <span className="font-medium">{stats?.itemsByStatus?.AVAILABLE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Borrowed</span>
                <span className="font-medium">{stats?.itemsByStatus?.BORROWED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Damaged</span>
                <span className="font-medium">{stats?.itemsByStatus?.DAMAGED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Disposed</span>
                <span className="font-medium">{stats?.itemsByStatus?.DISPOSED || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Item Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Devices</span>
                <span className="font-medium">{stats?.itemsByCategory?.DEVICE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Furniture</span>
                <span className="font-medium">{stats?.itemsByCategory?.FURNITURE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cleaning Materials</span>
                <span className="font-medium">{stats?.itemsByCategory?.CLEANING_MATERIAL || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Food Utensils</span>
                <span className="font-medium">{stats?.itemsByCategory?.FOOD_UTENSIL || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/inventory"}>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Add, update, and track inventory items</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/borrowing"}>
          <CardHeader>
            <CardTitle>Borrowing Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage item assignments and returns</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/damage"}>
          <CardHeader>
            <CardTitle>Damage Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">View and manage damaged items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}