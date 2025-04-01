// src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from "lucide-react";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    async function getUserData() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [pathname]); // Re-fetch when path changes

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if we're on the dashboard
  const isDashboard = pathname && pathname.startsWith("/dashboard");
  
  // Don't show the navbar on dashboard pages as they have their own sidebar
  if (isDashboard) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-gray-800 text-white py-5 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          XYZ Inventory System
        </Link>
        
        {/* Mobile menu toggle */}
        <button 
          className="lg:hidden text-white" 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link 
            href="/" 
            className={`text-white hover:text-blue-200 ${pathname === "/" ? "border-b-2 border-blue-400" : ""}`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`text-white hover:text-blue-200 ${pathname === "/about" ? "border-b-2 border-blue-400" : ""}`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`text-white hover:text-blue-200 ${pathname === "/contact" ? "border-b-2 border-blue-400" : ""}`}
          >
            Contact
          </Link>
          
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
                      <User className="mr-2 h-4 w-4" />
                      {user.fullName || "Profile"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      User Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="space-x-4">
                  <Button 
                    variant="outline" 
                    className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900" 
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  <Button 
                    className="bg-white text-gray-900 hover:bg-blue-100" 
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-90 flex flex-col pt-20 px-6">
            <button 
              className="absolute top-5 right-6 text-white" 
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            
            <Link 
              href="/" 
              className={`text-white text-xl py-4 border-b border-gray-700 ${pathname === "/" ? "text-blue-400" : ""}`}
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={`text-white text-xl py-4 border-b border-gray-700 ${pathname === "/about" ? "text-blue-400" : ""}`}
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-white text-xl py-4 border-b border-gray-700 ${pathname === "/contact" ? "text-blue-400" : ""}`}
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
            
            {!loading && (
              <div className="mt-6">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full mb-4 justify-start bg-transparent text-white border-white"
                      onClick={() => {
                        router.push("/dashboard");
                        toggleMobileMenu();
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full mb-4 justify-start bg-transparent text-white border-white"
                      onClick={() => {
                        router.push("/profile");
                        toggleMobileMenu();
                      }}
                    >
                      User Profile
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent text-white border-white" 
                      onClick={() => {
                        router.push("/login");
                        toggleMobileMenu();
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      className="w-full bg-white text-gray-900" 
                      onClick={() => {
                        router.push("/register");
                        toggleMobileMenu();
                      }}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}