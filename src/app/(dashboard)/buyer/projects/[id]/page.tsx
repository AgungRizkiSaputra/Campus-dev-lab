'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getProjectByIdAction } from '@/actions/projects';
import { getProjectBidsAction, acceptBidAction } from '@/actions/biddings';
import { getServiceConfig, serviceRequiresTurnitin } from '@/lib/services-config';
import type { Project, Bidding } from '@/types/database.types';
import {
  ShieldCheck,
  Clock,
  CreditCard,
  MessageSquare,
  FileText,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export default function BuyerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bidding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [projRes, bidsRes] = await Promise.all([
        getProjectByIdAction(projectId),
        getProjectBidsAction(projectId),
      ]);

      if (projRes.success && projRes.project) {
        setProject(projRes.project);
      } else if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('joki_user_projects');
          if (rawLocal) {
            const list: Project[] = JSON.parse(rawLocal);
            const found = list.find((p) => p.id === projectId);
            if (found) {
              setProject(found);
            }
          }
        } catch {
          // ignore
        }
      }

      let allBids: Bidding[] = [];
      if (bidsRes.success && bidsRes.bids) {
        allBids = [...bidsRes.bids];
      }

      if (typeof window !== 'undefined') {
        try {
          const rawLocalBids = localStorage.getItem(`joki_project_bids_${projectId}`);
          if (rawLocalBids) {
            const parsedBids: Bidding[] = JSON.parse(rawLocalBids);
            const seenIds = new Set(allBids.map((b) => b.id));
            for (const pb of parsedBids) {
              if (!seenIds.has(pb.id)) {
                allBids.unshift(pb);
              }
            }
          }
        } catch {
          // ignore
        }
      }

      setBids(allBids);
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  // Handle direct agreement confirmation to proceed to payment
  const handleProceedPayment = async () => {
    if (!project) return;
    setIsAccepting(true);

    try {
      const activeBid = bids[0];
      const agreedAmount = activeBid?.bid_amount || (project as any).deal_price || project.budget_min;

      // Update project in localStorage so payment invoice uses EXACT agreed price
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('joki_user_projects');
          if (rawLocal) {
            const list: Project[] = JSON.parse(rawLocal);
            const pIdx = list.findIndex((p) => p.id === project.id);
            if (pIdx !== -1) {
              list[pIdx].budget_min = agreedAmount;
              list[pIdx].budget_max = agreedAmount;
              (list[pIdx] as any).deal_price = agreedAmount;
              (list[pIdx] as any).paid_amount = agreedAmount;
              localStorage.setItem('joki_user_projects', JSON.stringify(list));
            }
          }
        } catch {}
      }

      if (activeBid) {
        await acceptBidAction(project.id, activeBid.id, activeBid.joki_id);
      }
    } catch {
      // ignore & continue to payment
    }
    toast({
      type: 'success',
      title: 'Kesepakatan Harga Disetujui',
      message: 'Membuka tagihan rekening bersama resmi platform...',
    });
    router.push(`/buyer/projects/${project.id}/payment`);
    setIsAccepting(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-16 text-center text-sm text-gray-500">
        Memuat detail pesanan dan status pengerjaan...
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Pesanan Tidak Ditemukan"
        description="ID pesanan tidak valid atau sudah dihapus."
        actionLabel="Kembali ke Daftar Pesanan"
        onAction={() => router.push('/buyer/projects')}
      />
    );
  }

  // Determine current progression step (1 to 4)
  const currentStep =
    project.status === 'COMPLETED'
      ? 4
      : project.status === 'IN_PROGRESS' || project.status === 'REVIEW'
      ? 3
      : bids.length > 0
      ? 2
      : 1;

  const flowSteps = [
    { num: 1, title: 'Pesanan Diterima', desc: 'Instruksi masuk ke tim' },
    { num: 2, title: 'Konfirmasi Tim', desc: 'Kesepakatan biaya & waktu' },
    { num: 3, title: 'Rekber & Pengerjaan', desc: 'Dana HELD, Turnitin dicek' },
    { num: 4, title: 'ACC & Selesai', desc: 'Draf disetujui, dana rilis' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-7 text-left">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/buyer/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-forest-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pesanan
        </Link>

        {project.status === 'IN_PROGRESS' && (
          <div className="flex items-center gap-2">
            <Link href={`/shared/chat/${project.id}`}>
              <Button variant="outline" size="sm" className="border-forest-200 text-forest-900">
                <MessageSquare className="h-4 w-4 mr-1 text-emerald-600" /> Chat Tim Pengerja
              </Button>
            </Link>
            <Link href={`/buyer/projects/${project.id}/milestones`}>
              <Button variant="primary" size="sm">
                <FileCheck2 className="h-4 w-4 mr-1" /> Tinjau Draf Bab & Turnitin
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Visual Step Tracker (Alur 4 Langkah Jelas) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
          Alur Pengerjaan Pesanan
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {flowSteps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <div
                key={step.num}
                className={`rounded-xl p-3 border transition-all ${
                  isCurrent
                    ? 'border-forest-800 bg-forest-50/80 ring-2 ring-forest-800/30'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? 'bg-forest-900 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Langkah {step.num}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{step.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Overview Card */}
      <Card className="p-7 border-gray-200 shadow-xs bg-white rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={
                (project as any).payment_status === 'PENDING_VERIFICATION'
                  ? 'gold'
                  : project.status === 'IN_PROGRESS'
                  ? 'forest'
                  : 'gold'
              }>
                {(project as any).payment_status === 'PENDING_VERIFICATION'
                  ? 'MENUNGGU VERIFIKASI MUTASI'
                  : project.status === 'IN_PROGRESS'
                  ? 'SEDANG DIKERJAKAN'
                  : project.status === 'COMPLETED'
                  ? 'SELESAI ACC'
                  : 'MENUNGGU KONFIRMASI REKBER'}
              </Badge>
              <span className="text-xs font-bold text-gray-700">{project.major}</span>
              <span className="text-xs text-gray-300">&bull;</span>
              <span className="text-xs text-gray-500">{project.faculty}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 leading-tight">
              {project.title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">Topik Fokus: {project.topic}</p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estimasi Anggaran</span>
            <p className="font-bold text-forest-900 text-lg">
              {formatRupiah(project.budget_min)} – {formatRupiah(project.budget_max)}
            </p>
          </div>
        </div>

        <div className="py-5 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Uraian Instruksi Mahasiswa</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-surface-muted/60 p-4 rounded-xl border border-gray-100">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Target Selesai</span>
            <span className="font-bold text-gray-900">{formatDate(project.deadline)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Jenis Layanan</span>
            <span className="font-bold text-gray-900">{project.service_type}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Pengerja Tugas</span>
            <span className="font-bold text-forest-900">Tim Inti Jokiskripsiku</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Proteksi Dana</span>
            <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Rekber BCA Resmi
            </span>
          </div>
        </div>

        {/* Rencana Pengerjaan: Full Langsung vs 4 Tahap Bertahap */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900 block">
            {project.payment_mode === 'FULL'
              ? `Skema Pengerjaan Penuh Terpadu (${getServiceConfig(project.service_type).name}):`
              : `Rencana 4 Tahap Pengerjaan Bertahap (${getServiceConfig(project.service_type).name}):`}
          </span>
          {project.payment_mode === 'FULL' ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-800 text-white text-[9px] flex-shrink-0">1</span>
                  <span>Deposit Rekber 100%</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-tight">Dana HELD aman di Rekber platform hingga tugas selesai</p>
              </div>
              <div className="rounded-xl bg-forest-50/70 p-3 border border-forest-100/80 space-y-1">
                <div className="flex items-center gap-1.5 text-forest-950 font-bold text-xs">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-900 text-white text-[9px] flex-shrink-0">2</span>
                  <span>Pengerjaan Penuh</span>
                </div>
                <p className="text-[10px] text-forest-800 leading-tight">Dikerjakan tuntas oleh tim inti Jokiskripsiku</p>
              </div>
              <div className="rounded-xl bg-forest-50/70 p-3 border border-forest-100/80 space-y-1">
                <div className="flex items-center gap-1.5 text-forest-950 font-bold text-xs">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-900 text-white text-[9px] flex-shrink-0">3</span>
                  <span>Serah Berkas Lengkap</span>
                </div>
                <p className="text-[10px] text-forest-800 leading-tight">Naskah lengkap siap diunduh & diperiksa mahasiswa</p>
              </div>
              <div className="rounded-xl bg-forest-50/70 p-3 border border-forest-100/80 space-y-1">
                <div className="flex items-center gap-1.5 text-forest-950 font-bold text-xs">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-900 text-white text-[9px] flex-shrink-0">4</span>
                  <span>Persetujuan (ACC)</span>
                </div>
                <p className="text-[10px] text-forest-800 leading-tight">Persetujuan akhir mahasiswa & pencairan dana Rekber</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {getServiceConfig(project.service_type).stages.map((st) => (
                <div key={st.num} className="rounded-xl bg-forest-50/70 p-3 border border-forest-100/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-forest-950 font-bold text-xs">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-900 text-white text-[9px] flex-shrink-0">
                      {st.num}
                    </span>
                    <span className="truncate">{st.title}</span>
                  </div>
                  <p className="text-[10px] text-forest-800 leading-tight">{st.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Proposal & Kesepakatan Pengerjaan oleh Tim Jokiskripsiku */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900">
          Konfirmasi Pengerjaan dari Tim Jokiskripsiku
        </h2>

        {(project as any).payment_status === 'PENDING_VERIFICATION' ? (
          <div className="rounded-2xl border border-sky-300 bg-sky-50/70 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sky-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-900 text-white shadow-xs">
                  <Clock className="h-6 w-6 text-sky-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">
                    Bukti Pembayaran Sedang Diverifikasi oleh Super Admin
                  </h3>
                  <p className="text-xs text-sky-900 font-semibold">
                    Bukti transfer telah masuk antrean pencocokan mutasi bank operasional platform.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Status Pembayaran</span>
                <p className="font-bold text-sky-900 text-sm">Menunggu Mutasi Bank</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Tim Jokiskripsiku sedang memverifikasi dana Anda. Setelah dicocokkan dengan mutasi nyata oleh Admin, status akan otomatis beralih menjadi <strong>Sedang Dikerjakan</strong> dan pengerjaan bab segera dimulai.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <a
                href={`https://wa.me/62881010290185?text=Halo%20Admin%20Jokiskripsiku,%20saya%20sudah%20upload%20bukti%20transfer%20untuk%20pesanan%20${encodeURIComponent(project.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md" className="w-full sm:w-auto font-semibold border-sky-300 text-sky-950 hover:bg-sky-100">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-emerald-600" /> Konfirmasi Cepat ke WA Admin
                </Button>
              </a>

              <Link href={`/buyer/projects/${project.id}/payment`} className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto rounded-xl bg-sky-900 hover:bg-sky-800 font-bold px-6 shadow-sm text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1.5 text-sky-300" /> Lihat Tanda Bukti Transfer
                </Button>
              </Link>
            </div>
          </div>
        ) : (project.status === 'OPEN' || project.status === 'BIDDING') ? (
          bids.length === 0 ? (
            /* KONDISI 1: Belum ada penawaran/konfirmasi harga dari Penjoki -> Mahasiswa belum bayar, nego/tunggu harga dulu */
            <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-amber-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-900 text-white shadow-xs">
                    <Clock className="h-6 w-6 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900">
                      Pesanan Sedang Ditinjau Tim Penjoki (Menunggu Penawaran Harga)
                    </h3>
                    <p className="text-xs text-amber-950 font-semibold">
                      Tahap Negosiasi &amp; Penentuan Harga Final &bull; Anda belum perlu membayar sekarang
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Rentang Budget Anda</span>
                  <p className="font-bold text-amber-950 text-base sm:text-lg font-mono">
                    {formatRupiah(project.budget_min)} &ndash; {formatRupiah(project.budget_max || project.budget_min)}
                  </p>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
                <p>
                  Instruksi tugas Anda telah berhasil masuk ke antrean kerja tim inti Jokiskripsiku. Saat ini tim pengerja sedang mempelajari detail materi dan tingkat kerumitan tugas untuk menetapkan penawaran harga yang adil dan pas di dalam rentang budget Anda.
                </p>
                <div className="rounded-xl bg-white p-3.5 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Alur Pembayaran Aman Jokiskripsiku:
                  </span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Mahasiswa <strong>tidak langsung membayar</strong> di awal tanpa kejelasan harga. Tim pengerja akan mengajukan penawaran harga final terlebih dahulu. Anda dapat berdiskusi/negosiasi melalui WhatsApp atau Chat, dan pembayaran Rekber baru dilakukan setelah Anda menyetujui harga kesepakatan.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-200/70 pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Menunggu Tim Pengerja Menentukan Harga...</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={`https://wa.me/62881010290185?text=Halo%20Admin%201%20Jokiskripsiku,%20saya%20sudah%20ajukan%20pesanan%20${encodeURIComponent(project.title)}%20dengan%20budget%20${formatRupiah(project.budget_min)}-${formatRupiah(project.budget_max || project.budget_min)},%20mau%20diskusi%20harga`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="font-semibold text-xs border-amber-300 text-amber-950 hover:bg-amber-100">
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Nego Cepat WA Admin 1
                    </Button>
                  </a>

                  <a
                    href={`https://wa.me/6287786720942?text=Halo%20Admin%202%20Jokiskripsiku,%20mau%20diskusi%20harga%20pesanan%20${encodeURIComponent(project.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="font-semibold text-xs border-amber-300 text-amber-950 hover:bg-amber-100">
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Nego WA Admin 2
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* KONDISI 2: Penjoki telah mengonfirmasi pengerjaan & menentukan harga final -> Mahasiswa tinggal setujui & bayar */
            <div className="rounded-2xl border-2 border-forest-600 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-xs">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300">
                        ✓ Penawaran Harga Siap Disetujui
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                      Konfirmasi Pengerjaan &amp; Penawaran Harga dari Tim Pengerja
                    </h3>
                    <p className="text-xs text-forest-800 font-semibold">
                      Dikerjakan langsung &bull; {serviceRequiresTurnitin(project.service_type) ? 'Garansi Lolos Turnitin < 20% & Bebas Revisi' : 'Garansi Tuntas & Bebas Revisi'}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Harga Final yang Ditentukan</span>
                  <p className="font-bold text-forest-900 text-2xl font-serif">
                    {formatRupiah(bids[0].bid_amount)}
                  </p>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    (Rentang awal Anda: {formatRupiah(project.budget_min)} &ndash; {formatRupiah(project.budget_max || project.budget_min)})
                  </span>
                </div>
              </div>

              {/* Rencana Kerja dari Penjoki */}
              <div className="rounded-xl bg-forest-50/70 p-4 border border-forest-100 text-xs space-y-2 text-forest-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-forest-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Rencana Pengerjaan &amp; Komitmen Tim:
                  </span>
                  <span className="text-[11px] font-semibold bg-white px-2.5 py-0.5 rounded border border-forest-200">
                    Estimasi Pengerjaan: {bids[0].estimated_days} Hari
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-forest-100">
                  &ldquo;{bids[0].proposal}&rdquo;
                </p>
              </div>

              {/* Mekanisme Rekber */}
              <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-200 text-xs text-gray-700 space-y-1">
                <div className="flex items-center gap-2 font-bold text-forest-900">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  <span>Jaminan Rekber Platform Jokiskripsiku:</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Setelah Anda menyetujui penawaran harga di atas, dana pembayaran akan ditahan (HELD) di rekening bersama resmi kami (BCA 888 166 1730, SeaBank 901478587082, atau ShopeePay 087786720942 a.n ACEVA ARIE SADEWA). Dana TIDAK akan dicairkan ke penjoki sebelum Anda memeriksa draf dan memberikan persetujuan (ACC).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <a
                  href={`https://wa.me/62881010290185?text=Halo%20Admin%201%20Jokiskripsiku,%20saya%20ingin%20nego%20harga%20penawaran%20${formatRupiah(bids[0].bid_amount)}%20untuk%20pesanan%20${encodeURIComponent(project.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full sm:w-auto font-semibold text-xs border-forest-200 text-forest-900">
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Nego Harga via WA
                  </Button>
                </a>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleProceedPayment}
                  isLoading={isAccepting}
                  className="w-full sm:w-auto rounded-xl bg-forest-900 hover:bg-forest-800 font-bold px-6 shadow-sm"
                >
                  Setujui Harga {formatRupiah(bids[0].bid_amount)} &amp; Lanjut Bayar Rekber <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Pesanan Sedang Dikerjakan oleh Tim Inti
                </h3>
                <p className="text-xs text-gray-500">
                  Dana telah diamankan di Rekber platform. Anda dapat memantau progres bab dan membuka chat langsung.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href={`/shared/chat/${project.id}`}>
                <Button variant="outline" size="sm" className="font-semibold">
                  <MessageSquare className="h-4 w-4 mr-1 text-emerald-600" /> Chat Tim
                </Button>
              </Link>
              <Link href={`/buyer/projects/${project.id}/milestones`}>
                <Button variant="primary" size="sm" className="font-bold">
                  Buka Draf Bab & Turnitin <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
