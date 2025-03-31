// src/app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <div className="flex h-screen items-center justify-center mt-16">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 pt-16"> {/* Add pt-16 to account for navbar height */}
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white h-[calc(100vh-4rem)] sticky top-16"> {/* Adjust top to account for navbar */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/dashboard" 
                className={`block px-4 py-2 rounded-md ${
                  pathname === "/dashboard" 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/inventory" 
                className={`block px-4 py-2 rounded-md ${
                  pathname === "/dashboard/inventory" 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Inventory Items
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/borrowing" 
                className={`block px-4 py-2 rounded-md ${
                  pathname === "/dashboard/borrowing" 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Borrowing Records
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/people" 
                className={`block px-4 py-2 rounded-md ${
                  pathname === "/dashboard/people" 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                People
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/damage" 
                className={`block px-4 py-2 rounded-md ${
                  pathname === "/dashboard/damage" 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Damage Reports
              </Link>
            </li>
          </ul>
        </nav>
        
        {user?.role === "INVENTORY_MANAGER" && (
          <div className="mt-8 px-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Admin</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard/logs" 
                  className={`block px-4 py-2 rounded-md ${
                    pathname === "/dashboard/logs" 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  System Logs
                </Link>
              </li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10 sticky top-16"> {/* Adjust top to account for navbar */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/dashboard/inventory" && "Inventory Items"}
              {pathname === "/dashboard/borrowing" && "Borrowing Records"}
              {pathname === "/dashboard/people" && "People"}
              {pathname === "/dashboard/damage" && "Damage Reports"}
              {pathname === "/dashboard/logs" && "System Logs"}
            </h1>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.fullName} ({user?.role === "INVENTORY_MANAGER" ? "Admin" : "Program Manager"})
              </span>
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