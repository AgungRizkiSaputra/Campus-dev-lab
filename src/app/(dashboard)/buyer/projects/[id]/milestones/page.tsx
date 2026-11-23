'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import {
  getProjectMilestonesAction,
  approveMilestoneAction,
  requestMilestoneRevisionAction,
} from '@/actions/milestones';
import { openDisputeAction } from '@/actions/disputes';
import type { Milestone } from '@/types/database.types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  FileText,
  ShieldCheck,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  Gavel,
} from 'lucide-react';

export default function BuyerMilestonesPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('PLAGIARISM_DETECTED');
  const [disputeDesc, setDisputeDesc] = useState('');

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  async function loadMilestones() {
    setIsLoading(true);
    const res = await getProjectMilestonesAction(projectId);
    if (res.success && res.milestones) {
      setMilestones(res.milestones);
    }
    setIsLoading(false);
  }

  const handleApprove = async (mile: Milestone) => {
    try {
      const res = await approveMilestoneAction(mile.id);
      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Menyetujui Milestone',
          message: res.error,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Bab Skripsi Disetujui!',
        message: 'Dana Rekber telah dirilis ke konsultan joki dan tahapan bab berikutnya terbuka.',
      });

      loadMilestones();
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Gagal menyetujui milestone.',
      });
    }
  };

  const handleSendRevision = async () => {
    if (!selectedMilestone || !revisionNotes.trim()) return;

    try {
      const res = await requestMilestoneRevisionAction(selectedMilestone.id, revisionNotes);
      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: res.error });
        return;
      }

      toast({
        type: 'info',
        title: 'Catatan Revisi Terkirim',
        message: 'Joki telah dinotifikasi via WhatsApp untuk melakukan perbaikan draf.',
      });

      setIsRevisionOpen(false);
      setRevisionNotes('');
      loadMilestones();
    } catch {
      toast({ type: 'error', title: 'Gagal', message: 'Kesalahan sistem' });
    }
  };

  const handleOpenDispute = async () => {
    if (!selectedMilestone || !disputeDesc.trim()) return;

    try {
      const res = await openDisputeAction(
        projectId,
        selectedMilestone.id,
        disputeReason,
        disputeDesc
      );

      if (!res.success) {
        toast({ type: 'error', title: 'Gagal Membuka Sengketa', message: res.error });
        return;
      }

      toast({
        type: 'warning',
        title: 'Tiket Sengketa Dibuka',
        message: 'Dana escrow telah dibekukan. Tim arbitrase admin akan meninjau bukti dalam < 48 jam.',
      });

      setIsDisputeOpen(false);
      setDisputeDesc('');
      loadMilestones();
    } catch {
      toast({ type: 'error', title: 'Gagal', message: 'Kesalahan sistem' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <Link
        href={`/buyer/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Proyek
      </Link>

      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
          Progres Tahapan Bab & Milestone
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Pantau draf serahan joki, periksa laporan plagiarisme Turnitin, dan kelola persetujuan rilis dana rekber.
        </p>
      </div>

      {/* Milestone List */}
      <div className="space-y-4">
        {milestones.map((mile) => {
          const isSubmitted = mile.status === 'SUBMITTED';
          const isPaid = mile.status === 'PAID';
          const isLocked = mile.status === 'LOCKED';

          return (
            <Card
              key={mile.id}
              className={`p-6 transition-all ${
                isSubmitted
                  ? 'border-forest-600 ring-1 ring-forest-600 bg-white shadow-elevated'
                  : isPaid
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white">
                      {mile.order_index}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-gray-900">{mile.title}</h3>
                    <Badge
                      variant={
                        isPaid
                          ? 'success'
                          : isSubmitted
                          ? 'gold'
                          : isLocked
                          ? 'gray'
                          : 'forest'
                      }
                    >
                      {mile.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600">{mile.description}</p>

                  {/* Submission Details when submitted */}
                  {isSubmitted && (
                    <div className="rounded-md bg-forest-50 p-4 border border-forest-100 space-y-2 mt-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-forest-200/60">
                        <span className="font-bold text-forest-900 uppercase text-[10px]">Serahan Draf Bab</span>
                        <div className="flex items-center gap-1.5 text-forest-800">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Window Review: <strong>3x24 Jam</strong></span>
                        </div>
                      </div>

                      <p className="text-gray-700 italic">&ldquo;{mile.submission_notes}&rdquo;</p>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        {mile.plagiarism_score !== null && mile.plagiarism_score !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Skor Turnitin:</span>
                            <Badge variant={mile.plagiarism_score < 20 ? 'forest' : 'danger'}>
                              {mile.plagiarism_score}% Similarity
                            </Badge>
                          </div>
                        )}

                        <a
                          href={mile.plagiarism_report_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-forest-800 hover:underline inline-flex items-center gap-1"
                        >
                          <FileCheck2 className="h-4 w-4" /> Unduh Laporan Turnitin
                        </a>

                        <a
                          href={mile.submission_doc_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-forest-800 hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" /> Buka Draf Bab (Word / PDF)
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                    <span>Nominal Rekber: <strong className="text-forest-900 font-bold">{formatRupiah(mile.amount)}</strong></span>
                    <span>&bull;</span>
                    <span>Jatuh Tempo: {formatDate(mile.due_date)}</span>
                  </div>
                </div>

                {/* Actions per milestone state */}
                <div className="flex flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  {isSubmitted ? (
                    <div className="space-y-2 w-full sm:w-auto text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleApprove(mile)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Setujui Bab & Rilis Dana
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMilestone(mile);
                            setIsRevisionOpen(true);
                          }}
                        >
                          Minta Revisi
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            setSelectedMilestone(mile);
                            setIsDisputeOpen(true);
                          }}
                        >
                          <Gavel className="h-3.5 w-3.5 mr-1" /> Sengketa
                        </Button>
                      </div>
                    </div>
                  ) : isPaid ? (
                    <div className="text-right text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                      Dana Telah Dicairkan ke Joki
                    </div>
                  ) : isLocked ? (
                    <Link href={`/buyer/projects/${projectId}/payment`}>
                      <Button variant="outline" size="sm">
                        <Lock className="h-3.5 w-3.5 mr-1" /> Deposit Bab Ini
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revision Dialog */}
      <Dialog
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        title="Ajukan Catatan Revisi Draf"
        description="Jelaskan bagian bab yang perlu disempurnakan atau diperbaiki oleh konsultan joki."
      >
        <div className="space-y-4 pt-2 text-xs">
          <textarea
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Tuliskan catatan dosen pembimbing atau bagian yang masih belum sesuai..."
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsRevisionOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendRevision}>
              Kirimkan Catatan Revisi
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="Buka Arbitrase Sengketa (Admin Dispute)"
        description="Dana di rekber akan dibekukan sementara hingga admin memeriksa bukti pengerjaan."
      >
        <div className="space-y-4 pt-2 text-xs text-left">
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Alasan Sengketa</label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-xs"
            >
              <option value="PLAGIARISM_DETECTED">Tingkat Plagiarisme Tinggi (&gt; 20%)</option>
              <option value="DEADLINE_MISSED">Melewati Batas Waktu Tanpa Konfirmasi</option>
              <option value="QUALITY_ISSUE">Kualitas Penulisan Tidak Sesuai Pedoman</option>
              <option value="COMMUNICATION_BREAKDOWN">Joki Tidak Merespons &gt; 3 Hari</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Penjelasan Rinci</label>
            <textarea
              rows={4}
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              placeholder="Berikan kronologi permasalahan untuk ditinjau oleh tim mediasi admin..."
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsDisputeOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleOpenDispute}>
              Buka Tiket Arbitrase
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
