'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { authenticateUser } from '@/lib/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectUrl = searchParams.get('redirect');
  const isJustRegistered = searchParams.get('registered') === 'true';
  const prefilledEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        type: 'error',
        title: 'Input Belum Lengkap',
        message: 'Mohon masukkan email dan kata sandi Anda.',
      });
      return;
    }

    setIsLoading(true);
    setStatusText('Memverifikasi data akun...');

    try {
      await new Promise((r) => setTimeout(r, 300));

      const result = authenticateUser(email, password);

      if (!result.success || !result.user) {
        toast({
          type: 'error',
          title: 'Gagal Masuk',
          message: result.message || 'Email atau kata sandi tidak sesuai. Silakan coba lagi.',
        });
        setIsLoading(false);
        setStatusText(null);
        return;
      }

      const user = result.user;
      
      // Start smooth login transition animation
      setIsAuthenticating(true);
      toast({
        type: 'success',
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${user.name}.`,
      });

      // Target route logic with delay for smooth animation
      setTimeout(() => {
        if (redirectUrl && user.role === 'buyer') {
          router.push(redirectUrl);
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'seller') {
          router.push('/seller');
        } else {
          router.push('/buyer');
        }
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan sistem';
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message,
      });
      setIsLoading(false);
      setStatusText(null);
    }
  };

  return (
    <div className="w-full max-w-md space-y-7 text-left relative">
      {/* Sleek Fullscreen Login Transition Animation Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-950/90 backdrop-blur-md text-white animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center space-y-5 p-8 max-w-sm">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-forest-900 border border-emerald-500/30 text-white shadow-2xl animate-pulse">
                <GraduationCap className="h-9 w-9 text-emerald-400" />
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-emerald-500/20 blur-md -z-10 animate-ping opacity-60" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
                Memverifikasi Akun
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                Mempersiapkan dashboard dan sesi aman Anda...
              </p>
            </div>

            {/* Animated Loading Bar */}
            <div className="w-48 h-1.5 bg-forest-900/80 rounded-full overflow-hidden border border-emerald-500/30">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full animate-pulse w-full transition-all duration-1000" />
            </div>
          </div>
        </div>
      )}

      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-7 w-7 text-emerald-400" />
          </div>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-forest-950 tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.16em] mt-1">
            Jokiskripsiku &bull; Solusi Tugas &amp; Skripsi Amanah
          </p>
        </div>
      </div>

      {/* Main Single Login Form */}
      <Card className="border-gray-200 shadow-elevated bg-white rounded-3xl p-2">
        <CardContent className="space-y-5 pt-6 px-6 pb-6">
          {isJustRegistered && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 animate-in fade-in">
              <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold">Pendaftaran Berhasil!</strong>
                Akun Anda telah aktif dibuat. Silakan masukkan kata sandi untuk masuk.
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="nama@kampus.ac.id atau email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isAuthenticating}
                  required
                  className="pl-10 h-11 rounded-xl"
                  autoFocus
                />
                <Mail className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-forest-800 hover:text-forest-950 hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi akun Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isAuthenticating}
                  required
                  className="pl-10 pr-10 h-11 rounded-xl"
                />
                <Lock className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 absolute right-3.5 top-3.5 p-0.5 rounded transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Instant Click / Loading Feedback Notice */}
            {statusText && !isAuthenticating && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 font-medium animate-pulse">
                <div className="h-2 w-2 rounded-full bg-forest-700 animate-ping" />
                <span>{statusText}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold h-12 shadow-md transition-all active:scale-[0.98]"
              isLoading={isLoading || isAuthenticating}
              disabled={isLoading || isAuthenticating}
            >
              {isLoading || isAuthenticating ? 'Sedang Memproses...' : 'Masuk ke Akun'}
              {!isLoading && !isAuthenticating && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Registration & Help Links */}
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-600">
          Belum memiliki akun?{' '}
          <Link href="/register" className="font-bold text-forest-800 hover:text-forest-950 underline underline-offset-4">
            Daftar Akun Mahasiswa &rarr;
          </Link>
        </p>
        <p className="text-[11px] text-gray-400">
          Mengalami kendala masuk?{' '}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20butuh%20bantuan%20login%20di%20Jokiskripsiku"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline font-semibold"
          >
            Hubungi CS WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF8] py-16 sm:py-24">
      <Suspense fallback={<div className="text-xs text-gray-400">Memuat halaman login...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
