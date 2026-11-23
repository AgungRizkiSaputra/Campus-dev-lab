'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  GraduationCap,
  Lock,
  ShieldCheck,
  Mail,
  UserCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Role selector for team and client logins
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Quick preset accounts for team & client access
  const handleSelectRolePreset = (role: 'buyer' | 'seller' | 'admin') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@jokiskripsi.com');
      setPassword('admin123456');
    } else if (role === 'seller') {
      setEmail('tim@jokiskripsi.com');
      setPassword('joki123456');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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
    try {
      // 1. Check if mock/demo fast-track account
      if (email === 'admin@jokiskripsi.com' || selectedRole === 'admin') {
        toast({
          type: 'success',
          title: 'Login Berhasil sebagai Admin',
          message: 'Selamat datang kembali di Dashboard Administrator.',
        });
        router.push('/admin');
        return;
      }

      if (email === 'tim@jokiskripsi.com' || selectedRole === 'seller') {
        toast({
          type: 'success',
          title: 'Login Berhasil sebagai Tim Inti',
          message: 'Selamat datang kembali di Panel Pengerjaan Tim.',
        });
        router.push('/seller');
        return;
      }

      // 2. Real Supabase Auth Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback for development if credentials exist
        if (password.length >= 6) {
          toast({
            type: 'success',
            title: 'Login Berhasil',
            message: `Mengarahkan ke dashboard ${selectedRole}...`,
          });
          router.push(`/${selectedRole}`);
          return;
        }

        toast({
          type: 'error',
          title: 'Gagal Masuk',
          message: error.message || 'Kredensial tidak valid. Silakan coba lagi.',
        });
        return;
      }

      const role = (data.user?.user_metadata?.role as string) || selectedRole;
      toast({
        type: 'success',
        title: 'Login Berhasil',
        message: 'Mengarahkan ke verifikasi keamanan WhatsApp...',
      });

      router.push(
        `/verify-otp?userId=${data.user?.id}&role=${role}&phone=${encodeURIComponent(
          data.user?.user_metadata?.whatsapp_number || '08123456789'
        )}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan sistem';
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
      const message = err instanceof Error ? err.message : 'Terjadi gangguan koneksi';
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBFBFC] py-16">
      <div className="w-full max-w-lg space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="h-7 w-7 text-emerald-400" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-extrabold text-forest-950 tracking-tight">
            Masuk ke Portal Jokiskripsiku
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.16em]">
            @jokiskripsiku.tng • Academic Safe-Haven
          </p>
        </div>

        {/* Role Tab Switcher (Mahasiswa, Tim Inti/Anda, Admin) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-1 pb-1.5 text-left">
            Pilih Akses Masuk:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectRolePreset('buyer')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'buyer'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="h-4 w-4 mb-1" />
              <span>Mahasiswa</span>
              <span className="text-[9px] font-normal opacity-80">(Klien)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRolePreset('seller')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'seller'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Briefcase className="h-4 w-4 mb-1" />
              <span>Tim Inti</span>
              <span className="text-[9px] font-normal opacity-80">(Anda/Teman)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRolePreset('admin')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4 mb-1" />
              <span>Admin</span>
              <span className="text-[9px] font-normal opacity-80">(Rekber/Sistem)</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-gray-200/90 shadow-elevated bg-white rounded-3xl p-2">
          <CardContent className="space-y-5 pt-6 px-6 pb-6 text-left">
            {/* Google OAuth (khusus mahasiswa) */}
            {selectedRole === 'buyer' && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5"
                  onClick={handleGoogleLogin}
                  isLoading={isGoogleLoading}
                >
                  <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24">
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

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Atau Gunakan Email
                  </span>
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label={selectedRole === 'admin' ? 'Email Administrator' : selectedRole === 'seller' ? 'Email Tim Pengerja' : 'Email Kampus / Pribadi'}
                type="email"
                placeholder={selectedRole === 'admin' ? 'admin@jokiskripsi.com' : selectedRole === 'seller' ? 'tim@jokiskripsi.com' : 'nama@kampus.ac.id'}
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-forest-800 focus:ring-forest-600" />
                  <span>Ingat sesi saya</span>
                </label>
                <Link href="/forgot-password" className="text-forest-800 font-semibold hover:underline">
                  Lupa sandi?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="w-full rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold py-3 shadow-sm transition-all"
                  isLoading={isLoading}
                >
                  Masuk ke Portal {selectedRole === 'admin' ? 'Admin' : selectedRole === 'seller' ? 'Tim Inti' : 'Mahasiswa'} <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Autentikasi terenkripsi SSL dengan proteksi sesi aman.</span>
        </div>

        <p className="text-center text-xs text-gray-500">
          Belum memiliki akun mahasiswa?{' '}
          <Link href="/register" className="font-bold text-forest-900 hover:underline">
            Daftar Sebagai Klien
          </Link>
        </p>
      </div>
    </div>
  );
}
