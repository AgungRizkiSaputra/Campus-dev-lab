'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import { uploadPaymentProofAction } from '@/actions/payments';
import {
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export default function BuyerPaymentPortalPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.id as string;

  // Invoice Data
  const [paymentData, setPaymentData] = useState({
    id: 'pay-2',
    milestoneTitle: 'Bab 3: Metodologi Penelitian & Desain Arsitektur',
    subtotal: 1500000,
    uniqueCode: 482,
    totalAmount: 1500482,
    bankNameDestination: 'Bank Central Asia (BCA)',
    accountNumber: '8801928371',
    accountHolder: 'PT Joki Skripsi Indonesia',
    status: 'PENDING_VERIFICATION' as 'UNPAID' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED',
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  });

  const [senderBank, setSenderBank] = useState('BCA');
  const [transferRef, setTransferRef] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, type: 'amount' | 'account') => {
    navigator.clipboard.writeText(text);
    if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
    toast({
      type: 'info',
      title: 'Tersalin ke Clipboard',
      message: `${text} berhasil disalin.`,
    });
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRef.trim()) {
      toast({
        type: 'error',
        title: 'Nomor Referensi Kosong',
        message: 'Mohon masukkan nomor referensi transfer dari m-banking Anda.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const simulatedProof = proofUrl || 'https://storage.jokiskripsi.com/proofs/uploaded_receipt.jpg';
      const res = await uploadPaymentProofAction(
        paymentData.id,
        senderBank,
        transferRef,
        simulatedProof
      );

      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Mengunggah Bukti',
          message: res.error,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Bukti Pembayaran Terkirim!',
        message: 'Tim keuangan admin sedang memverifikasi mutasi bank Anda. Status dana akan segera beralih ke HELD.',
      });

      setPaymentData((prev) => ({ ...prev, status: 'PENDING_VERIFICATION' }));
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Terjadi kesalahan jaringan.',
      });
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Deposit Rekber (Escrow Payment)
          </h1>
          <Badge variant={paymentData.status === 'VERIFIED' ? 'success' : 'gold'}>
            {paymentData.status}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Tagihan pembayaran aman untuk: <strong>{paymentData.milestoneTitle}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Transfer Instructions & Unique Code */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-forest-100 shadow-card">
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Instruksi Transfer Bank Resmi
            </h3>

            <div className="space-y-4 text-xs">
              {/* Rekening Tujuan Box */}
              <div className="rounded-md bg-forest-50 p-4 border border-forest-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Bank Tujuan:</span>
                  <strong className="text-forest-900 text-sm">{paymentData.bankNameDestination}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nomor Rekening:</span>
                  <div className="flex items-center gap-2">
                    <strong className="font-mono text-base font-bold text-gray-900">{paymentData.accountNumber}</strong>
                    <button
                      onClick={() => handleCopy(paymentData.accountNumber, 'account')}
                      className="p-1 rounded hover:bg-forest-200 text-forest-800"
                      title="Salin No Rekening"
                    >
                      {copiedAccount ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Atas Nama:</span>
                  <strong className="text-gray-900">{paymentData.accountHolder}</strong>
                </div>
              </div>

              {/* Exact Amount Box with 3-Digit Unique Code */}
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 uppercase text-[10px]">
                    Jumlah yang Harus Ditransfer (Presisi)
                  </span>
                  <Badge variant="warning">3 Digit Kode Unik</Badge>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <p className="font-mono text-2xl font-extrabold text-forest-950">
                      {formatRupiah(paymentData.totalAmount)}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Subtotal: {formatRupiah(paymentData.subtotal)} + Kode Rekonsiliasi: <strong>{paymentData.uniqueCode}</strong>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(String(paymentData.totalAmount), 'amount')}
                  >
                    {copiedAmount ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    Salin Nominal
                  </Button>
                </div>

                <p className="text-[11px] text-amber-800 leading-relaxed pt-2 border-t border-amber-200/60">
                  <strong>PENTING:</strong> Mohon transfer dengan nominal tepat hingga 3 digit terakhir untuk mempercepat verifikasi otomatis sistem dan admin.
                </p>
              </div>
            </div>
          </Card>

          {/* Upload Proof Form */}
          <Card className="p-6">
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">
              Konfirmasi & Unggah Bukti Transfer
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Setelah melakukan transfer, masukkan data referensi struk atau m-banking Anda.
            </p>

            <form onSubmit={handleUploadProof} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Bank Pengirim Anda"
                  placeholder="Contoh: BCA / Mandiri / BNI / BRI"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  required
                />

                <Input
                  label="Nomor Referensi Transfer / Ref ID"
                  placeholder="Contoh: TRX-98127391 / 20261123-001"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  helperText="Tercantum di struk atau mutasi bank."
                  required
                />
              </div>

              <Input
                label="URL / Bukti Transfer (Image / PDF)"
                placeholder="https://..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                helperText="Unggah gambar screenshot m-banking Anda."
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                <Upload className="h-4 w-4 mr-1.5" /> Kirim Bukti Transfer untuk Verifikasi
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Escrow Guarantee Info */}
        <div className="space-y-4">
          <Card className="p-5 border-forest-100 bg-forest-50/30 text-xs text-gray-700 space-y-3">
            <div className="flex items-center gap-2 text-forest-800 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="h-4 w-4 text-forest-700" />
              <span>Garansi Rekber Escrow</span>
            </div>

            <p className="leading-relaxed">
              Dana Anda <strong>TIDAK AKAN DITERUSKAN</strong> ke joki sebelum bab skripsi dikerjakan, dicek plagiarisme, dan disetujui (Approved) oleh Anda.
            </p>

            <div className="border-t border-forest-200/60 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="h-2 w-2 rounded-full bg-forest-700" />
                <span>Dana aman berstatus <strong>HELD</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="h-2 w-2 rounded-full bg-forest-700" />
                <span>Jaminan Turnitin lolos uji</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="h-2 w-2 rounded-full bg-forest-700" />
                <span>Arbitrase admin &lt; 48 jam jika sengketa</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-1.5 text-gray-700 font-bold">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Batas Waktu Pembayaran</span>
            </div>
            <p className="leading-relaxed">
              Selesaikan transfer sebelum: <strong className="text-gray-900">{formatDate(paymentData.expiresAt)}</strong>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
