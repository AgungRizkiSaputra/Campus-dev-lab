'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { GraduationCap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

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
      // All public registrations are strictly Klien/Mahasiswa (Buyer)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'buyer',
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
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-800 text-white shadow-md">
              <GraduationCap className="h-7 w-7" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
            Daftar Akun Klien
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Jokiskripsiku • Solusi Tugas & Skripsi Amanah
          </p>
        </div>

        {/* Exclusive Team Trust Notice */}
        <div className="rounded-xl border border-forest-200 bg-forest-50/80 p-4 text-left shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-forest-800 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Pengerjaan Langsung oleh Tim Ahli Inti
              </h2>
              <p className="text-xs text-forest-800 mt-1 leading-relaxed">
                Semua pesanan Anda dikerjakan langsung oleh tim konsultan internal kami (tanpa perantara/calo liar). Transaksi dilindungi garansi revisi & sistem Rekber 100% amanah.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="border-gray-200 shadow-elevated bg-white">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nama Lengkap Mahasiswa"
                placeholder="Contoh: Dimas Pratama"
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
                  label="Nomor WhatsApp (Aktif)"
                  placeholder="08123456789"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  helperText="Format: 08xx / 628xx untuk notifikasi progres"
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
                  placeholder="Contoh: UGM / UI"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
                <Input
                  label="Fakultas"
                  placeholder="Contoh: Teknik"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
                <Input
                  label="Jurusan / Prodi"
                  placeholder="Informatika"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" size="lg" type="submit" className="w-full font-bold" isLoading={isLoading}>
                  Daftar & Lanjutkan ke Verifikasi <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          Sudah memiliki akun terdaftar?{' '}
          <Link href="/login" className="font-bold text-forest-800 hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
