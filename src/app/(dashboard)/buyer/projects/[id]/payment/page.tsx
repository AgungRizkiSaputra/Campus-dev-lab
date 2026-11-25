'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getProjectByIdAction } from '@/actions/projects';
import { getProjectMilestonesAction } from '@/actions/milestones';
import { getOrCreateProjectPaymentAction, uploadPaymentProofAction } from '@/actions/payments';
import { saveUploadedFile } from '@/lib/file-storage';
import { getActiveSession } from '@/lib/auth';
import type { Project } from '@/types/database.types';
import {
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Upload,
  MessageCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  Phone,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

// Official Destination Accounts from @jokiskripsiku.tng
const OFFICIAL_PAYMENT_METHODS = [
  {
    id: 'BCA',
    name: 'BCA (Bank Central Asia)',
    accountNumber: '888 166 1730',
    cleanNumber: '8881661730',
    accountHolder: 'ACEVA ARIE SADEWA',
    badge: 'Bank Transfer',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    borderColor: 'border-blue-300 bg-blue-50/40 ring-2 ring-blue-500/20',
  },
  {
    id: 'SEABANK',
    name: 'SeaBank',
    accountNumber: '901478587082',
    cleanNumber: '901478587082',
    accountHolder: 'ACEVA ARIE SADEWA',
    badge: 'Bank Digital',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
    borderColor: 'border-orange-300 bg-orange-50/40 ring-2 ring-orange-500/20',
  },
  {
    id: 'SHOPEEPAY',
    name: 'ShopeePay',
    accountNumber: '087786720942',
    cleanNumber: '087786720942',
    accountHolder: 'ACEVA ARIE SADEWA',
    badge: 'E-Wallet',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    borderColor: 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-500/20',
  },
];

// Helper to compress uploaded images on the client to avoid 1MB Server Action payload & localStorage quota limits
async function compressImageFile(file: File): Promise<{ dataUrl: string; sizeFormatted: string }> {
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          dataUrl: reader.result as string,
          sizeFormatted: (file.size / 1024).toFixed(0) + ' KB',
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: reader.result as string,
            sizeFormatted: (file.size / 1024).toFixed(0) + ' KB',
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);
        const approxKB = (approxBytes / 1024).toFixed(0) + ' KB';
        resolve({
          dataUrl: compressedDataUrl,
          sizeFormatted: approxKB,
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl: reader.result as string,
          sizeFormatted: (file.size / 1024).toFixed(0) + ' KB',
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({
        dataUrl: '',
        sizeFormatted: '0 KB',
      });
    };
    reader.readAsDataURL(file);
  });
}

export default function BuyerPaymentPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountName, setAccountName] = useState('');

  // Payment Scheme Mode: 'FULL' (Lunas di Awal) vs 'MILESTONE' (Termin per Tahap)
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'MILESTONE'>('FULL');
  const [totalProjectBudget, setTotalProjectBudget] = useState(150000);
  const [milestoneStageAmount, setMilestoneStageAmount] = useState(37500);
  const [milestoneStageTitle, setMilestoneStageTitle] = useState('Tahap 1 Pengerjaan');
  const [totalStagesCount, setTotalStagesCount] = useState(4);

  // Selected Destination Method (BCA / SeaBank / ShopeePay)
  const [selectedMethod, setSelectedMethod] = useState(OFFICIAL_PAYMENT_METHODS[0]);

  // Dynamic Invoice Data
  const [paymentData, setPaymentData] = useState({
    id: '',
    milestoneTitle: 'Pembayaran Lunas 100% (Deposit Rekber Seluruh Tugas)',
    subtotal: 150000,
    uniqueCode: 123,
    totalAmount: 150123,
    status: 'UNPAID' as 'UNPAID' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  const [senderBank, setSenderBank] = useState('BCA');
  const [transferRef, setTransferRef] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProof, setIsEditingProof] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      let activeUserName = '';
      if (typeof window !== 'undefined') {
        try {
          const authRaw = localStorage.getItem('joki_auth_session');
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            activeUserName = parsed?.name || '';
          }
        } catch {}
      }
      if (!activeUserName) {
        const session = getActiveSession();
        activeUserName = session?.name || '';
      }
      setAccountName(activeUserName);

      let currentProject: Project | null = null;
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('joki_user_projects');
          if (rawLocal) {
            const list: any[] = JSON.parse(rawLocal);
            const foundP = list.find((p) => p.id === projectId);
            if (foundP) {
              currentProject = foundP;
              if (foundP.payment_mode) setPaymentMode(foundP.payment_mode);
              if (foundP.transfer_ref) {
                setTransferRef(foundP.transfer_ref);
              } else if (activeUserName) {
                setTransferRef(activeUserName);
              }
              if (foundP.sender_bank) setSenderBank(foundP.sender_bank);
              if (foundP.proof_url) {
                setProofPreview(foundP.proof_url);
                setProofUrl(foundP.proof_url);
                setFileName('screenshot_bukti_transfer.jpg');
              }
              if (foundP.payment_status === 'PENDING_VERIFICATION') {
                setPaymentData((prev) => ({ ...prev, status: 'PENDING_VERIFICATION' }));
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (!currentProject) {
        const projRes = await getProjectByIdAction(projectId);
        if (projRes.success && projRes.project) {
          currentProject = projRes.project;
        }
      }

      setProject(currentProject);
      if (activeUserName) {
        setTransferRef((prev) => prev || activeUserName);
      }

      const projectBudget = currentProject?.budget_min || 150000;
      setTotalProjectBudget(projectBudget);

      let stageAmount = Math.round(projectBudget / 4);
      let stageTitle = 'Tahap 1: Outline & Rencana Kerja';
      let stagesCount = 4;

      const mileRes = await getProjectMilestonesAction(
        projectId,
        currentProject?.service_type,
        projectBudget
      );

      if (mileRes.success && mileRes.milestones && mileRes.milestones.length > 0) {
        stagesCount = mileRes.milestones.length;
        stageTitle = mileRes.milestones[0].title;
        stageAmount = mileRes.milestones[0].amount || Math.round(projectBudget / stagesCount);
      }

      setTotalStagesCount(stagesCount);
      setMilestoneStageAmount(stageAmount);
      setMilestoneStageTitle(stageTitle);

      // Default to FULL payment so total matches the agreed proposal (e.g. Rp 150.000)
      const initialSubtotal = projectBudget;
      const payRes = await getOrCreateProjectPaymentAction(projectId, initialSubtotal);

      if (payRes.success && payRes.payment) {
        const p = payRes.payment;
        setPaymentData((prev) => ({
          ...prev,
          id: p.id,
          milestoneTitle: 'Pembayaran Lunas 100% (Deposit Rekber Seluruh Tugas)',
          subtotal: p.subtotal,
          uniqueCode: p.unique_code,
          totalAmount: p.total_amount,
          status: p.verification_status,
          expiresAt: p.expires_at,
        }));
      }
      setIsLoading(false);
    }
    loadData();
  }, [projectId]);

  // Handle Switching between Full Payment vs Milestone Stage Payment
  const handleSwitchPaymentMode = async (mode: 'FULL' | 'MILESTONE') => {
    setPaymentMode(mode);
    const newSubtotal = mode === 'FULL' ? totalProjectBudget : milestoneStageAmount;
    const newTitle =
      mode === 'FULL'
        ? 'Pembayaran Lunas 100% (Deposit Rekber Seluruh Tugas)'
        : `Pembayaran Bertahap (Termin ${milestoneStageTitle})`;

    try {
      const payRes = await getOrCreateProjectPaymentAction(projectId, newSubtotal);
      if (payRes.success && payRes.payment) {
        const p = payRes.payment;
        setPaymentData((prev) => ({
          ...prev,
          id: p.id,
          milestoneTitle: newTitle,
          subtotal: p.subtotal,
          uniqueCode: p.unique_code,
          totalAmount: p.total_amount,
        }));
      }
    } catch {
      // fallback local update
      setPaymentData((prev) => ({
        ...prev,
        milestoneTitle: newTitle,
        subtotal: newSubtotal,
        totalAmount: newSubtotal + prev.uniqueCode,
      }));
    }
  };

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

  // Real File Upload Handler with client-side compression to avoid 1MB server action limits
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'Ukuran Terlalu Besar',
        message: 'Maksimal ukuran file foto adalah 15 MB.',
      });
      return;
    }

    setFileName(file.name);

    try {
      const { dataUrl, sizeFormatted } = await compressImageFile(file);
      setFileSize(sizeFormatted);
      setProofPreview(dataUrl);
      setProofUrl(dataUrl);

      // Save to IndexedDB storage for offline/high-res resilience
      saveUploadedFile(`payment_proof_${projectId}`, {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      }).catch(() => {});

      toast({
        type: 'success',
        title: 'Bukti Dipilih dari Galeri',
        message: `${file.name} (${sizeFormatted}) siap dikirimkan.`,
      });
    } catch (err) {
      console.error('File load error:', err);
      toast({
        type: 'error',
        title: 'Gagal Membaca File',
        message: 'Tidak dapat memproses file yang dipilih.',
      });
    }
  };

  const handleRemoveFile = () => {
    setProofPreview(null);
    setProofUrl('');
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSenderName = (transferRef || accountName || '').trim();
    if (!cleanSenderName) {
      toast({
        type: 'error',
        title: 'Nama Pengirim Wajib Diisi',
        message: 'Mohon masukkan nama pengirim atau nama pemilik rekening yang mentransfer.',
      });
      return;
    }

    if (!proofUrl) {
      toast({
        type: 'error',
        title: 'Bukti Screenshot Wajib',
        message: 'Mohon unggah screenshot atau foto bukti transfer dari galeri Anda.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let activeUserName = accountName;
      if (!activeUserName && typeof window !== 'undefined') {
        try {
          const authRaw = localStorage.getItem('joki_auth_session');
          if (authRaw) {
            activeUserName = JSON.parse(authRaw)?.name || '';
          }
        } catch {}
      }
      if (!activeUserName) {
        const session = getActiveSession();
        activeUserName = session?.name || '';
      }

      const studentName =
        activeUserName ||
        (project as any)?.student_name ||
        (project as any)?.buyer_name ||
        project?.buyer?.full_name ||
        cleanSenderName;
      const projTitle = project?.title || 'Pesanan Tugas Mahasiswa';
      const targetPaymentId =
        paymentData.id && paymentData.id.trim() ? paymentData.id.trim() : `pay-${projectId}`;

      const res = await uploadPaymentProofAction(
        targetPaymentId,
        `${selectedMethod.name} (${senderBank})`,
        cleanSenderName,
        proofUrl,
        studentName,
        projTitle
      );

      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Mengunggah Bukti',
          message: res.error || 'Terjadi kesalahan saat memproses bukti pembayaran.',
        });
        setIsSubmitting(false);
        return;
      }

      // Synchronize to localStorage so buyer & admin dashboards see the new payment status immediately
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('joki_user_projects');
          if (rawLocal) {
            const list: any[] = JSON.parse(rawLocal);
            const pIdx = list.findIndex((p) => p.id === projectId);
            if (pIdx !== -1) {
              list[pIdx].payment_status = 'PENDING_VERIFICATION';
              list[pIdx].payment_mode = paymentMode;
              list[pIdx].transfer_ref = cleanSenderName;
              list[pIdx].sender_bank = senderBank;
              list[pIdx].proof_url = proofUrl;
              list[pIdx].paid_amount = paymentData.totalAmount;
              list[pIdx].paid_method = selectedMethod.name;
              list[pIdx].paid_at = new Date().toISOString();
              if (studentName) {
                list[pIdx].student_name = studentName;
                list[pIdx].buyer_name = studentName;
              }
              if (projTitle) {
                list[pIdx].project_title = projTitle;
              }
              localStorage.setItem('joki_user_projects', JSON.stringify(list));
            }
          }
        } catch (storageErr) {
          console.warn('LocalStorage save warning:', storageErr);
        }
      }

      toast({
        type: 'success',
        title: 'Konfirmasi Berhasil Terkirim!',
        message: 'Bukti pembayaran Anda telah diterima sistem dan sedang diverifikasi oleh Super Admin.',
      });

      setPaymentData((prev) => ({ ...prev, status: 'PENDING_VERIFICATION' }));
      setIsEditingProof(false);
    } catch (err: any) {
      console.error('Payment submit error:', err);
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: err?.message || 'Terjadi gangguan jaringan saat mengirim bukti transfer. Silakan coba kembali.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center text-sm text-gray-500">
        Memuat data invoice dan rekening resmi Jokiskripsiku...
      </div>
    );
  }

  const isConfirmedWaiting = paymentData.status === 'PENDING_VERIFICATION' && !isEditingProof;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <Link
        href={`/buyer/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Rincian Pesanan
      </Link>

      {/* Header & Status */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Deposit Rekber Resmi
              </h1>
              <Badge variant={paymentData.status === 'VERIFIED' ? 'success' : paymentData.status === 'PENDING_VERIFICATION' ? 'gold' : 'forest'}>
                {paymentData.status === 'VERIFIED'
                  ? 'DANA TERVERIFIKASI (HELD)'
                  : paymentData.status === 'PENDING_VERIFICATION'
                  ? 'MENUNGGU VERIFIKASI ADMIN'
                  : 'MENUNGGU PEMBAYARAN'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pesanan: <strong className="text-gray-900">{project?.title || 'Tugas Kuliah / Skripsi'}</strong> &bull; Total Kesepakatan: <strong>{formatRupiah(totalProjectBudget)}</strong>
            </p>
          </div>

          {/* Quick WhatsApp Help */}
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/62881010290185?text=Halo%20Admin%201%20Jokiskripsiku,%20mau%20konfirmasi%20pembayaran%20pesanan%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
              <span>WA Admin 1</span>
            </a>
            <a
              href="https://wa.me/6287786720942?text=Halo%20Admin%202%20Jokiskripsiku,%20mau%20konfirmasi%20pembayaran%20pesanan%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
              <span>WA Admin 2</span>
            </a>
          </div>
        </div>
      </div>

      {/* State A: Admin Verified (ACC) */}
      {paymentData.status === 'VERIFIED' && (
        <Card className="p-5 border-emerald-300 bg-emerald-50/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Dana Anda Telah Diamankan di Rekber Platform</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Admin telah memvalidasi mutasi rekening Anda. Tim pengerja sedang memproses tugas Anda.
              </p>
            </div>
          </div>
          <Link href={`/buyer/projects/${projectId}/milestones`}>
            <Button variant="primary" size="sm" className="font-bold whitespace-nowrap">
              Tinjau Hasil &amp; Turnitin &rarr;
            </Button>
          </Link>
        </Card>
      )}

      {/* Model Pembayaran Selector: Bayar Penuh vs Bayar Bertahap */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-forest-800" />
            <h2 className="font-serif text-sm font-bold text-gray-900">
              Pilih Skema Pembayaran Rekber
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Total Biaya Proyek: <strong className="text-forest-900">{formatRupiah(totalProjectBudget)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Bayar Penuh */}
          <button
            type="button"
            onClick={() => handleSwitchPaymentMode('FULL')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              paymentMode === 'FULL'
                ? 'border-forest-800 bg-forest-50/70 ring-2 ring-forest-800/20'
                : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                {paymentMode === 'FULL' ? (
                  <CheckCircle2 className="h-4 w-4 text-forest-800" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-gray-300" />
                )}
                Bayar Lunas 100%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200">
                Paling Praktis
              </span>
            </div>
            <p className="font-mono text-base font-extrabold text-forest-950">
              {formatRupiah(totalProjectBudget)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Satu kali transfer. Seluruh pengerjaan langsung jalan tuntas sampai selesai. Dana tetap 100% ditahan aman di platform dan baru cair setelah Anda ACC.
            </p>
          </button>

          {/* Option 2: Bayar Bertahap (Termin) */}
          <button
            type="button"
            onClick={() => handleSwitchPaymentMode('MILESTONE')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              paymentMode === 'MILESTONE'
                ? 'border-forest-800 bg-forest-50/70 ring-2 ring-forest-800/20'
                : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                {paymentMode === 'MILESTONE' ? (
                  <CheckCircle2 className="h-4 w-4 text-forest-800" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-gray-300" />
                )}
                Bayar Bertahap (Termin)
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Tahap 1 dari {totalStagesCount}
              </span>
            </div>
            <p className="font-mono text-base font-extrabold text-amber-900">
              {formatRupiah(milestoneStageAmount)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Transfer termin awal untuk {milestoneStageTitle}. Tahap selanjutnya dibayarkan setelah draf tahap ini Anda periksa dan setujui.
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Official Destination Accounts & Transfer Instructions / Success View */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Official Bank Accounts & Transfer Amount */}
          <Card className="p-6 border-forest-100 shadow-card bg-white rounded-2xl space-y-5">
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">
                Pilih Rekening Tujuan Transfer
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Semua metode pembayaran resmi platform atas nama: <strong className="text-gray-900">ACEVA ARIE SADEWA</strong>
              </p>
            </div>

            {/* 3 Official Payment Accounts (BCA, SeaBank, ShopeePay) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {OFFICIAL_PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod.id === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? method.borderColor
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-forest-800" />}
                    </div>
                    <p className="font-bold text-xs text-gray-900 mt-1">{method.name}</p>
                    <p className="font-mono text-xs font-semibold text-gray-600 mt-0.5">{method.accountNumber}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Account Details Box with One-Click Copy */}
            <div className="rounded-xl bg-forest-50/70 p-4 border border-forest-100 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-forest-100">
                <span className="text-gray-500 font-medium">Metode yang Dipilih:</span>
                <strong className="text-forest-950 font-bold">{selectedMethod.name}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Nomor Rekening / Akun:</span>
                <div className="flex items-center gap-2">
                  <strong className="font-mono text-base font-extrabold text-gray-900 tracking-wider">
                    {selectedMethod.accountNumber}
                  </strong>
                  <button
                    onClick={() => handleCopy(selectedMethod.cleanNumber, 'account')}
                    className="p-1.5 rounded-lg hover:bg-forest-200 text-forest-800 transition-colors"
                    title="Salin Nomor"
                  >
                    {copiedAccount ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-forest-100">
                <span className="text-gray-500 font-medium">Nama Pemilik Akun:</span>
                <strong className="text-forest-950 font-bold text-sm bg-white px-2 py-0.5 rounded border border-forest-200">
                  {selectedMethod.accountHolder}
                </strong>
              </div>
            </div>

            {/* Exact Amount Box with 3-Digit Unique Code */}
            <div className="rounded-xl bg-amber-50/80 p-4 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">
                  Jumlah Transfer Presisi
                </span>
                <Badge variant="warning">3 Digit Kode Unik</Badge>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="font-mono text-2xl font-extrabold text-forest-950">
                    {formatRupiah(paymentData.totalAmount)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Subtotal: {formatRupiah(paymentData.subtotal)} + Kode Verifikasi: <strong className="text-amber-900 font-mono">{paymentData.uniqueCode}</strong>
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(String(paymentData.totalAmount), 'amount')}
                  className="border-amber-300 text-amber-950 hover:bg-amber-100 font-bold"
                >
                  {copiedAmount ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Salin Nominal
                </Button>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed pt-2 border-t border-amber-200/60">
                <strong>PENTING:</strong> Pastikan nominal yang Anda transfer tepat hingga 3 digit terakhir ({paymentData.uniqueCode}) agar sistem dapat memvalidasi mutasi secara instan.
              </p>
            </div>
          </Card>

          {/* Card 2: Either Confirmed Success View OR Active Upload Form */}
          {isConfirmedWaiting ? (
            /* TRANSFORMASI TAMPILAN SETELAH KLIK KONFIRMASI (STATE BERHASIL TERKIRIM) */
            <Card className="p-7 bg-white rounded-3xl border border-emerald-300 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200">
                    Konfirmasi Pembayaran Berhasil Terkirim
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-950">
                    Bukti Transfer Telah Diterima Sistem
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Data pembayaran Anda ke rekening <strong>{selectedMethod.name}</strong> a/n <strong>ACEVA ARIE SADEWA</strong> sedang diverifikasi oleh Super Admin.
                  </p>
                </div>
              </div>

              {/* Submitted Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-surface-muted/60 p-4 rounded-2xl border border-gray-150">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Rekening Tujuan</span>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedMethod.name}</p>
                  <p className="font-mono text-[11px] text-gray-600">{selectedMethod.accountNumber} a/n ACEVA ARIE SADEWA</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Nominal yang Ditransfer</span>
                  <p className="font-mono text-base font-extrabold text-forest-950 mt-0.5">{formatRupiah(paymentData.totalAmount)}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Termasuk 3 Digit Kode Unik ({paymentData.uniqueCode})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Bank & Pengirim</span>
                  <p className="font-bold text-gray-900 mt-0.5">{senderBank}</p>
                  <p className="text-[11px] text-gray-600">Ref/Nama: {transferRef}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status Saat Ini</span>
                  <p className="font-bold text-amber-700 mt-0.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600" /> Menunggu Verifikasi Mutasi Bank
                  </p>
                  <p className="text-[10px] text-gray-500">Estimasi verifikasi &lt; 15 menit</p>
                </div>
              </div>

              {/* Uploaded Screenshot Preview */}
              {proofPreview && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Screenshot Bukti yang Anda Unggah:</span>
                  <div className="flex items-center gap-3">
                    <img
                      src={proofPreview}
                      alt="Screenshot Bukti Transfer"
                      className="h-20 w-20 object-cover rounded-xl border border-gray-200 shadow-2xs"
                    />
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p className="font-semibold text-gray-900 truncate max-w-xs">{fileName || 'screenshot_bukti_transfer.png'}</p>
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Terlampir &amp; Siap Dicocokkan Admin
                      </p>
                      {fileSize && <p className="text-[10px] text-gray-400">Ukuran file: {fileSize}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps Info */}
              <div className="rounded-xl bg-forest-50/80 p-4 border border-forest-100 text-xs text-forest-900 space-y-1.5">
                <div className="font-bold flex items-center gap-2 text-forest-950">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Apa yang Terjadi Selanjutnya?</span>
                </div>
                <p className="text-forest-800 leading-relaxed text-[11px]">
                  Super Admin akan mencocokkan mutasi rekening bank real. Seketika diverifikasi, status dana akan beralih menjadi <strong>HELD (Diamankan di Rekber)</strong> dan tim pengerja langsung memulai tugas Anda.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProof(true)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Unggah Ulang / Ganti Bukti
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/62881010290185?text=Halo%20Admin%20Jokiskripsiku,%20saya%20sudah%20transfer%20deposit%20untuk%20proyek%20${encodeURIComponent(project?.title || '')}%20sebesar%20Rp%20${paymentData.totalAmount}%20a.n%20${encodeURIComponent(transferRef)}.%20Mohon%20diverifikasi%20ya.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="md" className="w-full sm:w-auto text-xs font-bold border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100">
                      <MessageCircle className="h-4 w-4 mr-1 text-emerald-700" /> Konfirmasi ke WA Admin
                    </Button>
                  </a>

                  <Link href="/buyer/projects" className="w-full sm:w-auto">
                    <Button variant="primary" size="md" className="w-full sm:w-auto bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs">
                      Ke Daftar Pesanan Saya &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            /* Upload Proof Form with Real Gallery/Image Picker (WAJIB) */
            <Card className="p-6 bg-white rounded-2xl border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  Konfirmasi &amp; Unggah Bukti Transfer
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Setelah mentransfer ke rekening <strong>{selectedMethod.name}</strong> a/n ACEVA ARIE SADEWA, masukkan data transfer dan lampirkan foto struk / tangkapan layar dari galeri Anda.
                </p>
              </div>

              <form onSubmit={handleUploadProof} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Bank / E-Wallet Pengirim Anda"
                    placeholder="Contoh: BCA / Mandiri / SeaBank / ShopeePay"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    required
                  />

                  <Input
                    label="Nama Pengirim (Sesuai Akun Anda)"
                    placeholder={accountName || 'Nama Anda atau No. Ref Struk'}
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    helperText={
                      accountName
                        ? `Otomatis disesuaikan dengan akun Anda (${accountName}). Dapat disesuaikan bila rekening pengirim atas nama lain.`
                        : 'Tercantum di mutasi m-banking atau struk transfer.'
                    }
                    required
                  />
                </div>

                {/* Upload Bukti Transfer dari Galeri (WAJIB, BUKAN OPSIONAL & BUKAN TEKS) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Foto Bukti Transfer / Screenshot Pembayaran <span className="text-red-500">* (Wajib)</span>
                  </label>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!proofPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-forest-600 bg-gray-50/50 hover:bg-forest-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-200 text-forest-800 mx-auto shadow-2xs group-hover:bg-forest-900 group-hover:text-white transition-colors">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 group-hover:text-forest-950">
                          Klik untuk Memilih Foto Bukti Transfer dari Galeri
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Mendukung screenshot m-banking, struk ATM, atau foto galeri (JPG, PNG, PDF maks. 10MB)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-bold text-xs pointer-events-none mt-1"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" /> Buka Galeri / Pilih File
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <img
                          src={proofPreview}
                          alt="Screenshot Bukti"
                          className="h-16 w-16 object-cover rounded-xl border border-emerald-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate max-w-xs">
                            {fileName || 'bukti_transfer.jpg'}
                          </p>
                          <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Foto bukti berhasil dipilih dari galeri
                          </p>
                          {fileSize && <p className="text-[10px] text-gray-500">Ukuran: {fileSize}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold"
                        >
                          Ganti Foto
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                          title="Hapus foto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold h-11 rounded-xl shadow-xs"
                  isLoading={isSubmitting}
                >
                  <Upload className="h-4 w-4 mr-1.5" /> Konfirmasi Pembayaran Saya
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Escrow Guarantee Info & WhatsApp Admins */}
        <div className="space-y-4">
          <Card className="p-5 border-forest-100 bg-forest-50/40 text-xs text-gray-700 space-y-3 rounded-2xl">
            <div className="flex items-center gap-2 text-forest-900 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Garansi Rekber Escrow</span>
            </div>

            <p className="leading-relaxed text-gray-600">
              Dana Anda masuk ke rekening bersama resmi platform (a.n <strong>ACEVA ARIE SADEWA</strong>) dan berstatus <strong>HELD</strong>.
            </p>

            <div className="border-t border-forest-200/60 pt-3 space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Dana aman terlindungi platform</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Tim pengerja baru mulai setelah dana HELD</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Dana tidak dicairkan sebelum Anda menyetujui (ACC)</span>
              </div>
            </div>
          </Card>

          {/* Official WhatsApp Contacts Box from Instagram */}
          <Card className="p-5 text-xs space-y-3 rounded-2xl border-gray-200 bg-white">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <Phone className="h-4 w-4 text-forest-800" />
              <span>Kontak WhatsApp Resmi Admin</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ada pertanyaan terkait pembayaran atau negosiasi tugas? Hubungi admin resmi kami:
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://wa.me/62881010290185?text=Halo%20Admin%201%20Jokiskripsiku,%20mau%20konsultasi%20pembayaran"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 transition-colors text-emerald-950 font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Admin 1 (0881010290185)</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">Chat &rarr;</span>
              </a>

              <a
                href="https://wa.me/6287786720942?text=Halo%20Admin%202%20Jokiskripsiku,%20mau%20konsultasi%20pembayaran"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 transition-colors text-emerald-950 font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Admin 2 (087786720942)</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">Chat &rarr;</span>
              </a>
            </div>
          </Card>

          <Card className="p-5 text-xs text-gray-500 space-y-2 rounded-2xl">
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
