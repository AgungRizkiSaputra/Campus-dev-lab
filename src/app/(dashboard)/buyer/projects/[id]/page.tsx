'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
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
  Sparkles,
} from 'lucide-react';

export default function BuyerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bidding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bidding | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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

  const handleSelectJoki = (bid: Bidding) => {
    setSelectedBid(bid);
    setIsConfirmOpen(true);
  };

  const handleConfirmAcceptBid = async () => {
    if (!selectedBid || !project) return;
    setIsAccepting(true);

    try {
      const res = await acceptBidAction(project.id, selectedBid.id, selectedBid.joki_id);
      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Memilih Joki',
          message: res.error,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Joki Berhasil Ditetapkan!',
        message: 'Proyek beralih ke status IN_PROGRESS. Silakan lakukan deposit pembayaran Rekber untuk memulai Bab 1.',
      });

      setIsConfirmOpen(false);
      // Refresh local state
      setProject({ ...project, status: 'IN_PROGRESS', assigned_joki_id: selectedBid.joki_id });
      setBids((prev) =>
        prev.map((b) => ({
          ...b,
          status: b.id === selectedBid.id ? 'ACCEPTED' : 'REJECTED',
        }))
      );
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Gagal menetapkan joki terpilih.',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-sm text-gray-500">
        Memuat detail proyek dan penawaran...
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Proyek Tidak Ditemukan"
        description="ID proyek tidak valid atau sudah dihapus."
        actionLabel="Kembali ke Daftar Proyek"
        onAction={() => router.push('/buyer/projects')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/buyer/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Proyek
        </Link>

        {project.status === 'IN_PROGRESS' && (
          <div className="flex items-center gap-2">
            <Link href={`/shared/chat/${project.id}`}>
              <Button variant="primary" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" /> Ruang Diskusi & Chat
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Project Overview Card */}
      <Card className="p-6 border-forest-100 shadow-card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={project.status === 'IN_PROGRESS' ? 'forest' : 'gold'}>
                {project.status}
              </Badge>
              <span className="text-xs font-semibold text-gray-600">{project.major}</span>
              <span className="text-xs text-gray-400">&bull;</span>
              <span className="text-xs text-gray-500">{project.faculty}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 leading-tight">
              {project.title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">Topik: {project.topic}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rentang Budget</span>
            <p className="font-bold text-forest-900 text-lg">
              {formatRupiah(project.budget_min)} - {formatRupiah(project.budget_max)}
            </p>
          </div>
        </div>

        <div className="py-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Uraian Kebutuhan Mahasiswa</h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Tenggat Akhir</span>
            <span className="font-semibold text-gray-800">{formatDate(project.deadline)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Model Layanan</span>
            <span className="font-semibold text-gray-800">{project.service_type}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Penawaran Masuk</span>
            <span className="font-bold text-forest-900">{bids.length} Blind Bids</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Proteksi Rekber</span>
            <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Escrow Aktif
            </span>
          </div>
        </div>
      </Card>

      {/* Received Blind Bids Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Penawaran Blind Bidding yang Masuk
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sebagai mahasiswa pemilik proyek, Anda memiliki hak eksklusif melihat proposal dan nominal penawaran joki.
            </p>
          </div>
          <Badge variant="forest">{bids.length} Penawaran</Badge>
        </div>

        {bids.length === 0 ? (
          <EmptyState
            title="Belum Ada Penawaran Masuk"
            description="Proyek Anda baru saja dipublikasikan ke bursa. Joki yang memiliki keahlian di jurusan Anda akan segera mengirimkan proposal penawaran."
          />
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => (
              <Card
                key={bid.id}
                className={`p-6 transition-all ${
                  bid.status === 'ACCEPTED'
                    ? 'border-forest-600 bg-forest-50/20 ring-1 ring-forest-600'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-gray-900">
                        {bid.joki?.full_name || 'Konsultan Akademik'}
                      </span>
                      {bid.joki?.is_verified && (
                        <Badge variant="forest" size="sm">
                          Verified KYC
                        </Badge>
                      )}
                      <span className="text-xs text-amber-700 font-semibold">
                        ★ {bid.joki?.rating_avg || '5.0'} ({bid.joki?.completed_projects_count || 10} selesai)
                      </span>
                      {bid.status === 'ACCEPTED' && (
                        <Badge variant="success">Joki Terpilih</Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Alumni: {bid.joki?.university || 'PTN Terkemuka'} &bull; Jurusan: {bid.joki?.major || 'Relevan'}
                    </p>

                    <div className="rounded-md bg-surface-muted p-3 text-xs text-gray-700 leading-relaxed border border-gray-100">
                      <strong className="block text-gray-900 mb-1">Proposal & Strategi Pengerjaan:</strong>
                      {bid.proposal}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span>Estimasi Waktu: <strong className="text-gray-900">{bid.estimated_days} Hari</strong></span>
                      <span>&bull;</span>
                      <span>Dikirim: {formatDate(bid.created_at)}</span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Nominal Bid</span>
                      <p className="font-bold text-lg text-forest-900">{formatRupiah(bid.bid_amount)}</p>
                    </div>

                    {project.status === 'OPEN' || project.status === 'BIDDING' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectJoki(bid)}
                      >
                        Pilih Joki Ini
                      </Button>
                    ) : bid.status === 'ACCEPTED' ? (
                      <Badge variant="success">Ditugaskan</Badge>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Pemilihan Joki"
        description="Anda akan menetapkan konsultan akademik ini sebagai penanggung jawab proyek."
      >
        <div className="space-y-4 text-xs text-gray-700 pt-2">
          {selectedBid && (
            <div className="rounded-md bg-forest-50 p-4 border border-forest-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Joki:</span>
                <strong className="text-gray-900">{selectedBid.joki?.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal Disepakati:</span>
                <strong className="text-forest-900 font-bold">{formatRupiah(selectedBid.bid_amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimasi Selesai:</span>
                <strong className="text-gray-900">{selectedBid.estimated_days} Hari</strong>
              </div>
            </div>
          )}

          <p className="leading-relaxed">
            Setelah memilih, status proyek akan beralih menjadi <strong>IN_PROGRESS</strong> dan ruang chat kolaborasi langsung dibuka. Dana akan aman disimpan di Rekber Escrow platform hingga Anda menyetujui hasil per bab.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)} disabled={isAccepting}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAcceptBid} isLoading={isAccepting}>
              Setujui & Tetapkan Joki
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
