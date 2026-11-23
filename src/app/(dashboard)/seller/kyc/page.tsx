'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getKycStatusAction, submitKycAction, type KycSubmission } from '@/actions/kyc';
import {
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  FileCheck2,
} from 'lucide-react';

export default function SellerKycPage() {
  const { toast } = useToast();

  const [kyc, setKyc] = useState<KycSubmission | null>(null);
  const [idCardNumber, setIdCardNumber] = useState('');
  const [ktpUrl, setKtpUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getKycStatusAction();
      if (res.success && res.kyc) {
        setKyc(res.kyc);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardNumber.trim() || idCardNumber.length < 16) {
      toast({
        type: 'error',
        title: 'NIK Tidak Lengkap',
        message: 'Nomor Induk Kependudukan (NIK) KTP harus berjumlah 16 digit.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const masked = idCardNumber.slice(0, 4) + '**********' + idCardNumber.slice(-2);
      const sampleKtp = ktpUrl || 'https://storage.jokiskripsi.com/kyc/sample_ktp.jpg';
      const sampleSelfie = selfieUrl || 'https://storage.jokiskripsi.com/kyc/sample_selfie.jpg';

      const res = await submitKycAction(masked, sampleKtp, sampleSelfie);
      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: 'Gagal mengirim berkas KYC' });
        return;
      }

      toast({
        type: 'success',
        title: 'Berkas KYC Terkirim!',
        message: 'Tim verifikasi admin akan memeriksa keaslian KTP dan selfie identitas Anda dalam 1x24 jam.',
      });

      if (res.submission) setKyc(res.submission);
    } catch {
      toast({ type: 'error', title: 'Kesalahan Sistem', message: 'Gagal memproses data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Verifikasi Identitas Akademik (KYC)
          </h1>
          <Badge variant={kyc?.status === 'VERIFIED' ? 'success' : kyc?.status === 'PENDING' ? 'gold' : 'gray'}>
            {kyc?.status || 'UNVERIFIED'}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Wajib bagi seluruh penyedia jasa (joki) sebelum diizinkan mengajukan blind bidding di bursa proyek skripsi.
        </p>
      </div>

      {/* Verified Status Banner */}
      {kyc?.status === 'VERIFIED' ? (
        <Card className="p-6 border-emerald-200 bg-emerald-50/30 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
              <ShieldCheck className="h-7 w-7 text-emerald-700" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-serif font-bold text-base text-gray-900">
                Identitas Anda Telah Terverifikasi (Verified Joki)
              </h3>
              <p className="text-gray-600 leading-relaxed">
                KTP dan foto selfie Anda telah divalidasi oleh administrator platform. Lencana <strong>Verified KYC</strong> aktif dan profil Anda dapat mengajukan penawaran tanpa batas pada bursa terbuka.
              </p>
              <div className="pt-2 text-[11px] text-gray-400">
                NIK Terverifikasi: <strong className="font-mono text-gray-700">{kyc.id_card_number_masked}</strong> &bull; Terverifikasi sejak {formatDate(kyc.reviewed_at || kyc.submitted_at)}
              </div>
            </div>
          </div>
        </Card>
      ) : kyc?.status === 'PENDING' ? (
        <Card className="p-6 border-amber-200 bg-amber-50/40 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
              <FileCheck2 className="h-6 w-6 text-amber-700" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-serif font-bold text-base text-gray-900">
                Berkas Sedang Ditinjau oleh Tim Admin
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pengajuan identitas Anda telah masuk antrean validasi. Proses peninjauan dokumen manual membutuhkan waktu maksimal 1x24 jam kerja.
              </p>
              <p className="pt-1 text-[11px] text-gray-400">
                Diajukan pada: {formatDate(kyc.submitted_at)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        /* Submission Form */
        <Card className="p-6 border-forest-100 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs text-left">
            <div className="rounded-md bg-forest-50 p-4 border border-forest-100 flex items-start gap-3">
              <Lock className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
              <div className="text-gray-700 leading-relaxed">
                <strong className="text-forest-900 block mb-0.5">Perlindungan Data Pribadi (UU PDP)</strong>
                Nomor KTP dienkripsi SHA-256 dan hanya disimpan dalam bentuk masked. Foto KTP tersimpan di private bucket terisolasi dan hanya dapat diakses oleh tim kepatuhan administratif.
              </div>
            </div>

            <Input
              label="Nomor Induk Kependudukan (NIK KTP 16 Digit)"
              placeholder="3304xxxxxxxxxxxx"
              maxLength={16}
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value.replace(/\D/g, ''))}
              helperText="Pastikan nomor KTP asli dan sesuai nama lengkap Anda."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  label="Foto KTP Asli (URL / Gambar)"
                  placeholder="https://..."
                  value={ktpUrl}
                  onChange={(e) => setKtpUrl(e.target.value)}
                  helperText="Foto harus jelas, tidak buram, dan teks terbaca."
                />
                <div className="h-28 rounded-md border border-dashed border-gray-300 bg-surface-muted flex flex-col items-center justify-center text-gray-400">
                  <Upload className="h-6 w-6 mb-1" />
                  <span>Unggah Foto KTP</span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  label="Foto Selfie Memegang KTP"
                  placeholder="https://..."
                  value={selfieUrl}
                  onChange={(e) => setSelfieUrl(e.target.value)}
                  helperText="Wajah dan tulisan KTP harus terlihat jelas."
                />
                <div className="h-28 rounded-md border border-dashed border-gray-300 bg-surface-muted flex flex-col items-center justify-center text-gray-400">
                  <UserCheck className="h-6 w-6 mb-1" />
                  <span>Unggah Foto Selfie KTP</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Kirim Dokumen KYC untuk Verifikasi
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
