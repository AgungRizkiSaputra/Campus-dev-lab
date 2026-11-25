'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  User,
  Lock,
  Mail,
  Phone,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import { registerNewUser } from '@/lib/auth';

function RegisterFormContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !whatsappNumber || !password) {
      toast({
        type: 'error',
        title: 'Formulir Belum Lengkap',
        message: 'Mohon lengkapi seluruh kolom yang bertanda bintang (*).',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        type: 'error',
        title: 'Kata Sandi Terlalu Pendek',
        message: 'Kata sandi minimal terdiri dari 6 karakter.',
      });
      return;
    }

    let cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    setIsLoading(true);
    setStatusText('Mendaftarkan akun mahasiswa...');

    try {
      await new Promise((r) => setTimeout(r, 350));

      const result = registerNewUser({
        name: fullName,
        email,
        password,
        role: 'buyer',
        phone: cleanPhone,
        university,
        faculty,
        major,
      });

      if (!result.success || !result.user) {
        toast({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: result.message || 'Gagal membuat akun. Silakan coba lagi.',
        });
        setIsLoading(false);
        setStatusText(null);
        return;
      }

      setIsLoading(false);
      setStatusText(null);
      setIsSuccess(true);
      toast({
        type: 'success',
        title: 'Pendaftaran Berhasil',
        message: `Akun Anda telah berhasil dibuat. Silakan masuk ke akun Anda.`,
      });
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

  if (isSuccess) {
    return (
      <div className="w-full max-w-lg space-y-7 text-left relative animate-in fade-in">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-sm">
              <GraduationCap className="h-7 w-7 text-emerald-400" />
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-extrabold text-forest-950 tracking-tight">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.16em]">
            Akun Mahasiswa Anda Siap Digunakan
          </p>
        </div>

        <Card className="border-emerald-200 shadow-elevated bg-white rounded-3xl p-6 text-center space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800 mx-auto">
            <ShieldCheck className="h-9 w-9 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Selamat Datang, {fullName}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Akun Anda dengan email <strong className="text-forest-900">{email}</strong> telah terdaftar secara resmi di sistem Jokiskripsiku.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-100 text-xs text-forest-900 leading-relaxed text-left space-y-1">
            <p className="font-semibold text-forest-950">Langkah Terakhir:</p>
            <p className="text-forest-800">
              Silakan klik tombol di bawah untuk menuju halaman login, lalu masukkan kata sandi yang Anda buat tadi untuk masuk ke dashboard mahasiswa.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/login?registered=true&email=${encodeURIComponent(email)}`)}
            className="w-full rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold h-12 shadow-md transition-all active:scale-[0.98]"
          >
            Masuk ke Akun Anda <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-7 text-left relative">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-7 w-7 text-emerald-400" />
          </div>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-forest-950 tracking-tight">
            Daftar Akun Mahasiswa
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.16em] mt-1">
            Jokiskripsiku &bull; Platform Tugas &amp; Skripsi Terpercaya
          </p>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="rounded-2xl border border-forest-200 bg-forest-50/90 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest-950">
              Pendaftaran Klien &amp; Mahasiswa
            </h2>
            <p className="text-xs text-forest-800 leading-relaxed">
              Buat akun untuk memesan layanan tugas kuliah, sempro, skripsi tuntas, dan uji Turnitin. Transaksi dilindungi garansi Rekber BCA resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Card */}
      <Card className="border-gray-200 shadow-elevated bg-white rounded-3xl p-2">
        <CardContent className="space-y-5 pt-6 px-6 pb-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Contoh: Dimas Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10 h-11 rounded-xl"
                  autoFocus
                />
                <User className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="nama@kampus.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="081234567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                  <Phone className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Asal Kampus / Universitas
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Contoh: Universitas Indonesia, ITB, UNY, dll."
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 rounded-xl"
                />
                <BookOpen className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Fakultas
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Ilmu Komputer"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Program Studi / Jurusan
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Sistem Informasi"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Kata Sandi Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
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

            {/* Instant Feedback Notice */}
            {statusText && (
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
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Sedang Mendaftarkan...' : 'Daftar Akun Mahasiswa'}
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Login Navigation Link */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-600">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-forest-800 hover:text-forest-950 underline underline-offset-4">
            Masuk ke Akun Anda &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF8] py-16 sm:py-24">
      <Suspense fallback={<div className="text-xs text-gray-400">Memuat formulir pendaftaran...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
