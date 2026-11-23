'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FilePlus,
  FolderKanban,
  Search,
  ShieldCheck,
  CreditCard,
  User,
} from 'lucide-react';

interface BottomNavProps {
  role?: 'buyer' | 'seller' | 'admin';
}

export function BottomNav({ role = 'buyer' }: BottomNavProps) {
  const pathname = usePathname();

  const buyerTabs = [
    { href: '/buyer', label: 'Progres', icon: LayoutDashboard },
    { href: '/buyer/create-project', label: 'Posting', icon: FilePlus },
    { href: '/buyer/projects', label: 'Proyek', icon: FolderKanban },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  const sellerTabs = [
    { href: '/seller', label: 'Beranda', icon: LayoutDashboard },
    { href: '/seller/explore', label: 'Bursa', icon: Search },
    { href: '/seller/my-bids', label: 'Penawaran', icon: FolderKanban },
    { href: '/seller/kyc', label: 'KYC', icon: ShieldCheck },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  const adminTabs = [
    { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/admin/payments', label: 'Rekber', icon: CreditCard },
    { href: '/admin/kyc-queue', label: 'KYC', icon: ShieldCheck },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'seller' ? sellerTabs : buyerTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white/95 backdrop-blur-md px-2 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-colors',
              isActive ? 'text-forest-800' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive ? 'text-forest-800 stroke-[2.2]' : 'text-gray-400')} />
            <span className="text-[10px] font-semibold tracking-wide uppercase">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
