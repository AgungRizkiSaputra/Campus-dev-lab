'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
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
        message: 'Mohon lengkapi seluruh data yang bertanda bintang.',
      });
      return;
    }

    let cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    setIsLoading(true);
    try {
      // All public registrations are strictly for Mahasiswa / Klien (Buyer)
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
          title: 'Pendaftaran Gagal',
          message: error.message,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Pendaftaran Berhasil',
        message: 'Kode verifikasi keamanan telah dikirimkan ke WhatsApp Anda.',
      });

      router.push(`/verify-otp?userId=${data.user?.id}&role=buyer&phone=${encodeURIComponent(cleanPhone)}`);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF8] py-16 sm:py-24">
      <div className="w-full max-w-lg space-y-7">
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
              Jokiskripsiku &bull; Solusi Tugas &amp; Skripsi Amanah
            </p>
          </div>
        </div>

        {/* Exclusive Team Trust Notice */}
        <div className="rounded-2xl border border-forest-200 bg-forest-50/90 p-4 text-left shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest-950">
                Pengerjaan Langsung oleh Tim Ahli Inti
              </h2>
              <p className="text-xs text-forest-800 leading-relaxed">
                Pesanan Anda ditangani langsung oleh tim internal kami (bebas calo liar). Pembayaran aman di Rekber resmi BCA (8801928371 a.n PT Joki Skripsi Indonesia) dan dilengkapi garansi revisi bebas biaya.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="border-gray-200 shadow-elevated bg-white rounded-3xl p-2">
          <CardContent className="pt-6 px-6 pb-6 text-left">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nama Lengkap Mahasiswa"
                placeholder="Contoh: Dimas Pratama"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  helperText="Untuk notifikasi progres tugas"
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

              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Informasi Kampus &amp; Jurusan
                </p>
                <div className="space-y-3">
                  <Input
                    label="Universitas / Institut"
                    placeholder="Contoh: Universitas Indonesia / UGM"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Fakultas"
                      placeholder="Contoh: Teknik / Ekonomi"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                    />
                    <Input
                      label="Jurusan / Program Studi"
                      placeholder="Contoh: Informatika / Manajemen"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="w-full rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold py-3 shadow-sm transition-all"
                  isLoading={isLoading}
                >
                  Daftar &amp; Lanjutkan ke Verifikasi <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-500">
          Sudah memiliki akun terdaftar?{' '}
          <Link href="/login" className="font-bold text-forest-900 hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
