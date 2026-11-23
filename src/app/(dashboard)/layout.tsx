'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dynamically determine role based on active route
  const activeRole: 'buyer' | 'seller' | 'admin' = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/seller')
    ? 'seller'
    : 'buyer';

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    isVerified: boolean;
  }>({
    name:
      activeRole === 'admin'
        ? 'Administrator Platform'
        : activeRole === 'seller'
        ? 'Tim Inti Jokiskripsiku'
        : 'Dimas Pratama',
    email:
      activeRole === 'admin'
        ? 'admin@jokiskripsi.com'
        : activeRole === 'seller'
        ? 'tim@jokiskripsi.com'
        : 'dimas.pratama@kampus.ac.id',
    role: activeRole,
    isVerified: true,
  });

  useEffect(() => {
    setCurrentUser({
      name:
        activeRole === 'admin'
          ? 'Administrator Platform'
          : activeRole === 'seller'
          ? 'Tim Inti Jokiskripsiku'
          : 'Dimas Pratama',
      email:
        activeRole === 'admin'
          ? 'admin@jokiskripsi.com'
          : activeRole === 'seller'
          ? 'tim@jokiskripsi.com'
          : 'dimas.pratama@kampus.ac.id',
      role: activeRole,
      isVerified: true,
    });
  }, [activeRole]);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Desktop Sidebar (Fixed Left 260px) */}
      <Sidebar role={currentUser.role} />

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Header user={currentUser} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav role={currentUser.role} />
    </div>
  );
}
