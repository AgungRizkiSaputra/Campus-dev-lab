'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getProjectsAction } from '@/actions/projects';
import { getMyBidsAction } from '@/actions/biddings';
import type { Project, Bidding } from '@/types/database.types';
import {
  Search,
  FolderCheck,
  CreditCard,
  ShieldCheck,
  Star,
  MessageSquare,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Upload,
  BookOpen,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Bidding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [projRes, bidsRes] = await Promise.all([
        getProjectsAction({ role: 'seller' }),
        getMyBidsAction(),
      ]);

      let combined: Project[] = [];
      if (projRes.success && projRes.projects) {
        combined = [...projRes.projects];
      }

      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('joki_user_projects');
          if (rawLocal) {
            const localProjects: Project[] = JSON.parse(rawLocal);
            const serverIds = new Set(combined.map((p) => p.id));
            for (const lp of localProjects) {
              if (!serverIds.has(lp.id)) {
                combined.unshift(lp);
              }
            }
          }
        } catch {
          // ignore
        }
      }

      setProjects(combined);
      if (bidsRes.success && bidsRes.bids) {
        setBids(bidsRes.bids as Bidding[]);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const activeProjects = projects.filter(
    (p) => p.status === 'IN_PROGRESS' || p.status === 'REVIEW'
  );
  const openProjects = projects.filter(
    (p) => p.status === 'OPEN' || p.status === 'BIDDING'
  );
  const completedProjects = projects.filter(
    (p) => p.status === 'COMPLETED'
  );

  const totalHeld = activeProjects.reduce((acc, curr) => acc + curr.budget_min, 0);
  const totalEarned = completedProjects.reduce((acc, curr) => acc + (curr as any).deal_price || curr.budget_min, 0);

  const stats = [
    {
      label: 'Pesanan Aktif Dikerjakan',
      value: `${activeProjects.length} Tugas Aktif`,
      icon: FolderCheck,
      color: 'text-forest-800',
    },
    {
      label: 'Antrean Pesanan Masuk',
      value: `${openProjects.length} Pesanan Baru`,
      icon: Search,
      color: 'text-amber-600',
    },
    {
      label: 'Dana Terkunci di Rekber',
      value: formatRupiah(totalHeld),
      icon: CreditCard,
      color: 'text-forest-800',
    },
    {
      label: 'Tugas Selesai (ACC)',
      value: `${completedProjects.length} Selesai`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
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
          <Link href="/seller/explore">
            <Button variant="outline" size="md">
              <Search className="h-4 w-4 mr-1.5" /> Antrean Pesanan Masuk
            </Button>
          </Link>
          <Link href="/seller/my-bids">
            <Button variant="primary" size="md" className="font-bold shadow-sm">
              <FolderCheck className="h-4 w-4 mr-1.5" /> Tugas Aktif Tim ({activeProjects.length})
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">Tugas yang Sedang Dikerjakan</h2>
            <p className="text-xs text-gray-500">Pesanan yang telah disahkan Super Admin dan siap dikerjakan oleh tim Anda.</p>
          </div>
          {activeProjects.length > 0 && (
            <Badge variant="forest">{activeProjects.length} Tugas Aktif</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Memuat data pengerjaan tugas...
          </div>
        ) : activeProjects.length === 0 ? (
          <EmptyState
            title="Belum Ada Tugas yang Sedang Dikerjakan"
            description="Saat ini belum ada tugas mahasiswa yang berstatus pengerjaan aktif. Silakan buka antrean pesanan masuk untuk mengambil tugas baru."
            actionLabel="Buka Antrean Pesanan Masuk"
            onAction={() => (window.location.href = '/seller/explore')}
          />
        ) : (
          <div className="space-y-4">
            {activeProjects.map((proj) => (
              <Card key={proj.id} className="p-6 border-forest-200 bg-white shadow-card hover:border-forest-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="forest">Sedang Dikerjakan (Dana HELD di Rekber)</Badge>
                      <span className="text-xs text-gray-600 font-semibold">{proj.major}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <span className="text-xs text-gray-500">Topik: {proj.topic}</span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Link href={`/shared/chat/${proj.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full font-semibold border-forest-200 text-forest-900">
                        <MessageSquare className="h-4 w-4 mr-1.5 text-emerald-600" /> Chat Mahasiswa
                      </Button>
                    </Link>
                    <Link href={`/seller/tasks/${proj.id}`} className="w-full sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold shadow-sm flex items-center justify-center gap-1.5">
                        <Upload className="h-4 w-4 text-emerald-400" /> Kerjakan Tugas
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <span className="font-bold text-forest-900 uppercase text-[10px]">Jenis Layanan</span>
                    <p className="font-bold text-gray-900 mt-1">{proj.service_type}</p>
                    <p className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> Garansi Turnitin Resmi
                    </p>
                  </div>

                  <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <span className="font-bold text-forest-900 uppercase text-[10px]">Dana HELD di Rekber</span>
                    <p className="font-bold text-forest-900 mt-1 text-sm font-mono">{formatRupiah(proj.budget_min)}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">Otomatis rilis begitu mahasiswa ACC</p>
                  </div>

                  <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                    <span className="font-bold text-forest-900 uppercase text-[10px]">Tenggat Waktu</span>
                    <p className="font-bold text-gray-900 mt-1">{formatDate(proj.deadline)}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">Sesuai jadwal target mahasiswa</p>
                  </div>
                </div>

                {/* Workflow Hint inside Card */}
                <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <strong>Alur Kerja:</strong> Klik tombol <strong>Kerjakan &amp; Unggah Bab</strong> untuk mengunggah draf Word/PDF &amp; sertifikat Turnitin per bab.
                  </span>
                  <Link href={`/seller/tasks/${proj.id}`} className="text-forest-900 font-bold hover:underline flex items-center gap-1">
                    Buka Workspace Pengerjaan &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Order Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">Antrean Pesanan Masuk (Tugas Baru)</h2>
            <p className="text-xs text-gray-500">Pesanan baru yang baru diajukan mahasiswa dan menunggu konfirmasi tim.</p>
          </div>
          <Link href="/seller/explore" className="text-xs font-bold text-forest-900 hover:underline">
            Lihat Semua Antrean &rarr;
          </Link>
        </div>

        {openProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 bg-surface-muted/50 text-left space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h4 className="font-serif font-bold text-base text-gray-900">
                Semua Pesanan Masuk Telah Berhasil Diambil
              </h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
              Saat ini tidak ada antrean pesanan baru yang menunggu. Pesanan mahasiswa terakhir telah disahkan oleh Super Admin dan kini aktif berada di daftar <strong>Tugas yang Sedang Dikerjakan</strong> di atas.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-forest-900 font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {activeProjects.length} Tugas Aktif Sedang Dikerjakan
              </span>
              <span>&bull;</span>
              <span>Bila ada mahasiswa baru yang mengajukan pesanan, tugas baru akan langsung muncul di sini.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {openProjects.map((p) => (
              <Card key={p.id} className="p-4 border-gray-200 hover:border-forest-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="gold">Menunggu Konfirmasi Tim</Badge>
                    <h4 className="font-bold text-sm text-gray-900 mt-1">{p.title}</h4>
                    <p className="text-xs text-gray-500">{p.major} &bull; Budget: {formatRupiah(p.budget_min)}</p>
                  </div>
                  <Link href="/seller/explore">
                    <Button variant="primary" size="sm">
                      Ambil Pesanan
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Tugas Selesai (Completed) */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900">Riwayat Tugas Selesai</h2>
              <p className="text-xs text-gray-500">Tugas yang telah di-ACC mahasiswa dan dana Rekber telah dicairkan.</p>
            </div>
            <Badge variant="forest">{completedProjects.length} Selesai</Badge>
          </div>

          <div className="space-y-3">
            {completedProjects.map((proj) => (
              <Card key={proj.id} className="p-5 border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="forest" className="bg-emerald-100 text-emerald-900 border-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Selesai (ACC Mahasiswa)
                      </Badge>
                      <span className="text-xs text-gray-600 font-semibold">{proj.major}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <span className="text-xs font-semibold text-forest-900">{proj.service_type}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-gray-900">{proj.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1 max-w-2xl">{proj.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Dana Dicairkan</span>
                      <p className="font-bold text-emerald-900 text-sm font-mono">
                        {formatRupiah((proj as any).deal_price || proj.budget_min)}
                      </p>
                    </div>
                    <Link href={`/seller/tasks/${proj.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full border-emerald-300 text-emerald-900 font-semibold">
                        <FileText className="h-4 w-4 mr-1.5" /> Lihat Arsip
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Jenis Layanan</span>
                    <span className="font-bold text-gray-900">{proj.service_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Deadline Awal</span>
                    <span className="font-bold text-gray-900">{formatDate(proj.deadline)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Status Akhir</span>
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Tuntas & Dana Cair
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4-Step Workflow Visual Guide */}
      <Card className="p-6 border-forest-200 bg-forest-50/70 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-white shrink-0">
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-gray-900">
              Panduan 4 Langkah Pengerjaan Tim Jokiskripsiku
            </h3>
            <p className="text-xs text-gray-600">
              Standar Operasional Prosedur (SOP) pengerjaan tugas akademik bergaransi Turnitin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-forest-100 space-y-1 shadow-2xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-white font-bold text-[11px]">
              1
            </span>
            <p className="font-bold text-gray-900 text-xs">Pesanan Disahkan Admin</p>
            <p className="text-gray-500 text-[11px] leading-tight">
              Pembayaran deposit Rekber diverifikasi mutasi bank dan dana aman di platform.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-forest-100 space-y-1 shadow-2xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-white font-bold text-[11px]">
              2
            </span>
            <p className="font-bold text-gray-900 text-xs">Diskusi Materi Mahasiswa</p>
            <p className="text-gray-500 text-[11px] leading-tight">
              Gunakan fitur chat privat untuk konfirmasi judul, instruksi dosen, dan pedoman kampus.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-forest-100 space-y-1 shadow-2xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-white font-bold text-[11px]">
              3
            </span>
            <p className="font-bold text-gray-900 text-xs">Kerjakan &amp; Cek Turnitin</p>
            <p className="text-gray-500 text-[11px] leading-tight">
              Susun draf bab dan lakukan pengecekan plagiarisme resmi Turnitin (wajib &lt; 20%).
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-forest-100 space-y-1 shadow-2xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-white font-bold text-[11px]">
              4
            </span>
            <p className="font-bold text-gray-900 text-xs">Unggah Hasil &amp; Saldo Rilis</p>
            <p className="text-gray-500 text-[11px] leading-tight">
              Klik Kerjakan &amp; Unggah Bab untuk kirim draf. Begitu mahasiswa ACC, dana Rekber cair.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
