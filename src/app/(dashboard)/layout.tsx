'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { getActiveSession, clearActiveSession, type AuthUser } from '@/lib/auth';
import { LogOut, ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Strictly verify active authenticated session
    const session = getActiveSession();

    if (!session || !session.role) {
      // Not logged in -> kick out to login immediately
      setCurrentUser(null);
      setIsCheckingAuth(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Strict Role-Based Access Control (RBAC) Verification
    // A regular user cannot simply type /admin or /seller into the URL
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
      setAuthError(
        'Akses Ditolak (403): Halaman ini memiliki proteksi keamanan tinggi dan hanya dapat diakses oleh Administrator Platform resmi.'
      );
      setIsCheckingAuth(false);
      setTimeout(() => {
        router.replace(`/${session.role}`);
      }, 2000);
      return;
    }

    if (pathname.startsWith('/seller') && session.role !== 'seller' && session.role !== 'admin') {
      setAuthError(
        'Akses Ditolak (403): Halaman ini khusus diperuntukkan bagi Tim Mitra Penjoki terverifikasi.'
      );
      setIsCheckingAuth(false);
      setTimeout(() => {
        router.replace(`/${session.role}`);
      }, 2000);
      return;
    }

    if (pathname.startsWith('/buyer') && session.role !== 'buyer' && session.role !== 'admin') {
      setAuthError('Mengarahkan ke dashboard yang sesuai dengan peran akun Anda...');
      setIsCheckingAuth(false);
      setTimeout(() => {
        router.replace(`/${session.role}`);
      }, 1500);
      return;
    }

    // Role verified and authorized
    setCurrentUser(session);
    setAuthError(null);
    setIsCheckingAuth(false);
  }, [pathname, router]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      clearActiveSession();
      toast({
        type: 'info',
        title: 'Berhasil Keluar',
        message: 'Anda telah keluar dari akun dengan aman.',
      });
      window.location.href = '/';
    }, 1200);
  };

  // 1. Loading/Checking state while session is verified
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] text-gray-500 space-y-3">
        <div className="h-7 w-7 rounded-full border-2 border-forest-800 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-gray-400">
          Memverifikasi Otorisasi Akses...
        </p>
      </div>
    );
  }

  // 2. Access Denied (403 Security Screen): Shown if a user tries to access /admin or /seller without permission
  if (authError || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 shadow-elevated space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-widest">
              403 Unauthorized
            </span>
            <h1 className="font-serif text-2xl font-bold text-gray-950">
              Akses Dibatasi Sistem
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              {authError || 'Anda harus masuk terlebih dahulu untuk mengakses halaman ini.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (currentUser) {
                  router.replace(`/${currentUser.role}`);
                } else {
                  router.replace('/login');
                }
              }}
              className="w-full rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentUser ? 'Kembali ke Dashboard Saya' : 'Ke Halaman Login'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted relative">
      {/* Sleek Logout Transition Animation Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md text-white animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center space-y-5 p-8 max-w-sm">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-900 border border-gray-700 text-white shadow-2xl animate-pulse">
                <LogOut className="h-8 w-8 text-amber-400" />
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-amber-400/20 blur-md -z-10 animate-ping opacity-60" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
                Mengakhiri Sesi Akun
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Membersihkan data sesi aman dan mengembalikan Anda ke halaman utama...
              </p>
            </div>

            <div className="w-48 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full animate-pulse w-full transition-all duration-1000" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Fixed Left 260px) - Sourced STRICTLY from authenticated session role */}
      <Sidebar role={currentUser.role} />

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Header user={currentUser} onLogout={handleLogout} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav role={currentUser.role} />
    </div>
  );
}
