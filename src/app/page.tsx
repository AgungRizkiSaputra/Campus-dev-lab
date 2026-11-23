import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  FileCheck2,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted text-gray-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-6 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-forest-800 text-white shadow-sm">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-forest-900 block leading-tight">
              Joki Skripsi
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700">
              Safe-Haven Academic Ecosystem
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <a href="#keamanan" className="hover:text-forest-800 transition-colors">Sistem Rekber</a>
          <a href="#layanan" className="hover:text-forest-800 transition-colors">Layanan Legal</a>
          <a href="#verifikasi" className="hover:text-forest-800 transition-colors">Verifikasi KYC</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Mulai Sekarang</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 lg:px-16 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-surface-muted to-forest-50/30 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50/80 px-4 py-1.5 text-xs font-semibold text-forest-800 shadow-sm">
            <Sparkles className="h-4 w-4 text-forest-700" />
            <span>Marketplace Pendampingan Akademik Terkurasi Pertama di Indonesia</span>
          </div>

          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-forest-950 sm:text-5xl lg:text-6xl leading-tight">
            Selesaikan Skripsi dengan Rasa Tenang, Bebas Penipuan.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed font-sans">
            Jembatan profesional antara mahasiswa dan konsultan akademik terverifikasi. Transaksi aman dilindungi 
            <strong className="text-forest-900"> Sistem Escrow (Rekber)</strong> dan garansi bebas plagiarisme.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/buyer/create-project">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Posting Kebutuhan Skripsi <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/seller/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Daftar Jadi Joki Terverifikasi
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-gray-200/80 mt-12 text-left">
            <div>
              <p className="font-serif text-3xl font-bold text-forest-900">0%</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Risiko Scam (Escrow)</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-forest-900">100%</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Joki Lolos KYC & Portofolio</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-forest-900">&lt; 48 Jam</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Resolusi Arbitrase Admin</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-forest-900">AES-256</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Enkripsi Portal Dokumen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Escrow Mechanism */}
      <section id="keamanan" className="px-6 py-20 lg:px-16 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <Badge variant="forest">Mekanisme Rekber Unggulan</Badge>
            <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Bagaimana Dana Anda Terlindungi?
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Tidak ada pembayaran penuh di muka yang langsung diterima pihak ketiga tanpa hasil kerja nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-left border-forest-100 bg-forest-50/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-forest-800 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>1. Dana Ditahan di Escrow</CardTitle>
              <CardDescription className="mt-2">
                Mahasiswa mentransfer deposit per milestone bab ke rekening penampungan resmi platform. Dana berstatus <strong>HELD</strong>.
              </CardDescription>
            </Card>

            <Card className="text-left border-forest-100 bg-forest-50/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-burgundy-700 text-white">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <CardTitle>2. Pengerjaan & Cek Turnitin</CardTitle>
              <CardDescription className="mt-2">
                Joki mengerjakan bab skripsi dan wajib menyertakan laporan plagiarisme terverifikasi sebelum draf diajukan.
              </CardDescription>
            </Card>

            <Card className="text-left border-forest-100 bg-forest-50/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-forest-700 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>3. Rilis Dana Setelah ACC</CardTitle>
              <CardDescription className="mt-2">
                Mahasiswa memiliki 3 hari untuk review. Dana baru dicairkan ke rekening Joki setelah disetujui (Approved).
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section id="layanan" className="px-6 py-20 lg:px-16 bg-surface-muted">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <Badge variant="burgundy">Batasan Etis & Legal</Badge>
            <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Cakupan Layanan Akademik Profesional
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Platform fokus pada asistensi riset, bimbingan, dan penyempurnaan karya ilmiah orisinil mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                title: 'Konsultasi Akademik',
                desc: 'Bimbingan penentuan topik, rumusan masalah, dan kerangka teori penelitian.',
              },
              {
                title: 'Asistensi Metodologi',
                desc: 'Pendampingan analisis data kuantitatif (SPSS/R) atau kualitatif (Nvivo).',
              },
              {
                title: 'Proofreading & Editing',
                desc: 'Penyelarasan tata bahasa ilmiah sesuai kaidah EYD dan pedoman kampus.',
              },
              {
                title: 'Formatting & Sitasi',
                desc: 'Standardisasi format margin, tabel, dan manajemen sitasi (Mendeley/Zotero).',
              },
            ].map((srv, i) => (
              <Card key={i} className="p-5">
                <CheckCircle className="h-5 w-5 text-forest-700 mb-3" />
                <h3 className="font-serif font-bold text-base text-gray-900">{srv.title}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{srv.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12 lg:px-16 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-forest-800 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-serif text-base font-bold text-forest-900">Joki Skripsi</span>
        </div>
        <p className="max-w-md mx-auto">
          Ekosistem terkurasi yang menjamin keamanan finansial dan keunggulan akademik mahasiswa Indonesia.
        </p>
        <p className="mt-6 text-gray-400">
          &copy; 2026 PT Joki Skripsi Indonesia. Seluruh hak cipta dilindungi undang-undang.
        </p>
      </footer>
    </div>
  );
}
