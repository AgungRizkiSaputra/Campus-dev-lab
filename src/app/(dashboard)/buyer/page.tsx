'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatRupiah } from '@/lib/utils';
import { getProjectsAction } from '@/actions/projects';
import type { Project } from '@/types/database.types';
import {
  FilePlus,
  Clock,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  History,
  MessageSquare,
  Sparkles,
  BookOpen,
  MessageCircle,
  GraduationCap,
  FileText,
  Laptop,
  Mail,
  SearchCheck,
  FileSearch,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Instant local load (0ms frame-1 display)
    let localList: Project[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('joki_user_projects');
        if (rawLocal) {
          localList = JSON.parse(rawLocal);
          setProjects(localList);
        }
      } catch {
        // ignore
      }
    }

    // 2. Fetch server synchronization in background
    async function load() {
      try {
        const res = await getProjectsAction({ role: 'buyer' });
        let combined: Project[] = [];
        if (res.success && res.projects) {
          combined = [...res.projects];
        }

        const serverIds = new Set(combined.map((p) => p.id));
        for (const lp of localList) {
          if (!serverIds.has(lp.id)) {
            combined.unshift(lp);
          }
        }
        setProjects(combined);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const activeProject = projects.length > 0 ? projects[0] : null;

  const servicesList = [
    { num: '01', title: 'SEMPRO', subtitle: 'Seminar Proposal', tag: 'Bab 1–3', icon: BookOpen, href: '/buyer/create-project?service=SEMPRO' },
    { num: '02', title: 'SKRIPSI', subtitle: 'Lengkap Bab 1–5', tag: 'Paket Lengkap', icon: GraduationCap, href: '/buyer/create-project?service=SKRIPSI' },
    { num: '03', title: 'TUGAS', subtitle: 'Tugas Kuliah Harian', tag: 'Cepat & Akurat', icon: FileText, href: '/buyer/create-project?service=TUGAS' },
    { num: '04', title: 'UTS / UAS', subtitle: 'Ujian Semester', tag: 'Fast Response', icon: Clock, href: '/buyer/create-project?service=UTS_UAS' },
    { num: '05', title: 'MAKALAH', subtitle: 'Karya Tulis Ilmiah', tag: 'Rapi & Terstruktur', icon: FileCheck2, href: '/buyer/create-project?service=MAKALAH' },
    { num: '06', title: 'PPT', subtitle: 'Slide Presentasi Sidang', tag: 'Desain Modern', icon: Sparkles, href: '/buyer/create-project?service=PPT' },
    { num: '07', title: 'WEB & APLIKASI', subtitle: 'Coding Tugas & Skripsi', tag: 'Full-Stack', icon: Laptop, href: '/buyer/create-project?service=WEBSITE_APP' },
    { num: '08', title: 'UNDANGAN DIGITAL', subtitle: 'Desain Interaktif', tag: 'Responsive', icon: Mail, href: '/buyer/create-project?service=UNDANGAN_DIGITAL' },
    { num: '09', title: 'CEK PLAGIASI', subtitle: 'Uji Turnitin Resmi', tag: 'No-Repo', icon: SearchCheck, href: '/buyer/create-project?service=CEK_PLAGIASI' },
    { num: '10', title: 'TURUNIN PLAGIASI', subtitle: 'Parafrase Lolos Uji', tag: 'Garansi < 20%', icon: FileSearch, href: '/buyer/create-project?service=TURUNIN_PLAGIASI' },
  ];

  const stats = [
    {
      label: 'Pesanan Aktif',
      value: `${projects.length} Proyek`,
      icon: FolderKanban,
      color: 'text-forest-800',
    },
    {
      label: 'Tahapan Pengerjaan',
      value: activeProject ? activeProject.status : 'Belum Ada',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      label: 'Dana Diamankan Rekber',
      value: activeProject ? formatRupiah(activeProject.budget_min) : 'Rp 0',
      icon: CreditCard,
      color: 'text-forest-800',
    },
    {
      label: 'Tim Pengerja',
      value: activeProject?.assigned_joki_id ? 'Tim Jokiskripsiku' : 'Menunggu Pengerja',
      icon: ShieldCheck,
      color: 'text-emerald-600',
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

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://wa.me/62881010290185?text=Halo%20Admin%201%20Jokiskripsiku,%20mau%20tanya%20progres%20tugas%20saya"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> WA Admin 1 (0881010290185)
            </Button>
          </a>
          <a
            href="https://wa.me/6287786720942?text=Halo%20Admin%202%20Jokiskripsiku,%20mau%20tanya%20progres%20tugas%20saya"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> WA Admin 2 (087786720942)
            </Button>
          </a>
          <Link href="/buyer/create-project">
            <Button variant="primary" size="sm" className="font-bold shadow-sm text-xs">
              <FilePlus className="h-3.5 w-3.5 mr-1" /> Pesan Layanan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* 10 Layanan Jokiskripsiku - Desain Ringkas, Rapi & Elegan */}
      <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-forest-50 text-forest-800">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-serif text-sm font-bold text-gray-900">
              Pilihan Layanan Cepat
            </h2>
            <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-100">
              10 Layanan
            </span>
          </div>
          <Link
            href="/buyer/create-project"
            className="text-[11px] font-bold text-forest-800 hover:text-forest-950 hover:underline flex items-center gap-0.5"
          >
            Formulir Lengkap <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {servicesList.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.num}
                href={srv.href}
                className="group flex items-center gap-2 p-2 px-2.5 rounded-xl border border-gray-150 bg-gray-50/40 hover:bg-forest-50/70 hover:border-forest-300 transition-all text-left shadow-2xs"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-forest-800 group-hover:bg-forest-900 group-hover:text-white group-hover:border-forest-900 transition-colors shadow-2xs">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] font-bold text-forest-700">
                      {srv.num}
                    </span>
                    <span className="font-serif text-xs font-bold text-gray-900 group-hover:text-forest-950 truncate">
                      {srv.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 group-hover:text-forest-700 truncate">
                    {srv.subtitle}
                  </p>
                </div>
                <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-forest-800 shrink-0 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
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

        {activeProject ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="forest">{activeProject.status}</Badge>
                  <span className="text-xs text-gray-500 font-medium">
                    {activeProject.major} &bull; {activeProject.service_type}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  {activeProject.title}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(activeProject.status === 'OPEN' || activeProject.status === 'BIDDING') ? (
                  <Link href={`/buyer/projects/${activeProject.id}/payment`}>
                    <Button variant="primary" size="sm" className="font-bold bg-forest-900 hover:bg-forest-800 text-white shadow-2xs">
                      <CreditCard className="h-3.5 w-3.5 mr-1 text-emerald-300" /> Bayar Deposit Rekber
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/shared/chat/${activeProject.id}`}>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1 text-emerald-600" /> Chat Tim Pengerja
                    </Button>
                  </Link>
                )}
                <Link href={`/buyer/projects/${activeProject.id}`}>
                  <Button variant="outline" size="sm" className="font-bold">
                    Rincian Pesanan <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressBar
                progress={activeProject.status === 'COMPLETED' ? 100 : activeProject.status === 'IN_PROGRESS' ? 50 : 20}
                label="Keseluruhan Progres Pengerjaan"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                  <span className="font-bold text-forest-800 uppercase text-[10px]">Pengerja Tugas</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {activeProject.assigned_joki_id ? 'Tim Inti Jokiskripsiku' : 'Menunggu Konfirmasi Penjoki'}
                  </p>
                  <p className="text-gray-500 text-[11px]">Bebas calo &bull; Garansi Rekber BCA</p>
                </div>

                <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                  <span className="font-bold text-forest-800 uppercase text-[10px]">Tahapan Bab</span>
                  <p className="font-bold text-gray-900 mt-1">Status: {activeProject.status}</p>
                  <Link href={`/buyer/projects/${activeProject.id}/milestones`} className="text-amber-800 text-[11px] font-bold hover:underline block mt-0.5">
                    Tinjau Draf Bab &amp; Turnitin &rarr;
                  </Link>
                </div>

                <div className="rounded-xl bg-forest-50/70 p-3.5 border border-forest-100">
                  <span className="font-bold text-forest-800 uppercase text-[10px]">Status Dana Rekber</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatRupiah(activeProject.budget_min)}
                  </p>
                  <Link href={`/buyer/projects/${activeProject.id}/payment`} className="text-emerald-700 text-[11px] font-bold hover:underline block mt-0.5">
                    Lihat Status Pembayaran Rekber &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
              <BookOpen className="h-7 w-7 text-forest-700" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-gray-900">Belum Ada Pesanan Aktif</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Anda belum membuat pesanan tugas atau skripsi. Mulai konsultasi dan buat instruksi pesanan pertama Anda sekarang.
              </p>
            </div>
            <Link href="/buyer/create-project">
              <Button variant="primary" size="md" className="font-bold shadow-sm">
                <FilePlus className="h-4 w-4 mr-1.5" /> Buat Pesanan Baru Sekarang
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Activity Timeline & Trust Guarantee */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Aktivitas Terkini</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            {projects.length > 0 ? (
              <div className="space-y-3 text-xs">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-800 flex-shrink-0 mt-0.5">
                      <History className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-900 font-semibold">{p.title}</strong>
                        <span className="text-[10px] text-gray-400">Baru saja</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{p.description}</p>
                      <Link href={`/buyer/projects/${p.id}`} className="text-forest-800 font-bold hover:underline inline-block mt-1">
                        Buka Detail Pesanan &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                Belum ada aktivitas. Riwayat pengerjaan tugas Anda akan muncul di sini.
              </p>
            )}
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
              Seluruh pesanan Anda dikerjakan langsung oleh <strong>Tim Inti Jokiskripsiku</strong> tanpa perantara liar. Dana Anda aman di rekening bersama resmi (BCA 8801928371 a.n PT Joki Skripsi Indonesia) hingga Anda menyetujui hasil pengerjaan.
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
