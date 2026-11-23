'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { GraduationCap, Lock, ShieldCheck, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        type: 'error',
        title: 'Input Tidak Lengkap',
        message: 'Mohon masukkan email dan kata sandi Anda.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          type: 'error',
          title: 'Gagal Masuk',
          message: error.message || 'Kredensial tidak valid. Silakan coba lagi.',
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Login Berhasil',
        message: 'Mengarahkan ke verifikasi 2FA WhatsApp...',
      });

      // Redirect to WhatsApp 2FA flow
      router.push(`/verify-otp?userId=${data.user?.id}&phone=${encodeURIComponent(data.user?.user_metadata?.whatsapp_number || '08123456789')}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        toast({
          type: 'error',
          title: 'OAuth Gagal',
          message: error.message,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi';
      toast({
        type: 'error',
        title: 'OAuth Error',
        message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-muted">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-800 text-white shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-forest-950">Masuk ke Joki Skripsi</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Safe-Haven Academic Ecosystem
          </p>
        </div>

        <Card className="border-forest-100/60 shadow-elevated">
          <CardContent className="space-y-4 pt-4">
            {/* Google OAuth Button */}
            <Button
              variant="outline"
              size="md"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Akun Google
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Atau Email Resmi
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email Kampus / Pribadi"
                type="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-forest-800 focus:ring-forest-600" />
                  <span>Ingat sesi saya</span>
                </label>
                <Link href="/forgot-password" className="text-forest-800 font-semibold hover:underline">
                  Lupa sandi?
                </Link>
              </div>

              <Button variant="primary" size="md" type="submit" className="w-full" isLoading={isLoading}>
                Masuk ke Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-forest-700" />
          <span>Autentikasi terenkripsi SSL dengan 2FA WhatsApp aktif.</span>
        </div>

        <p className="text-center text-xs text-gray-500">
          Belum memiliki akun terdaftar?{' '}
          <Link href="/register" className="font-semibold text-forest-800 hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
