'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, GraduationCap, User, LogOut, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    isVerified?: boolean;
    avatarUrl?: string | null;
  } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();

  const profileMenuItems = [
    {
      label: 'Profil Pengguna',
      icon: <User className="h-4 w-4" />,
      onClick: () => (window.location.href = '/profile'),
    },
    {
      label: 'Mode Mahasiswa (Klien)',
      icon: <GraduationCap className="h-4 w-4" />,
      onClick: () => (window.location.href = '/buyer'),
    },
    {
      label: 'Mode Tim Inti (Pengerja)',
      icon: <Sparkles className="h-4 w-4" />,
      onClick: () => (window.location.href = '/seller'),
    },
    {
      label: 'Mode Administrator',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => (window.location.href = '/admin'),
    },
    {
      label: 'Keluar',
      icon: <LogOut className="h-4 w-4" />,
      onClick: onLogout || (() => {}),
      danger: true,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-gray-200/80 bg-white/95 backdrop-blur-md px-6 lg:px-8">
      {/* Mobile Brand */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-xs">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-serif text-base font-bold text-forest-950">Jokiskripsiku</span>
      </div>

      {/* Desktop Quick Role View Switcher */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-surface-muted border border-gray-200 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">Akses Portal:</span>
        <Link
          href="/buyer"
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            user?.role === 'buyer'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          )}
        >
          Mahasiswa (Klien)
        </Link>
        <Link
          href="/seller"
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            user?.role === 'seller'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          )}
        >
          Tim Inti (Joki)
        </Link>
        <Link
          href="/admin"
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            user?.role === 'admin'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          )}
        >
          Admin Rekber
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative rounded-full p-2 text-gray-500 hover:bg-forest-50 hover:text-forest-800 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-burgundy-600 ring-2 ring-white" />
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-gray-900">{user.name}</span>
                {user.isVerified && (
                  <Badge variant="forest" size="sm">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-gray-400 capitalize font-medium">
                {user.role === 'admin' ? 'Administrator' : user.role === 'seller' ? 'Tim Pengerja' : 'Mahasiswa'}
              </p>
            </div>

            <DropdownMenu
              trigger={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-xs font-bold text-white shadow-sm ring-2 ring-forest-100 cursor-pointer">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              }
              items={profileMenuItems}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-forest-800 hover:text-forest-950 px-3 py-1.5"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-forest-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-forest-800 shadow-sm transition-all"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
