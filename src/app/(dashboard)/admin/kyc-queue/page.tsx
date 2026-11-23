'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getAdminKycQueueAction, reviewKycAdminAction, type KycSubmission } from '@/actions/kyc';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  AlertCircle,
} from 'lucide-react';

export default function AdminKycQueuePage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<KycSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Dialog
  const [selectedKyc, setSelectedKyc] = useState<KycSubmission | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setIsLoading(true);
    const res = await getAdminKycQueueAction();
    if (res.success && res.queue) {
      setQueue(res.queue);
    }
    setIsLoading(false);
  }

  const handleOpenReview = (item: KycSubmission) => {
    setSelectedKyc(item);
    setRejectionReason('');
    setIsReviewOpen(true);
  };

  const handleProcess = async (isApproved: boolean) => {
    if (!selectedKyc) return;

    setIsProcessing(true);
    try {
      const res = await reviewKycAdminAction(selectedKyc.id, isApproved, rejectionReason);
      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: res.error });
        return;
      }

      toast({
        type: isApproved ? 'success' : 'info',
        title: isApproved ? 'Joki Disahkan (Verified KYC)' : 'Pengajuan Ditolak',
        message: isApproved
          ? 'Badge Verified telah aktif pada akun joki ini.'
          : 'Alasan penolakan telah diteruskan ke joki.',
      });

      setIsReviewOpen(false);
      loadQueue();
    } catch {
      toast({ type: 'error', title: 'Gagal', message: 'Kesalahan sistem' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Antrean Verifikasi KYC Joki
          </h1>
          <Badge variant="burgundy">Admin Review</Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Validasi KTP dan foto selfie untuk menjamin seluruh penyedia jasa di platform memiliki identitas terverifikasi.
        </p>
      </div>

      <Card className="p-0 overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Pengajuan</TableHead>
              <TableHead>Nama Joki</TableHead>
              <TableHead>Kampus & Jurusan</TableHead>
              <TableHead>NIK Masked</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(item.submitted_at)}
                </TableCell>
                <TableCell>
                  <p className="font-bold text-gray-900 text-xs">{item.joki_name}</p>
                  <span className="text-[10px] text-gray-400">ID #{item.joki_id}</span>
                </TableCell>
                <TableCell className="text-xs text-gray-700">
                  {item.university} &bull; {item.major}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-800">
                  {item.id_card_number_masked}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'VERIFIED' ? 'success' : item.status === 'PENDING' ? 'gold' : 'danger'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReview(item)}
                  >
                    Tinjau Berkas
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Tinjauan Berkas Identitas KYC"
        description="Periksa kecocokan foto identitas KTP dan foto selfie pemegang identitas."
      >
        {selectedKyc && (
          <div className="space-y-4 pt-2 text-xs text-left">
            <div className="rounded-md bg-surface-muted p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Lengkap:</span>
                <strong className="text-gray-900">{selectedKyc.joki_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Universitas / Prodi:</span>
                <span className="text-gray-800 font-medium">{selectedKyc.university} ({selectedKyc.major})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NIK KTP:</span>
                <strong className="font-mono text-gray-900">{selectedKyc.id_card_number_masked}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-forest-50 p-3 border border-forest-100 text-center space-y-2">
                <span className="font-bold text-forest-900 uppercase text-[10px] block">Dokumen KTP</span>
                <a
                  href={selectedKyc.id_card_image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-forest-800 hover:underline text-xs"
                >
                  Lihat Foto KTP <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-md bg-forest-50 p-3 border border-forest-100 text-center space-y-2">
                <span className="font-bold text-forest-900 uppercase text-[10px] block">Selfie dengan KTP</span>
                <a
                  href={selectedKyc.selfie_with_id_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-forest-800 hover:underline text-xs"
                >
                  Lihat Foto Selfie <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-gray-700">Catatan Penolakan (Jika Ditolak)</label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Foto KTP buram, NIK tidak dapat dibaca, atau wajah selfie tidak cocok..."
                className="w-full rounded-md border border-gray-300 p-2 text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleProcess(false)}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" /> Tolak KYC
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleProcess(true)}
                isLoading={isProcessing}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Sahkan KYC (Verified)
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
