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
  Gavel,
  ShieldCheck,
  CreditCard,
  History,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  role?: 'buyer' | 'seller' | 'admin';
}

export function Sidebar({ role = 'buyer' }: SidebarProps) {
  const pathname = usePathname();

  const buyerLinks = [
    { href: '/buyer', label: 'Dashboard Progres', icon: LayoutDashboard },
    { href: '/buyer/create-project', label: 'Posting Kebutuhan', icon: FilePlus },
    { href: '/buyer/projects', label: 'Proyek Saya', icon: FolderKanban },
  ];

  const sellerLinks = [
    { href: '/seller', label: 'Dashboard Joki', icon: LayoutDashboard },
    { href: '/seller/explore', label: 'Bursa Penawaran', icon: Search },
    { href: '/seller/my-bids', label: 'Penawaran Saya', icon: FolderKanban },
    { href: '/seller/kyc', label: 'Verifikasi KYC', icon: ShieldCheck },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Ringkasan Sistem', icon: LayoutDashboard },
    { href: '/admin/payments', label: 'Verifikasi Rekber', icon: CreditCard },
    { href: '/admin/kyc-queue', label: 'Antrean KYC', icon: ShieldCheck },
    { href: '/admin/arbitration', label: 'Arbitrase Sengketa', icon: Gavel },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: History },
  ];

  const links = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : buyerLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white fixed inset-y-0 left-0 z-30">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-forest-800 text-white shadow-sm">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-forest-900 leading-tight">
            Joki Skripsi
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-burgundy-700">
            Safe-Haven Academic
          </p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 mt-4 rounded-md bg-forest-50 p-3 border border-forest-100 flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">Peran Aktif</p>
          <p className="text-xs font-semibold capitalize text-forest-900">
            {role === 'seller' ? 'Penyedia Layanan (Joki)' : role === 'admin' ? 'Administrator' : 'Mahasiswa (Klien)'}
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-forest-700" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-4 py-4 text-left">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                isActive
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-forest-50/60 hover:text-forest-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-gray-400')} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Trust & Escrow Badge */}
      <div className="p-4 border-t border-gray-100">
        <div className="rounded-md bg-surface-muted p-3 text-left">
          <div className="flex items-center gap-1.5 text-forest-800">
            <ShieldCheck className="h-4 w-4 text-forest-700" />
            <span className="text-xs font-bold uppercase tracking-wider">Escrow Rekber Aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
            Transaksi terlindungi garansi 100% aman hingga draf disetujui.
          </p>
        </div>
      </div>
    </aside>
  );
}
