// src/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Head from 'next/head';
import { Loader2, Package, ClipboardList, AlertCircle } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');
  const showToast = () => toast("Welcome to Inventory Management System!");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin text-slate-900 h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Inventory Management System</title>
        <meta name="description" content="Manage your inventory easily with our comprehensive system." />
      </Head>

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 to-gray-800 text-white py-5 px-6 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wide">XYZ Inventory System</h1>
            <div className="space-x-4">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black" onClick={handleLogin}>
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRegister}>
                Register
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow container mx-auto px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text mb-6">
              Smart Inventory Management
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Track, manage, and organize your inventory seamlessly with our modern and intuitive platform.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleLogin}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={showToast}>
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-10 mt-20">
            <div className="p-6 border rounded-lg shadow-lg hover:shadow-xl transition duration-300 bg-white">
              <Package className="text-blue-600 h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Item Tracking</h3>
              <p className="text-gray-600">Monitor assets from acquisition to disposal with real-time updates.</p>
            </div>

            <div className="p-6 border rounded-lg shadow-lg hover:shadow-xl transition duration-300 bg-white">
              <ClipboardList className="text-green-600 h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Borrowing Management</h3>
              <p className="text-gray-600">Easily track borrowed and assigned items to staff and trainees.</p>
            </div>

            <div className="p-6 border rounded-lg shadow-lg hover:shadow-xl transition duration-300 bg-white">
              <AlertCircle className="text-red-600 h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Damage Reporting</h3>
              <p className="text-gray-600">Quickly report and track damaged items for repair or disposal.</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6 mt-10">
          <div className="container mx-auto text-center text-gray-400">
            <p>© {new Date().getFullYear()} XYZ Organization. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
