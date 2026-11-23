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
      }
      if (bidsRes.success && bidsRes.bids) {
        setBids(bidsRes.bids);
      }
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  // Handle direct agreement confirmation to proceed to payment
  const handleProceedPayment = async () => {
    if (!project) return;
    setIsAccepting(true);

    try {
      // If bids exist, accept the primary team proposal
      if (bids.length > 0) {
        await acceptBidAction(project.id, bids[0].id, bids[0].joki_id);
      }
      toast({
        type: 'success',
        title: 'Kesepakatan Dikonfirmasi!',
        message: 'Mengarahkan ke pembayaran Rekber resmi platform...',
      });
      router.push(`/buyer/projects/${project.id}/payment`);
    } catch {
      toast({
        type: 'error',
        title: 'Gangguan Sistem',
        message: 'Gagal memproses persetujuan. Silakan coba lagi.',
      });
    } finally {
      setIsAccepting(false);
    }
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
              <Badge variant={project.status === 'IN_PROGRESS' ? 'forest' : 'gold'}>
                {project.status === 'IN_PROGRESS'
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
      </Card>

      {/* Proposal & Kesepakatan Pengerjaan oleh Tim Jokiskripsiku */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900">
          Konfirmasi Pengerjaan dari Tim Jokiskripsiku
        </h2>

        {project.status === 'OPEN' || project.status === 'BIDDING' ? (
          <div className="rounded-2xl border border-forest-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-white shadow-xs">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">
                    Proposal Pengerjaan Tim Inti Jokiskripsiku
                  </h3>
                  <p className="text-xs text-forest-800 font-semibold">
                    Dikerjakan langsung secara privat • Garansi Lolos Turnitin & Bebas Revisi
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Biaya Pengerjaan</span>
                <p className="font-bold text-forest-900 text-xl font-serif">
                  {formatRupiah(bids[0]?.bid_amount || project.budget_min)}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Tim kami telah mempelajari instruksi tugas Anda dan siap memulai pengerjaan sesuai dengan metodologi riset kampus Anda. 
              Draf pengerjaan akan diserahkan bertahap lengkap dengan sertifikat uji plagiasi Turnitin resmi.
            </p>

            <div className="rounded-xl bg-forest-50/70 p-4 border border-forest-100 text-xs space-y-1.5 text-forest-900">
              <div className="flex items-center gap-2 font-bold text-forest-950">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Mekanisme Pembayaran Aman:</span>
              </div>
              <p className="text-forest-800 leading-relaxed">
                Biaya ditransfer ke rekening bersama resmi platform (BCA 8801928371 a.n PT Joki Skripsi Indonesia). Dana tidak dicairkan sebelum Anda menyetujui (ACC) hasil pengerjaan.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20mau%20diskusi%20proyek%20${encodeURIComponent(project.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md" className="w-full sm:w-auto font-semibold">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-emerald-600" /> Tanya Dulu via WhatsApp
                </Button>
              </a>

              <Button
                variant="primary"
                size="md"
                onClick={handleProceedPayment}
                isLoading={isAccepting}
                className="w-full sm:w-auto rounded-xl bg-forest-900 hover:bg-forest-800 font-bold px-6 shadow-sm"
              >
                Setujui & Lanjut Pembayaran Rekber <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
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
