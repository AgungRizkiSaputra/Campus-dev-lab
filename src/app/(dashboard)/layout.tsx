'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock current user for foundation test - defaults to buyer, can be toggled
  const [currentUser] = useState<{
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    isVerified: boolean;
  }>({
    name: 'Dimas Pratama',
    email: 'dimas.pratama@kampus.ac.id',
    role: 'buyer',
    isVerified: true,
  });

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Desktop Sidebar (Fixed Left) */}
      <Sidebar role={currentUser.role} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
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
