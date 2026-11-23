'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !whatsappNumber || !password) {
      toast({
        type: 'error',
        title: 'Formulir Belum Lengkap',
        message: 'Mohon isi seluruh data yang diwajibkan.',
      });
      return;
    }

    // Format phone
    let cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            whatsapp_number: cleanPhone,
            university,
            faculty,
            major,
          },
        },
      });

      if (error) {
        toast({
          type: 'error',
          title: 'Registrasi Gagal',
          message: error.message,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Pendaftaran Berhasil',
        message: 'Kode OTP 2FA telah dikirim ke WhatsApp Anda.',
      });

      router.push(`/verify-otp?userId=${data.user?.id}&phone=${encodeURIComponent(cleanPhone)}`);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-muted py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-800 text-white shadow-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-forest-950">Daftar Akun Baru</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Bergabung ke Safe-Haven Academic Marketplace
          </p>
        </div>

        {/* Role Selector Card */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex flex-col items-center justify-center p-4 rounded-md border text-center transition-all ${
              role === 'buyer'
                ? 'border-forest-800 bg-forest-50/80 text-forest-900 shadow-sm ring-1 ring-forest-800'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <BookOpen className="h-6 w-6 mb-2 text-forest-800" />
            <span className="text-xs font-bold uppercase tracking-wider">Mahasiswa (Klien)</span>
            <span className="text-[10px] text-gray-500 mt-1">Butuh asistensi & bimbingan</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`flex flex-col items-center justify-center p-4 rounded-md border text-center transition-all ${
              role === 'seller'
                ? 'border-burgundy-700 bg-burgundy-50/80 text-burgundy-900 shadow-sm ring-1 ring-burgundy-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Briefcase className="h-6 w-6 mb-2 text-burgundy-700" />
            <span className="text-xs font-bold uppercase tracking-wider">Joki (Penyedia Jasa)</span>
            <span className="text-[10px] text-gray-500 mt-1">Wajib verifikasi KYC KTP</span>
          </button>
        </div>

        <Card className="border-forest-100/60 shadow-elevated">
          <CardContent className="pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nama Lengkap Sesuai Identitas"
                placeholder="Contoh: Dimas Pratama, S.Kom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Aktif"
                  type="email"
                  placeholder="nama@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Nomor WhatsApp (Untuk 2FA)"
                  placeholder="08123456789"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  helperText="Format: 08xx / 628xx"
                  required
                />
              </div>

              <Input
                label="Kata Sandi (Minimal 8 Karakter)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Universitas / Kampus"
                  placeholder="UGM / UI / ITB"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
                <Input
                  label="Fakultas"
                  placeholder="Teknik / Ekonomi"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
                <Input
                  label="Jurusan / Prodi"
                  placeholder="Teknik Informatika"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" size="md" type="submit" className="w-full" isLoading={isLoading}>
                  Lanjutkan ke Verifikasi WhatsApp 2FA
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          Sudah memiliki akun terdaftar?{' '}
          <Link href="/login" className="font-semibold text-forest-800 hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
