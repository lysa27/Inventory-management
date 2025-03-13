// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on this page
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const showToast = () => {
    toast("Welcome to Inventory Management System!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">XYZ Inventory System</h1>
          <div className="space-x-4">
            <Button variant="outline" className='text-black' onClick={handleLogin}>
              Login
            </Button>
            <Button onClick={handleRegister}>
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Inventory Management System</h2>
          <p className="text-xl mb-8 text-gray-600">
            A comprehensive system for tracking and managing organizational assets and materials.
          </p>
          <div className="space-y-4">
            <Button size="lg" onClick={handleLogin} className="mr-4">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={showToast}>
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Item Tracking</h3>
            <p className="text-gray-600">Track individual items throughout their lifecycle, from acquisition to disposal.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Borrowing Management</h3>
            <p className="text-gray-600">Manage borrowing and assignment of items to staff and trainees.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Damage Reporting</h3>
            <p className="text-gray-600">Report and track damaged items through repair or disposal processes.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 border-t">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2025 XYZ Organization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}