import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  FilePlus,
  Clock,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  History,
  FileCheck2,
  MessageSquare,
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
  MessageCircle,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const stats = [
    { label: 'Pesanan Aktif', value: '1 Proyek', icon: FolderKanban, color: 'text-forest-800' },
    { label: 'Tahapan Pengerjaan', value: 'Bab 3: Metodologi', icon: Clock, color: 'text-amber-600' },
    { label: 'Dana Diamankan Rekber', value: 'Rp 1.500.000', icon: CreditCard, color: 'text-forest-800' },
    { label: 'Tim Pengerja', value: 'Tim Jokiskripsiku', icon: ShieldCheck, color: 'text-emerald-600' },
  ];

  const quickServices = [
    { name: 'Sempro', tag: '1', href: '/buyer/create-project?service=SEMPRO' },
    { name: 'Skripsi', tag: '2', href: '/buyer/create-project?service=SKRIPSI' },
    { name: 'Tugas Kuliah', tag: '3', href: '/buyer/create-project?service=TUGAS' },
    { name: 'UTS / UAS', tag: '4', href: '/buyer/create-project?service=UTS_UAS' },
    { name: 'Makalah', tag: '5', href: '/buyer/create-project?service=MAKALAH' },
    { name: 'PPT Sidang', tag: '6', href: '/buyer/create-project?service=PPT' },
    { name: 'Web & Aplikasi', tag: '7', href: '/buyer/create-project?service=WEBSITE_APP' },
    { name: 'Undangan Digital', tag: '8', href: '/buyer/create-project?service=UNDANGAN_DIGITAL' },
    { name: 'Cek Plagiasi', tag: '9', href: '/buyer/create-project?service=CEK_PLAGIASI' },
    { name: 'Turunin Plagiasi', tag: '10', href: '/buyer/create-project?service=TURUNIN_PLAGIASI' },
  ];

  const recentActivities = [
    {
      time: '1 jam yang lalu',
      title: 'Draf Bab 3 & Turnitin 9% Diunggah',
      desc: 'Tim Jokiskripsiku telah mengunggah draf pengerjaan beserta hasil uji Turnitin.',
      link: '/buyer/projects/demo-1/milestones',
    },
    {
      time: '1 hari yang lalu',
      title: 'Deposit Rekber Rp 1.500.482 Diverifikasi',
      desc: 'Status dana telah HELD di rekening bersama resmi BCA a.n PT Joki Skripsi Indonesia.',
      link: '/buyer/projects/demo-1/payment',
    },
    {
      time: '3 hari yang lalu',
      title: 'Pesanan Diterima oleh Tim Inti',
      desc: 'Pesanan skripsi telah diverifikasi dan masuk antrean pengerjaan prioritas.',
      link: '/buyer/projects/demo-1',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-bold text-forest-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-forest-700" />
            <span>Dashboard Mahasiswa Jokiskripsiku</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Selamat Datang di Ruang Kerja Anda
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pantau progres pengerjaan tugas, hasil Turnitin, dan pelepasan dana rekber langsung dengan tim kami.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20mau%20tanya%20progres%20tugas%20saya"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="md">
              <MessageCircle className="h-4 w-4 mr-1.5 text-emerald-600" /> WhatsApp Tim
            </Button>
          </a>
          <Link href="/buyer/create-project">
            <Button variant="primary" size="md" className="font-bold shadow-sm">
              <FilePlus className="h-4 w-4 mr-1.5" /> Pesan Layanan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick 10 Services Shortcut Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-forest-700" />
            10 Layanan Jokiskripsiku — Pesan Cepat:
          </span>
          <Link href="/buyer/create-project" className="text-[11px] font-bold text-forest-800 hover:underline">
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {quickServices.map((qs) => (
            <Link
              key={qs.name}
              href={qs.href}
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-surface-muted/60 px-3 py-1.5 font-semibold text-gray-700 hover:border-forest-600 hover:bg-forest-50 hover:text-forest-900 transition-colors"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-800 text-[9px] font-bold text-white">
                {qs.tag}
              </span>
              <span>{qs.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Project Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Pesanan Sedang Dikerjakan</h2>
          <Link href="/buyer/projects" className="text-xs font-bold text-forest-800 hover:underline">
            Lihat Semua Pesanan &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="forest">IN_PROGRESS</Badge>
                <span className="text-xs text-gray-500 font-medium">Teknik Informatika &bull; Skripsi Lengkap</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Pengembangan Model Deteksi Anomali Jaringan Berbasis Deep Learning
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/shared/chat/demo-1">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1 text-emerald-600" /> Chat Tim Pengerja
                </Button>
              </Link>
              <Link href="/buyer/projects/demo-1">
                <Button variant="primary" size="sm" className="font-bold">
                  Buka Rincian <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <ProgressBar progress={60} label="Keseluruhan Progres Pengerjaan" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Pengerja Tugas</span>
                <p className="font-bold text-gray-900 mt-1">Tim Inti Jokiskripsiku</p>
                <p className="text-gray-500 text-[11px]">Bebas calo &bull; Komunikasi 1 pintu</p>
              </div>

              <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Tahap Saat Ini</span>
                <p className="font-bold text-gray-900 mt-1">Bab 3: Desain &amp; Metodologi Riset</p>
                <Link href="/buyer/projects/demo-1/milestones" className="text-amber-800 text-[11px] font-bold hover:underline block mt-0.5">
                  Tinjau Draf Bab &amp; Turnitin 9% &rarr;
                </Link>
              </div>

              <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Status Dana Rekber</span>
                <p className="font-bold text-gray-900 mt-1">Rp 1.500.000 HELD</p>
                <Link href="/buyer/projects/demo-1/payment" className="text-emerald-700 text-[11px] font-bold hover:underline block mt-0.5">
                  Lihat Riwayat Rekber &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Aktivitas Terkini</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="space-y-4">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-800 flex-shrink-0 mt-0.5">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-gray-900 font-semibold">{act.title}</strong>
                      <span className="text-[10px] text-gray-400">{act.time}</span>
                    </div>
                    <p className="text-gray-600 mt-0.5">{act.desc}</p>
                    <Link href={act.link} className="text-forest-800 font-bold hover:underline inline-block mt-1">
                      Buka Rincian &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exclusive Team Guarantee Notice */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Keamanan Layanan</h2>
          <div className="rounded-2xl border border-forest-200 bg-forest-50/60 p-5 text-xs text-gray-700 space-y-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-forest-900 font-bold uppercase text-[10px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Garansi 100% Anti-Tipu</span>
            </div>
            <p className="leading-relaxed">
              Seluruh pesanan Anda dikerjakan langsung oleh <strong>Tim Inti Jokiskripsiku</strong> tanpa melibatkan pihak ketiga. Dana aman di rekening bersama (BCA 8801928371 a.n PT Joki Skripsi Indonesia) hingga Anda menyetujui hasil.
            </p>
            <div className="pt-1">
              <span className="font-bold text-forest-800 text-[11px]">#TugasBeresKamiPuas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
