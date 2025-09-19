'use client';
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Skip authentication check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip authentication check for login page
    if (isLoginPage) {
      setIsAuthenticated(true); // Set to true to avoid loading state on login page
      return;
    }

    const checkAuth = async () => {
      try {
        // Try to make an authenticated request to verify access
        const response = await axios.get('http://localhost:8080/api/v1/admin/dashboard', {
          withCredentials: true,
        });
        
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  // For login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}