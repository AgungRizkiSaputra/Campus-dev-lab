'use client';

import React from 'react';
import Link from 'next/link';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, GraduationCap, User, LogOut, FileText, Sparkles } from 'lucide-react';

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
  const profileMenuItems = [
    {
      label: 'Profil Pengguna',
      icon: <User className="h-4 w-4" />,
      onClick: () => window.location.href = '/profile',
    },
    {
      label: 'Ketentuan Layanan',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => window.location.href = '/terms',
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

      {/* Desktop Clean Breadcrumb / Status */}
      <div className="hidden lg:flex items-center gap-2 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-bold text-forest-900">
          <Sparkles className="h-3.5 w-3.5 text-forest-700" />
          <span>Jokiskripsiku Portal</span>
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Layanan Resmi Tim Inti
        </span>
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
              <p className="text-[11px] text-gray-400 capitalize">{user.role === 'buyer' ? 'Mahasiswa (Klien)' : user.role}</p>
            </div>

            <DropdownMenu
              trigger={
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white shadow-sm ring-2 ring-forest-100 cursor-pointer">
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
              className="rounded-full bg-forest-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-forest-700 shadow-sm transition-all"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
