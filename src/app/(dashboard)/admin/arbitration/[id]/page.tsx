'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getDisputeByIdAction, resolveDisputeAdminAction, type DisputeTicket } from '@/actions/disputes';
import {
  Gavel,
  ShieldAlert,
  ArrowLeft,
  FileText,
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const disputeId = params.id as string;

  const [dispute, setDispute] = useState<DisputeTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isForceActionOpen, setIsForceActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'FORCE_RELEASE' | 'FORCE_REFUND'>('FORCE_RELEASE');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getDisputeByIdAction(disputeId);
      if (res.success && res.dispute) {
        setDispute(res.dispute);
      }
    }
    load();
  }, [disputeId]);

  const handleOpenAction = (action: 'FORCE_RELEASE' | 'FORCE_REFUND') => {
    setSelectedAction(action);
    setAdminNotes('');
    setIsForceActionOpen(true);
  };

  const handleExecuteResolution = async () => {
    if (!adminNotes.trim() || adminNotes.length < 10) {
      toast({
        type: 'error',
        title: 'Catatan Putusan Diperlukan',
        message: 'Mohon tuliskan alasan hukum/teknis putusan arbitrase minimal 10 karakter.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await resolveDisputeAdminAction(disputeId, selectedAction, adminNotes);
      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: res.error });
        return;
      }

      toast({
        type: 'success',
        title: 'Putusan Arbitrase Diterapkan',
        message: selectedAction === 'FORCE_RELEASE'
          ? 'Dana Rekber berhasil dicairkan paksa ke joki (Force Release).'
          : 'Dana Rekber berhasil dikembalikan paksa ke mahasiswa (Force Refund).',
      });

      setIsForceActionOpen(false);
      router.push('/admin/arbitration');
    } catch {
      toast({ type: 'error', title: 'Gagal', message: 'Kesalahan sistem' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!dispute) {
    return <div className="p-12 text-center text-sm text-gray-500">Memuat detail tiket arbitrase...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <Link
        href="/admin/arbitration"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Sengketa
      </Link>

      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Detail Tiket Arbitrase #{dispute.id}
          </h1>
          <Badge variant={dispute.status === 'OPEN' ? 'danger' : 'forest'}>
            {dispute.status}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Dibuat pada {formatDate(dispute.created_at)} &bull; Alasan: <strong className="text-gray-900">{dispute.reason}</strong>
        </p>
      </div>

      {/* Evidence Viewer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h3 className="font-serif font-bold text-base text-gray-900 pb-2 border-b border-gray-100">
            Klaim & Kronologi Pelapor
          </h3>
          <div className="text-xs space-y-2">
            <p><strong>Pelapor:</strong> {dispute.initiator_name}</p>
            <p className="text-gray-700 bg-surface-muted p-3 rounded-md border border-gray-200 leading-relaxed whitespace-pre-wrap">
              {dispute.description}
            </p>
          </div>

          {dispute.evidence_url && (
            <div className="pt-2">
              <a
                href={dispute.evidence_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                <FileCheck2 className="h-4 w-4" /> Buka Dokumen Bukti Pendukung <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-serif font-bold text-base text-gray-900 pb-2 border-b border-gray-100">
            Data Transaksi Rekber & Proyek
          </h3>
          <div className="text-xs space-y-2 text-gray-600">
            <p><strong>Proyek ID:</strong> #{dispute.project_id}</p>
            <p><strong>Milestone ID:</strong> #{dispute.milestone_id}</p>
            <p><strong>Pihak Terlapor:</strong> {dispute.against_name}</p>
            <p><strong>Status Escrow Saat Ini:</strong> <span className="text-red-700 font-bold">FROZEN_DISPUTE</span></p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tindakan Arbitrase Admin</p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleOpenAction('FORCE_RELEASE')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Force Release (Ke Joki)
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => handleOpenAction('FORCE_REFUND')}
              >
                <XCircle className="h-4 w-4 mr-1" /> Force Refund (Ke Klien)
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Force Action Dialog */}
      <Dialog
        isOpen={isForceActionOpen}
        onClose={() => setIsForceActionOpen(false)}
        title={
          selectedAction === 'FORCE_RELEASE'
            ? 'Pelepasan Dana Paksa (Force Release)'
            : 'Pengembalian Dana Paksa (Force Refund)'
        }
        description="Putusan ini bersifat mengikat dan akan dicatat secara permanen di audit trail keamanan platform."
      >
        <div className="space-y-4 pt-2 text-xs text-left">
          <div className="rounded-md bg-amber-50 p-3 border border-amber-200 text-amber-900 leading-relaxed">
            <strong>Peringatan Yuridis:</strong> Tindakan ini akan memutasi saldo escrow rekber secara administratif dan menutup tiket sengketa.
          </div>

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">
              Catatan & Pertimbangan Mediasi Admin (Wajib)
            </label>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Jelaskan alasan putusan: misal bukti Turnitin terbukti melebihi batas toleransi, atau draf pengerjaan dinyatakan sesuai spesifikasi brief..."
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              required
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsForceActionOpen(false)} disabled={isProcessing}>
              Batal
            </Button>
            <Button
              variant={selectedAction === 'FORCE_RELEASE' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleExecuteResolution}
              isLoading={isProcessing}
            >
              Eksekusi Putusan
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
