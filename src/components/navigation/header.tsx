'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  GraduationCap,
  User,
  LogOut,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  X,
} from 'lucide-react';
import { getAppNotifications, markAllNotificationsAsRead, AppNotification } from '@/lib/notifications';

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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const syncNotifs = () => {
      setNotifications(getAppNotifications());
    };
    syncNotifs();
    window.addEventListener('joki_notifications_updated', syncNotifs);
    return () => window.removeEventListener('joki_notifications_updated', syncNotifs);
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileMenuItems = [
    {
      label: 'Profil Pengguna',
      icon: <User className="h-4 w-4" />,
      onClick: () => (window.location.href = '/profile'),
    },
    {
      label: 'Bantuan WhatsApp',
      icon: <MessageCircle className="h-4 w-4 text-emerald-600" />,
      onClick: () => window.open('https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku', '_blank'),
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

      {/* Desktop Brand Subtitle */}
      <div className="hidden lg:flex items-center gap-2.5 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-bold text-forest-900">
          <Sparkles className="h-3.5 w-3.5 text-forest-700" />
          <span>Jokiskripsiku</span>
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-medium text-gray-500">
          Solusi Tugas &amp; Skripsi Anda — Selesai, Cepat, &amp; Amanah
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Interactive Notification Bell Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative rounded-full p-2.5 text-gray-500 hover:bg-forest-50 hover:text-forest-800 transition-colors ${
              isNotifOpen ? 'bg-forest-50 text-forest-900' : ''
            }`}
            aria-label="Buka Notifikasi"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-burgundy-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-gray-900">Pemberitahuan</h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-burgundy-100 text-burgundy-800 text-[10px] font-bold">
                      {unreadCount} Baru
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Semua Terbaca
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-forest-800 hover:text-forest-950 hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">Belum ada pemberitahuan baru.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 transition-colors hover:bg-gray-50 flex items-start gap-3 ${
                        !n.read ? 'bg-forest-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {n.type === 'payment' ? (
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                          </div>
                        ) : n.type === 'kyc' ? (
                          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
                            <FileCheck2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>

                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-burgundy-600 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">
                  Sistem Pemantauan Transaksi Rekber &bull; Jokiskripsiku
                </span>
              </div>
            </div>
          )}
        </div>

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
