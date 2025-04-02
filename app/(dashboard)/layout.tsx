// src/app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { User } from "lucide-react";

type UserData = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    async function getUserData() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get current page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/inventory") return "Inventory Items";
    if (pathname === "/dashboard/borrowing") return "Borrowing Records";
    if (pathname === "/dashboard/people") return "People";
    if (pathname === "/dashboard/damage") return "Damage Reports";
    if (pathname === "/dashboard/logs") return "System Logs";
    if (pathname === "/dashboard/settings") return "Settings";
    
    // Handle dynamically for subpages
    if (pathname?.startsWith("/dashboard/inventory/")) return "Inventory Details";
    if (pathname?.startsWith("/dashboard/borrowing/")) return "Borrowing Details";
    if (pathname?.startsWith("/dashboard/people/")) return "Person Details";
    if (pathname?.startsWith("/dashboard/damage/")) return "Damage Details";
    
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 hidden md:inline">
                  {user?.fullName}
                </span>
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {user?.fullName?.charAt(0) || <User size={18} />}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}