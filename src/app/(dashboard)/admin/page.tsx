import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  ShieldCheck,
  Gavel,
  History,
  TrendingUp,
  AlertTriangle,
  Users,
  FolderKanban,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Pengguna Terdaftar', value: '148 Akun', icon: Users, color: 'text-forest-800' },
    { label: 'Proyek Skripsi Aktif', value: '42 Proyek', icon: FolderKanban, color: 'text-forest-800' },
    { label: 'Antrean Verifikasi Mutasi', value: '3 Tagihan', icon: CreditCard, color: 'text-amber-600', link: '/admin/payments' },
    { label: 'Antrean Validasi KYC', value: '5 Berkas', icon: ShieldCheck, color: 'text-forest-800', link: '/admin/kyc-queue' },
    { label: 'Sengketa Aktif (Dispute)', value: '1 Kasus', icon: Gavel, color: 'text-red-600', link: '/admin/arbitration' },
    { label: 'Total Saldo di Escrow Rekber', value: 'Rp 64.500.000', icon: TrendingUp, color: 'text-forest-800' },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Pusat Kendali Administrator (PRD v7.0)
            </h1>
            <Badge variant="burgundy">Super Admin</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitoring operasional platform, verifikasi mutasi rekening bank nyata, audit sengketa, dan pelacakan audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/payments">
            <Button variant="primary" size="md">
              <CreditCard className="h-4 w-4 mr-1.5" /> Antrean Mutasi Bank
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 hover:border-forest-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              {stat.link && (
                <Link href={stat.link} className="text-xs font-semibold text-forest-800 hover:underline inline-flex items-center gap-1 mt-2">
                  Buka Antrean &rarr;
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Verification Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-forest-800" />
              <h3 className="font-serif font-bold text-base text-gray-900">Verifikasi Deposit Bank Mahasiswa</h3>
            </div>
            <Link href="/admin/payments" className="text-xs font-semibold text-forest-800 hover:underline">
              Kelola Semua &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                buyer: 'Dimas Pratama',
                amount: 'Rp 1.500.482',
                code: '482',
                time: '15 menit lalu',
                bank: 'BCA',
              },
              {
                buyer: 'Ratna Sari',
                amount: 'Rp 2.000.718',
                code: '718',
                time: '45 menit lalu',
                bank: 'Mandiri',
              },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-forest-50/40 p-3 border border-forest-100/60 text-xs">
                <div>
                  <p className="font-bold text-gray-900">{p.buyer}</p>
                  <p className="text-gray-500">Bank: {p.bank} &bull; Kode: <strong className="text-forest-900">{p.code}</strong></p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-forest-900">{p.amount}</p>
                  <Link href="/admin/payments">
                    <Button variant="primary" size="sm" className="mt-1">Cocokkan Mutasi</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dispute Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-burgundy-700" />
              <h3 className="font-serif font-bold text-base text-gray-900">Antrean Mediasi Sengketa (Dispute)</h3>
            </div>
            <Link href="/admin/arbitration" className="text-xs font-semibold text-burgundy-700 hover:underline">
              Buka Arbitrase &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            <div className="rounded-md bg-red-50/50 p-4 border border-red-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="danger">DISPUTED</Badge>
                <span className="text-[11px] text-gray-500">Tiket #DSP-882</span>
              </div>
              <p className="font-bold text-gray-900">Draf Bab 2 Melebihi Batas Plagiarisme (Turnitin 35%)</p>
              <p className="text-gray-600">Pelapor: Dimas Pratama &bull; Terlapor: Dr. Hendra Wijaya</p>
              <div className="pt-2 flex gap-2">
                <Link href="/admin/arbitration/dsp-882" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Tinjau Bukti & Eksekusi Putusan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
