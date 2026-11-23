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
  AlertCircle,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  History,
  FileCheck2,
  MessageSquare,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const stats = [
    { label: 'Proyek Aktif', value: '1 Proyek', icon: FolderKanban, color: 'text-forest-800' },
    { label: 'Tahapan Berjalan', value: 'Bab 3: Metodologi', icon: Clock, color: 'text-amber-600' },
    { label: 'Dana di Escrow (Rekber)', value: 'Rp 1.500.000', icon: CreditCard, color: 'text-forest-800' },
    { label: 'Status Verifikasi Akun', value: 'Terverifikasi', icon: ShieldCheck, color: 'text-emerald-600' },
  ];

  const recentActivities = [
    {
      time: '1 jam yang lalu',
      title: 'Draf Bab 3 Diserahkan oleh Joki',
      desc: 'Dr. Hendra Wijaya mengunggah draf pengerjaan beserta laporan Turnitin 9%.',
      link: '/buyer/projects/demo-1/milestones',
    },
    {
      time: '1 hari yang lalu',
      title: 'Deposit Rekber Rp 1.500.482 Diverifikasi',
      desc: 'Admin keuangan telah mencocokkan mutasi rekening dan mengamankan status HELD.',
      link: '/buyer/projects/demo-1/payment',
    },
    {
      time: '3 hari yang lalu',
      title: 'Joki Ditetapkan (Blind Bid Accepted)',
      desc: 'Anda menerima penawaran Dr. Hendra Wijaya dari bursa blind bidding.',
      link: '/buyer/projects/demo-1',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pantau progres penulisan bab, penawaran bid masuk, dan pelepasan dana rekber.
          </p>
        </div>

        <Link href="/buyer/create-project">
          <Button variant="primary" size="md">
            <FilePlus className="h-4 w-4 mr-1.5" /> Posting Kebutuhan Baru
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Active Project Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Proyek Berjalan</h2>
          <Link href="/buyer/projects" className="text-xs font-semibold text-forest-800 hover:underline">
            Lihat Semua Proyek &rarr;
          </Link>
        </div>

        <Card className="p-6 border-forest-100 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="forest">IN_PROGRESS</Badge>
                <span className="text-xs text-gray-500 font-medium">Teknik Informatika &bull; Sistem Informasi</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Pengembangan Model Deteksi Anomali Jaringan Berbasis Deep Learning
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/shared/chat/demo-1">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" /> Chat Rekan
                </Button>
              </Link>
              <Link href="/buyer/projects/demo-1">
                <Button variant="primary" size="sm">
                  Buka Proyek <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <ProgressBar progress={60} label="Keseluruhan Progres Skripsi" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Joki Ditugaskan</span>
                <p className="font-semibold text-gray-900 mt-1">Dr. Hendra Wijaya, M.Kom</p>
                <p className="text-gray-500 text-[11px]">Rating: 4.95 / 5.0 (Verified KYC)</p>
              </div>

              <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Milestone Saat Ini</span>
                <p className="font-semibold text-gray-900 mt-1">Bab 3: Desain & Metodologi Riset</p>
                <Link href="/buyer/projects/demo-1/milestones" className="text-amber-800 text-[11px] font-bold hover:underline block mt-0.5">
                  Tinjau Draf Bab & Turnitin 9% &rarr;
                </Link>
              </div>

              <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
                <span className="font-bold text-forest-800 uppercase text-[10px]">Status Rekber (Escrow)</span>
                <p className="font-semibold text-gray-900 mt-1">Rp 1.500.000 HELD</p>
                <Link href="/buyer/projects/demo-1/payment" className="text-emerald-700 text-[11px] font-medium hover:underline block mt-0.5">
                  Lihat Riwayat Tagihan &rarr;
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Timeline & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Aktivitas Transaksi Terkini</h2>
          <Card className="p-5">
            <div className="space-y-4">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-50 text-forest-800 flex-shrink-0 mt-0.5">
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
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Keamanan Akademik</h2>
          <Card className="p-5 bg-forest-50/30 border-forest-100 text-xs text-gray-700 space-y-3">
            <div className="flex items-center gap-1.5 text-forest-800 font-bold uppercase text-[10px]">
              <ShieldCheck className="h-4 w-4 text-forest-700" />
              <span>Garansi 100% Anti-Scam</span>
            </div>
            <p className="leading-relaxed">
              Jangan pernah melakukan pembayaran langsung ke luar rekening penampungan resmi platform. Semua dana tersimpan aman hingga Anda mengesahkan approval bab.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
