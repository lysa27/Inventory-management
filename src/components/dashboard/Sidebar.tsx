// src/components/dashboard/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UserData = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Define navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      active: pathname === "/dashboard",
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: <Package size={20} />,
      active: pathname === "/dashboard/inventory" || pathname?.startsWith("/dashboard/inventory/"),
    },
    {
      name: "Borrowing",
      href: "/dashboard/borrowing",
      icon: <FileSpreadsheet size={20} />,
      active: pathname === "/dashboard/borrowing" || pathname?.startsWith("/dashboard/borrowing/"),
    },
    {
      name: "People",
      href: "/dashboard/people",
      icon: <Users size={20} />,
      active: pathname === "/dashboard/people" || pathname?.startsWith("/dashboard/people/"),
    },
    {
      name: "Damage Reports",
      href: "/dashboard/damage",
      icon: <AlertTriangle size={20} />,
      active: pathname === "/dashboard/damage" || pathname?.startsWith("/dashboard/damage/"),
    },
  ];

  // Admin only navigation items
  const adminItems = [
    {
      name: "System Logs",
      href: "/dashboard/logs",
      icon: <FileText size={20} />,
      active: pathname === "/dashboard/logs" || pathname?.startsWith("/dashboard/logs/"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
      active: pathname === "/dashboard/settings" || pathname?.startsWith("/dashboard/settings/"),
    },
  ];

  if (loading) {
    return (
      <div className="w-64 bg-gray-900 h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const renderNavLink = (item: any) => (
    <Link 
      key={item.name}
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        item.active 
          ? "bg-gray-800 text-white" 
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );

  const renderCollapsedNavLink = (item: any) => (
    <TooltipProvider key={item.name}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link 
            href={item.href}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-md transition-colors",
              item.active 
                ? "bg-gray-800 text-white" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            {item.icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Mobile sidebar
  if (mobileOpen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Mobile sidebar */}
        <div className="relative flex flex-col w-80 max-w-sm bg-gray-900 text-white h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Inventory System</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </Button>
          </div>
          
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.fullName?.charAt(0) || <User size={20} />}
              </div>
              <div>
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-gray-400">
                  {user?.role === "INVENTORY_MANAGER" ? "Inventory Manager" : "Program Manager"}
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-1">
              {navigationItems.map(renderNavLink)}
            </div>
            
            {user?.role === "INVENTORY_MANAGER" && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Admin
                </h3>
                {adminItems.map(renderNavLink)}
              </div>
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-700">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-2" />
                Log Out
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 mt-2"
                onClick={() => router.push("/profile")}
              >
                <User size={20} className="mr-2" />
                Profile
              </Button>
            </div>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-gray-900 text-white hover:bg-gray-800"
      >
        <Menu size={20} />
      </Button>
      
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && <h2 className="text-lg font-semibold">Inventory System</h2>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "text-gray-400 hover:text-white",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
        
        {!collapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.fullName?.charAt(0) || <User size={20} />}
              </div>
              <div>
                <p className="font-medium truncate">{user?.fullName}</p>
                <p className="text-sm text-gray-400 truncate">
                  {user?.role === "INVENTORY_MANAGER" ? "Inventory Manager" : "Program Manager"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <nav className={cn(
          "flex-1 overflow-y-auto p-2 space-y-6",
          collapsed && "flex flex-col items-center"
        )}>
          <div className={cn(
            "space-y-1",
            collapsed && "flex flex-col items-center w-full gap-1"
          )}>
            {collapsed 
              ? navigationItems.map(renderCollapsedNavLink)
              : navigationItems.map(renderNavLink)
            }
          </div>
          
          {user?.role === "INVENTORY_MANAGER" && (
            <div className={cn(
              "space-y-1",
              collapsed && "flex flex-col items-center w-full gap-1"
            )}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Admin
                </h3>
              )}
              {collapsed 
                ? adminItems.map(renderCollapsedNavLink)
                : adminItems.map(renderNavLink)
              }
            </div>
          )}
          
          <div className={cn(
            "pt-4 mt-4 border-t border-gray-700",
            collapsed && "flex flex-col items-center w-full"
          )}>
            {collapsed ? (
              <>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-800 mb-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Log Out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => router.push("/profile")}
                      >
                        <User size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <LogOut size={20} className="mr-2" />
                  Log Out
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 mt-2"
                  onClick={() => router.push("/profile")}
                >
                  <User size={20} className="mr-2" />
                  Profile
                </Button>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}