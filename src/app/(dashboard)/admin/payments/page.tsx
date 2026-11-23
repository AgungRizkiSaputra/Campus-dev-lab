'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getPendingPaymentsAction, verifyPaymentAdminAction } from '@/actions/payments';
import type { Payment } from '@/types/database.types';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function AdminPaymentQueuePage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verification Dialog
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [mutationCheck, setMutationCheck] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setIsLoading(true);
    const res = await getPendingPaymentsAction();
    if (res.success && res.payments) {
      setPayments(res.payments);
    }
    setIsLoading(false);
  }

  const handleOpenVerify = (pay: Payment) => {
    setSelectedPayment(pay);
    setMutationCheck(false);
    setRejectionNotes('');
    setIsVerifyOpen(true);
  };

  const handleProcess = async (isApproved: boolean) => {
    if (!selectedPayment) return;
    if (isApproved && !mutationCheck) {
      toast({
        type: 'error',
        title: 'Verifikasi Mutasi Diperlukan',
        message: 'Admin wajib mencentang konfirmasi bahwa mutasi rekening nyata telah dicocokkan.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await verifyPaymentAdminAction(selectedPayment.id, isApproved, rejectionNotes);
      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: res.error });
        return;
      }

      toast({
        type: isApproved ? 'success' : 'info',
        title: isApproved ? 'Pembayaran Disahkan (HELD)' : 'Pembayaran Ditolak',
        message: isApproved
          ? 'Status escrow dana telah beralih ke HELD dan joki dinotifikasi untuk memulai pengerjaan bab.'
          : 'Catatan penolakan telah diteruskan ke mahasiswa.',
      });

      setIsVerifyOpen(false);
      loadPayments();
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
            Antrean Verifikasi Mutasi Bank (Direct Settlement)
          </h1>
          <Badge variant="burgundy">Kendali Finansial</Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Cocokkan bukti transfer mahasiswa dengan rekening koran operasional platform untuk mengaktifkan status Escrow <strong>HELD</strong>.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="Tidak Ada Tagihan Pending"
          description="Seluruh pembayaran deposit mahasiswa telah selesai diverifikasi."
        />
      ) : (
        <Card className="p-0 overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu Masuk</TableHead>
                <TableHead>Pembayar & Proyek</TableHead>
                <TableHead>Bank & No Referensi</TableHead>
                <TableHead>Kode Unik</TableHead>
                <TableHead>Total Tagihan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(pay.created_at)}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-gray-900 text-xs">Dimas Pratama</p>
                    <p className="text-[11px] text-gray-500">Proyek #{pay.project_id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-gray-800 text-xs">{pay.bank_name}</p>
                    <span className="font-mono text-[11px] text-forest-800 bg-forest-50 px-1.5 py-0.5 rounded">
                      {pay.transfer_ref || 'Belum diisi'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{pay.unique_code}</Badge>
                  </TableCell>
                  <TableCell>
                    <strong className="font-mono font-bold text-forest-900 text-sm">
                      {formatRupiah(pay.total_amount)}
                    </strong>
                    <span className="block text-[10px] text-gray-400">
                      Sub: {formatRupiah(pay.subtotal)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="gold">PENDING_VERIF</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenVerify(pay)}
                    >
                      Periksa & Validasi
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Verification Dialog */}
      <Dialog
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        title="Validasi Mutasi Rekening Bank"
        description="Pastikan nominal tepat dan nomor referensi sesuai catatan mutasi perbankan sebelum merilis status HELD."
      >
        {selectedPayment && (
          <div className="space-y-4 pt-2 text-xs text-left">
            <div className="rounded-md bg-surface-muted p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal Presisi:</span>
                <strong className="font-mono text-base font-bold text-forest-900">
                  {formatRupiah(selectedPayment.total_amount)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nomor Referensi Struk:</span>
                <strong className="font-mono text-gray-900">{selectedPayment.transfer_ref}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Pengirim:</span>
                <span className="text-gray-900 font-semibold">{selectedPayment.bank_name}</span>
              </div>
            </div>

            {/* Proof View link */}
            <div className="rounded-md bg-forest-50 p-3 border border-forest-100 flex items-center justify-between">
              <span className="text-forest-900 font-medium">Bukti Struk Transfer:</span>
              <a
                href={selectedPayment.payment_proof_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                Buka Bukti Gambar <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Mandatory Checkbox */}
            <label className="flex items-start gap-2 text-gray-700 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={mutationCheck}
                onChange={(e) => setMutationCheck(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-forest-800 focus:ring-forest-600"
              />
              <span className="leading-relaxed">
                <strong>Konfirmasi Audit Mutasi:</strong> Saya telah memeriksa mutasi nyata pada e-banking resmi perusahaan dan memastikan dana sejumlah <strong>{formatRupiah(selectedPayment.total_amount)}</strong> benar-benar telah masuk.
              </span>
            </label>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleProcess(false)}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" /> Tolak Bukti
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleProcess(true)}
                isLoading={isProcessing}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Sahkan & Ubah ke HELD
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
