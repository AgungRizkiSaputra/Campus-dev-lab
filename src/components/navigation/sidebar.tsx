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
  GraduationCap,
  Sparkles,
  MessageCircle,
  Users,
} from 'lucide-react';

interface SidebarProps {
  role?: 'buyer' | 'seller' | 'admin';
}

export function Sidebar({ role = 'buyer' }: SidebarProps) {
  const pathname = usePathname();

  const buyerLinks = [
    { href: '/buyer', label: 'Dashboard Progres', icon: LayoutDashboard },
    { href: '/buyer/create-project', label: 'Pesan Layanan Baru', icon: FilePlus },
    { href: '/buyer/projects', label: 'Pesanan Saya', icon: FolderKanban },
  ];

  const sellerLinks = [
    { href: '/seller', label: 'Dashboard Tim Inti', icon: LayoutDashboard },
    { href: '/seller/explore', label: 'Antrean Pesanan', icon: Search },
    { href: '/seller/my-bids', label: 'Tugas Dikerjakan', icon: FolderKanban },
    { href: '/seller/portfolio', label: 'Portofolio Tim', icon: Sparkles },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Ringkasan Sistem', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Pengguna & Penjoki', icon: Users },
    { href: '/admin/payments', label: 'Verifikasi Rekber', icon: CreditCard },
    { href: '/admin/kyc-queue', label: 'Antrean KYC', icon: ShieldCheck },
    { href: '/admin/arbitration', label: 'Arbitrase Sengketa', icon: Gavel },
  ];

  const links = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : buyerLinks;

  return (
    <aside className="hidden lg:flex w-[260px] min-w-[260px] max-w-[260px] flex-shrink-0 flex-col border-r border-gray-200 bg-white fixed inset-y-0 left-0 z-30">
      {/* Brand Header (80px height to match navbar) */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm flex-shrink-0">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="text-left overflow-hidden">
          <h2 className="font-serif text-lg font-bold tracking-tight text-forest-950 truncate">
            Jokiskripsiku
          </h2>
          <p className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase truncate">
            @jokiskripsiku.tng
          </p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 mt-5 rounded-xl bg-forest-50/90 p-3.5 border border-forest-200 flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">Peran Akun</p>
          <p className="text-xs font-bold capitalize text-forest-950 truncate">
            {role === 'seller' ? 'Tim Pengerja (Joki Inti)' : role === 'admin' ? 'Administrator' : 'Mahasiswa (Klien)'}
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-forest-700 flex-shrink-0" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 px-4 py-5 text-left overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/buyer' &&
              link.href !== '/seller' &&
              link.href !== '/admin' &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200',
                isActive
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-forest-50/70 hover:text-forest-900'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Direct WhatsApp Assistance */}
      <div className="p-4 border-t border-gray-100 text-left">
        <a
          href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20mau%20tanya%20bantuan%20tugas"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-900 transition-colors hover:bg-emerald-100/70"
        >
          <MessageCircle className="h-4 w-4 text-emerald-700 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">Bantuan WhatsApp</p>
            <p className="text-[10px] text-emerald-700 truncate">Chat langsung ke tim kami</p>
          </div>
        </a>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 text-forest-700 flex-shrink-0" />
          <span className="truncate">Sistem Rekber 100% Amanah</span>
        </div>
      </div>
    </aside>
  );
}
