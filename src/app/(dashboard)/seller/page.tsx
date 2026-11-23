import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  Search,
  FolderCheck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Star,
  BookOpen,
  MessageSquare,
  FileCheck2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const stats = [
    { label: 'Pesanan Aktif Dikerjakan', value: '1 Proyek Aktif', icon: FolderCheck, color: 'text-forest-800' },
    { label: 'Antrean Pesanan Masuk', value: '2 Pesanan Baru', icon: Search, color: 'text-amber-600' },
    { label: 'Dana Terkunci di Rekber', value: 'Rp 1.500.000', icon: CreditCard, color: 'text-forest-800' },
    { label: 'Kepuasan Mahasiswa', value: '★ 4.95 / 5.0', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard Tim Inti Jokiskripsiku
            </h1>
            <Badge variant="forest">Pengelola Resmi</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola antrean pesanan masuk dari mahasiswa, kerjakan tugas akademik, dan unggah draf beserta laporan uji Turnitin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seller/my-bids">
            <Button variant="outline" size="md">
              <FolderCheck className="h-4 w-4 mr-1.5" /> Tugas Dikerjakan
            </Button>
          </Link>
          <Link href="/seller/explore">
            <Button variant="primary" size="md" className="font-bold shadow-sm">
              <Search className="h-4 w-4 mr-1.5" /> Antrean Pesanan Masuk
            </Button>
          </Link>
        </div>
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

      {/* Active Assignment in progress */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-gray-900">Tugas yang Sedang Dikerjakan</h2>
        <Card className="p-6 border-forest-100 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="forest">Sedang Dikerjakan</Badge>
                <span className="text-xs text-gray-500 font-medium">Klien: Dimas Pratama (Informatika)</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                Pengembangan Model Deteksi Anomali Jaringan Berbasis Deep Learning
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/shared/chat/demo-1">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-emerald-600" /> Chat Klien
                </Button>
              </Link>
              <Link href="/shared/documents/demo-1">
                <Button variant="primary" size="sm">
                  <FileCheck2 className="h-4 w-4 mr-1.5" /> Dokumen &amp; Turnitin
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
              <span className="font-bold text-forest-800 uppercase text-[10px]">Tahapan Berjalan</span>
              <p className="font-semibold text-gray-900 mt-1">Bab 3: Metodologi &amp; Arsitektur</p>
              <p className="text-emerald-700 text-[11px] font-medium">Draf &amp; Turnitin 9% Telah Diserahkan</p>
            </div>

            <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
              <span className="font-bold text-forest-800 uppercase text-[10px]">Dana HELD di Rekber</span>
              <p className="font-semibold text-gray-900 mt-1">Rp 1.500.000 Terkunci</p>
              <p className="text-gray-500 text-[11px]">Dicairkan setelah di-approve klien</p>
            </div>

            <div className="rounded-md bg-forest-50 p-3 border border-forest-100">
              <span className="font-bold text-forest-800 uppercase text-[10px]">Tenggat Waktu Pengerjaan</span>
              <p className="font-semibold text-gray-900 mt-1">10 Hari Tersisa</p>
              <p className="text-gray-500 text-[11px]">Tenggat akhir: 7 Desember 2026</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Exclusivity Notice */}
      <Card className="p-6 border-forest-200 bg-forest-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-xs">
              <h4 className="font-serif font-bold text-base text-gray-900">
                Pusat Kerja Eksklusif Tim Jokiskripsiku (@jokiskripsiku.tng)
              </h4>
              <p className="text-gray-600 mt-0.5">
                Akun ini memiliki hak akses penuh untuk menerima pesanan baru dari mahasiswa, mengatur milestone pengerjaan, dan mengunggah laporan Turnitin resmi.
              </p>
            </div>
          </div>

          <Link href="/seller/explore">
            <Button variant="primary" size="sm" className="font-bold">
              Buka Antrean Pesanan &rarr;
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
