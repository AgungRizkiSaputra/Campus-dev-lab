'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate, downloadFileSafely } from '@/lib/utils';
import { saveUploadedFile, downloadMilestoneDocument, formatBytes } from '@/lib/file-storage';
import {
  getProjectMilestonesAction,
  approveMilestoneAction,
  requestMilestoneRevisionAction,
  submitMilestoneWorkAction,
} from '@/actions/milestones';
import { getProjectByIdAction } from '@/actions/projects';
import { openDisputeAction } from '@/actions/disputes';
import type { Milestone, Project } from '@/types/database.types';
import { serviceRequiresTurnitin } from '@/lib/services-config';
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
  Upload,
  Send,
  Sparkles,
  Paperclip,
  Check,
  Eye,
  MessageSquare,
  CreditCard,
  GraduationCap,
  Star,
  Award,
  Trophy,
} from 'lucide-react';
import { addAppNotification } from '@/lib/notifications';

export default function BuyerMilestonesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('PLAGIARISM_DETECTED');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Seller Submission Dialog State
  const [isSubmitWorkOpen, setIsSubmitWorkOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const [docFileType, setDocFileType] = useState('');
  const [turnitinScore, setTurnitinScore] = useState<number>(8);
  const [turnitinFileName, setTurnitinFileName] = useState('');
  const [turnitinFileUrl, setTurnitinFileUrl] = useState('');
  const [turnitinFileSize, setTurnitinFileSize] = useState('');
  const [turnitinFileType, setTurnitinFileType] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Completion Celebration Dialog & Review States
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const turnitinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('joki_auth_session');
        if (raw) {
          setCurrentUser(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    }
    loadMilestones();
  }, [projectId]);

  const isSeller = currentUser?.role === 'seller';

  async function loadMilestones() {
    setIsLoading(true);

    let proj: Project | null = null;
    const projRes = await getProjectByIdAction(projectId);
    if (projRes.success && projRes.project) {
      proj = projRes.project;
    } else if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('joki_user_projects');
        if (rawLocal) {
          const list: Project[] = JSON.parse(rawLocal);
          proj = list.find((p) => p.id === projectId) || null;
        }
      } catch {
        // ignore
      }
    }
    setProject(proj);

    const isFull = (proj as any)?.payment_mode !== 'MILESTONE';

    // 1. Check local storage cache for milestones
    let localMilestones: Milestone[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        const rawM = localStorage.getItem(`joki_project_milestones_${projectId}`);
        if (rawM) {
          localMilestones = JSON.parse(rawM);
        }
      } catch {
        // ignore
      }
    }

    // Jika skema adalah BAYAR FULL LANGSUNG
    if (isFull) {
      if (localMilestones && localMilestones.length > 0) {
        // Jika ada lebih dari 1 tahap pada bayar full (warisan data lama), satukan menjadi 1 pengerjaan utuh
        const existingSubDoc = localMilestones.find((m) => m.submission_doc_url || m.submission_doc_name);
        const existingTurnitin = localMilestones.find((m) => m.plagiarism_report_url || m.plagiarism_report_name);
        const isAllApproved = localMilestones.every((m) => m.status === 'APPROVED');
        const isAnySubmitted = localMilestones.some((m) => m.status === 'SUBMITTED');
        const isAnyRevision = localMilestones.some((m) => m.status === 'REVISION');

        const consolidated: Milestone = {
          id: `mile-${projectId}-full`,
          project_id: projectId,
          order_index: 1,
          title: 'Pengerjaan Tugas Lengkap & Penyerahan Akhir',
          description: 'Pengerjaan tuntas seluruh berkas tugas, draf akademik, dan dokumen kelengkapan sesuai instruksi.',
          amount: proj?.budget_min || 150000,
          due_date: proj?.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: isAllApproved ? 'APPROVED' : isAnySubmitted ? 'SUBMITTED' : isAnyRevision ? 'REVISION' : 'IN_PROGRESS',
          submission_notes: existingSubDoc?.submission_notes || localMilestones[0]?.submission_notes || null,
          submission_doc_url: existingSubDoc?.submission_doc_url || null,
          submission_doc_name: existingSubDoc?.submission_doc_name || null,
          submission_doc_size: existingSubDoc?.submission_doc_size || null,
          submission_doc_type: existingSubDoc?.submission_doc_type || null,
          plagiarism_report_url: existingTurnitin?.plagiarism_report_url || null,
          plagiarism_report_name: existingTurnitin?.plagiarism_report_name || null,
          plagiarism_report_size: existingTurnitin?.plagiarism_report_size || null,
          plagiarism_score: existingTurnitin?.plagiarism_score ?? 8,
          submitted_at: existingSubDoc?.submitted_at || null,
          approved_at: isAllApproved ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setMilestones([consolidated]);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify([consolidated]));
          } catch {}
        }
        setIsLoading(false);
        return;
      }

      // Ambil dari action untuk skema FULL
      const res = await getProjectMilestonesAction(
        projectId,
        proj?.service_type,
        proj?.budget_min,
        'FULL'
      );
      if (res.success && res.milestones) {
        setMilestones(res.milestones);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify(res.milestones));
          } catch {}
        }
      }
      setIsLoading(false);
      return;
    }

    // Jika skema adalah BERTAHAP (MILESTONE)
    if (localMilestones && localMilestones.length > 1) {
      setMilestones(localMilestones);
      setIsLoading(false);
      return;
    }

    const res = await getProjectMilestonesAction(
      projectId,
      proj?.service_type,
      proj?.budget_min,
      'MILESTONE'
    );
    if (res.success && res.milestones) {
      setMilestones(res.milestones);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify(res.milestones));
        } catch {}
      }
    }
    setIsLoading(false);
  }

  const isFullPayment = (project as any)?.payment_mode !== 'MILESTONE';
  const requiresTurnitin = serviceRequiresTurnitin(project?.service_type);
  const allMilestonesApproved = milestones.length > 0 && milestones.every((m) => m.status === 'APPROVED');
  const isCompleted = (project as any)?.status === 'COMPLETED' || allMilestonesApproved;

  // Seller Action: Open Submit Work Modal
  const handleOpenSubmitModal = (mile: Milestone) => {
    setSelectedMilestone(mile);
    setSubmissionNotes(
      mile.submission_notes ||
      (requiresTurnitin
        ? `Draf ${mile.title} telah selesai dikerjakan sesuai pedoman akademik dan metodologi riset kampus. Laporan uji Turnitin resmi terlampir dengan skor < 15%.`
        : `Hasil pengerjaan ${mile.title} telah selesai dikerjakan secara rapi dan komprehensif sesuai instruksi yang diberikan.`)
    );
    setDocFileName(mile.submission_doc_name || (mile.submission_doc_url ? 'Draf_Tugas_Selesai.docx' : ''));
    setDocFileUrl(mile.submission_doc_url || '');
    setDocFileSize(mile.submission_doc_size || '');
    setDocFileType(mile.submission_doc_type || '');
    setTurnitinScore(mile.plagiarism_score ?? 8);
    setTurnitinFileName(mile.plagiarism_report_name || (mile.plagiarism_report_url ? 'Sertifikat_Turnitin_Resmi.pdf' : ''));
    setTurnitinFileUrl(mile.plagiarism_report_url || '');
    setTurnitinFileSize(mile.plagiarism_report_size || '');
    setIsSubmitWorkOpen(true);
  };

  // File Handlers for Seller
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize = formatBytes(file.size);
    setDocFileName(file.name);
    setDocFileSize(formattedSize);
    setDocFileType(file.type || 'application/octet-stream');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = (event.target?.result as string) || '';
      setDocFileUrl(dataUrl);
      if (selectedMilestone) {
        await saveUploadedFile(`milestone_submission_${selectedMilestone.id}`, {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTurnitinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize = formatBytes(file.size);
    setTurnitinFileName(file.name);
    setTurnitinFileSize(formattedSize);
    setTurnitinFileType(file.type || 'application/pdf');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = (event.target?.result as string) || '';
      setTurnitinFileUrl(dataUrl);
      if (selectedMilestone) {
        await saveUploadedFile(`milestone_turnitin_${selectedMilestone.id}`, {
          name: file.name,
          type: file.type || 'application/pdf',
          size: file.size,
          dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Seller Submit Work to Mahasiswa
  const handleSubmitWork = async () => {
    if (!selectedMilestone) return;

    if (!submissionNotes.trim()) {
      toast({
        type: 'error',
        title: 'Catatan Pengerjaan Kosong',
        message: 'Mohon tuliskan ringkasan atau catatan hasil pengerjaan bab.',
      });
      return;
    }

    if (!docFileUrl && !docFileName) {
      toast({
        type: 'error',
        title: 'Dokumen Draf Wajib',
        message: 'Mohon unggah dokumen draf hasil pengerjaan bab (Word, PDF, PPTX, atau ZIP).',
      });
      return;
    }

    if (requiresTurnitin && !turnitinFileUrl && !turnitinFileName) {
      toast({
        type: 'error',
        title: 'Turnitin Lock Wajib',
        message: 'Turnitin Lock: Untuk layanan skripsi / karya ilmiah, Anda wajib melampirkan laporan / sertifikat Turnitin.',
      });
      return;
    }

    setIsSubmittingWork(true);
    try {
      // 1. Simpan berkas ke IndexedDB
      if (docFileUrl) {
        await saveUploadedFile(`milestone_submission_${selectedMilestone.id}`, {
          name: docFileName || 'Dokumen_Tugas.docx',
          type: docFileType || 'application/octet-stream',
          size: 0,
          dataUrl: docFileUrl,
        });
      }
      if (requiresTurnitin && turnitinFileUrl) {
        await saveUploadedFile(`milestone_turnitin_${selectedMilestone.id}`, {
          name: turnitinFileName || 'Laporan_Turnitin.pdf',
          type: turnitinFileType || 'application/pdf',
          size: 0,
          dataUrl: turnitinFileUrl,
        });
      }

      // 2. Kirim ke Server Action
      const isDocLarge = docFileUrl.length > 200000;
      const isTurnitinLarge = turnitinFileUrl.length > 200000;

      await submitMilestoneWorkAction(
        selectedMilestone.id,
        submissionNotes,
        isDocLarge ? `indexeddb://milestone_submission_${selectedMilestone.id}` : (docFileUrl || selectedMilestone.submission_doc_url || ''),
        requiresTurnitin
          ? (isTurnitinLarge ? `indexeddb://milestone_turnitin_${selectedMilestone.id}` : (turnitinFileUrl || selectedMilestone.plagiarism_report_url || ''))
          : undefined,
        requiresTurnitin ? Number(turnitinScore) : undefined,
        projectId,
        project?.service_type,
        {
          submissionDocName: docFileName,
          submissionDocSize: docFileSize,
          submissionDocType: docFileType,
          plagiarismReportName: requiresTurnitin ? turnitinFileName : undefined,
          plagiarismReportSize: requiresTurnitin ? turnitinFileSize : undefined,
        }
      );

      // 3. Update local storage secara aman
      const updated = milestones.map((m) =>
        m.id === selectedMilestone.id
          ? {
            ...m,
            status: 'SUBMITTED' as const,
            submission_notes: submissionNotes,
            submission_doc_url: docFileUrl.length > 80000 ? `indexeddb://milestone_submission_${m.id}` : (docFileUrl || m.submission_doc_url),
            submission_doc_name: docFileName || m.submission_doc_name,
            submission_doc_size: docFileSize || m.submission_doc_size,
            submission_doc_type: docFileType || m.submission_doc_type,
            plagiarism_report_url: requiresTurnitin
              ? (turnitinFileUrl.length > 80000 ? `indexeddb://milestone_turnitin_${m.id}` : (turnitinFileUrl || m.plagiarism_report_url))
              : undefined,
            plagiarism_report_name: requiresTurnitin ? (turnitinFileName || m.plagiarism_report_name) : undefined,
            plagiarism_report_size: requiresTurnitin ? (turnitinFileSize || m.plagiarism_report_size) : undefined,
            plagiarism_score: requiresTurnitin ? Number(turnitinScore) : undefined,
            submitted_at: new Date().toISOString(),
          }
          : m
      );

      setMilestones(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage quota warning:', e);
        }
      }

      toast({
        type: 'success',
        title: 'Hasil Tugas Berhasil Diserahkan!',
        message: requiresTurnitin
          ? 'Draf bab dan sertifikat Turnitin telah diteruskan ke mahasiswa untuk diperiksa dan di-ACC.'
          : 'Berkas tugas telah diteruskan ke mahasiswa untuk diperiksa dan disetujui (ACC).',
      });

      setIsSubmitWorkOpen(false);
    } catch {
      toast({
        type: 'error',
        title: 'Gagal Menyerahkan Tugas',
        message: 'Terjadi kesalahan sistem saat mengirim draf.',
      });
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Buyer Action: Approve Milestone
  const handleApprove = async (mile: Milestone) => {
    try {
      await approveMilestoneAction(mile.id);

      const updated = milestones.map((m) => {
        if (m.id === mile.id) {
          return { ...m, status: 'APPROVED' as const, approved_at: new Date().toISOString() };
        }
        if (m.order_index === mile.order_index + 1 && m.status === 'LOCKED') {
          // Jika Lunas 100%, otomatis lanjut ke IN_PROGRESS
          // Jika Bertahap (MILESTONE), tetap LOCKED menunggu pembayaran termin berikutnya
          return isFullPayment ? { ...m, status: 'IN_PROGRESS' as const } : m;
        }
        return m;
      });

      setMilestones(updated);

      // Cek apakah seluruh pengerjaan telah selesai (Tahap 4 selesai atau Pengerjaan Full selesai)
      const allDone = updated.every((m) => m.status === 'APPROVED');
      if (allDone) {
        if (typeof window !== 'undefined') {
          try {
            const rawLocal = localStorage.getItem('joki_user_projects');
            if (rawLocal) {
              const list: Project[] = JSON.parse(rawLocal);
              const pIdx = list.findIndex((p) => p.id === projectId);
              if (pIdx !== -1) {
                list[pIdx].status = 'COMPLETED';
                localStorage.setItem('joki_user_projects', JSON.stringify(list));
              }
            }
          } catch {
            // ignore
          }
        }

        // Kirim pemberitahuan resmi ke lonceng notifikasi platform
        addAppNotification({
          title: isFullPayment
            ? `🎓 Pengerjaan Selesai & Disetujui (ACC): ${project?.title || 'Tugas Anda'}`
            : `🎓 Seluruh 4 Tahap Tuntas: ${project?.title || 'Tugas Anda'}`,
          message: isFullPayment
            ? `Pengerjaan tugas telah disahkan (ACC). Dana Rekber sebesar ${formatRupiah(project?.budget_min || 0)} telah sukses dicairkan ke tim penjoki.`
            : `Seluruh 4 tahapan bab telah disahkan (ACC). Seluruh dana Rekber platform telah 100% sukses dicairkan ke tim penjoki.`,
          type: 'project',
        });

        // Buka modal dialog perayaan resmi penyelesaian proyek
        setIsCelebrationOpen(true);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
      }

      toast({
        type: 'success',
        title: allDone ? '🎉 Seluruh Pengerjaan Selesai (ACC)!' : 'Bab Tugas Disetujui (ACC)!',
        message: allDone
          ? isFullPayment
            ? 'Pengerjaan tugas telah disahkan 100%. Dana Rekber telah berhasil dicairkan ke tim penjoki.'
            : 'Seluruh tahapan (Tahap 1 s/d 4) telah selesai di-ACC. Dana Rekber telah 100% dicairkan ke tim penjoki.'
          : 'Draf disahkan. Dana termin telah dirilis ke penjoki. Silakan lakukan pembayaran termin untuk tahap selanjutnya.',
      });
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
      await requestMilestoneRevisionAction(selectedMilestone.id, revisionNotes);

      const updated = milestones.map((m) =>
        m.id === selectedMilestone.id
          ? { ...m, status: 'REVISION' as const, submission_notes: revisionNotes }
          : m
      );

      setMilestones(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`joki_project_milestones_${projectId}`, JSON.stringify(updated));
      }

      toast({
        type: 'info',
        title: 'Catatan Revisi Terkirim',
        message: 'Konsultan joki telah dinotifikasi untuk melakukan perbaikan draf tugas.',
      });

      setIsRevisionOpen(false);
      setRevisionNotes('');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Disetujui (ACC)</Badge>;
      case 'SUBMITTED':
        return <Badge variant="gold">Draf Diserahkan (Review)</Badge>;
      case 'REVISION':
        return <Badge variant="danger">Perlu Revisi</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="forest">Sedang Dikerjakan</Badge>;
      case 'LOCKED':
        return <Badge variant="gray">Terkunci</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <Link
          href={isSeller ? '/seller' : `/buyer/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {isSeller ? 'Kembali ke Dashboard Penjoki' : 'Kembali ke Detail Proyek'}
        </Link>

        {project && (
          <Link href={`/shared/chat/${project.id}`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold border-forest-200 text-forest-900">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
              {isSeller ? 'Buka Chat Mahasiswa' : 'Chat Tim Penjoki'}
            </Button>
          </Link>
        )}
      </div>

      {/* Header Info */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isSeller ? 'forest' : 'burgundy'}>
                {isSeller ? 'Workspace Tim Penjoki' : 'Workspace Mahasiswa'}
              </Badge>
              {project && (
                <span className="text-xs text-gray-500 font-medium">
                  {project.service_type} &bull; {project.major}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              {project?.title || 'Progres Tahapan Bab & Milestone'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isSeller
                ? requiresTurnitin
                  ? 'Kerjakan draf bab tugas ini, lakukan uji Turnitin resmi, dan serahkan ke mahasiswa untuk di-ACC.'
                  : 'Kerjakan tugas ini, unggah dokumen hasil pengerjaan, dan serahkan ke mahasiswa untuk di-ACC.'
                : requiresTurnitin
                  ? 'Pantau draf serahan tim joki, unduh laporan plagiarisme Turnitin, dan setujui bab untuk mencairkan saldo.'
                  : 'Pantau draf serahan tugas dari tim joki, periksa hasil pengerjaan, dan setujui untuk mencairkan saldo.'}
            </p>
          </div>
        </div>

        {/* Completion Celebratory Banner (Muncul otomatis saat proyek selesai 100%) */}
        {isCompleted ? (
          <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/60 p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-xs shrink-0">
                  <GraduationCap className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300">
                      ✓ Proyek Selesai 100% &bull; ACC Disahkan
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mt-1">
                    {isFullPayment
                      ? 'Selamat! Seluruh Pengerjaan Tugas Telah Selesai & Disetujui'
                      : 'Selamat! Seluruh 4 Tahap Pengerjaan Telah Tuntas & Disetujui'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {isFullPayment
                      ? `Seluruh naskah tugas telah Anda periksa dan sahkan. Dana Rekber platform sebesar ${formatRupiah(project?.budget_min || 0)} telah sukses dicairkan ke tim penjoki.`
                      : `Seluruh 4 tahapan bab telah Anda periksa dan sahkan (ACC). Seluruh dana Rekber platform telah 100% sukses dicairkan ke tim penjoki.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCelebrationOpen(true)}
                  className="bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Beri Penilaian / Ulasan
                </Button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFileSafely(
                      null,
                      `Sertifikat_Penyelesaian_Tugas_${project?.id || 'PROYEK'}.txt`,
                      {
                        projectTitle: project?.title,
                        serviceType: project?.service_type,
                        milestoneTitle: isFullPayment ? 'Penyelesaian Penuh 100%' : 'Penyelesaian Tahap 1 - 4',
                        submissionNotes: 'Seluruh berkas telah disetujui (ACC) oleh Mahasiswa dan dana rekber telah dicairkan secara sah ke tim penjoki.',
                      }
                    )
                  }
                  className="text-xs font-semibold text-forest-900 hover:underline bg-white/80 border border-forest-200 px-3 py-1.5 rounded-lg text-center cursor-pointer shadow-2xs"
                >
                  Unduh Berita Acara Selesai
                </button>
              </div>
            </div>
          </div>
        ) : isFullPayment ? (
          /* Payment Scheme Distinction Banner (Full Langsung) */
          <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                  Status Rekber: Pembayaran Lunas 100% (Dana HELD)
                </span>
                <span className="text-[11px] font-bold text-emerald-950 font-mono">
                  {formatRupiah(project?.budget_min || 0)}
                </span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                Anda telah melunasi deposit 100% di awal ke Rekber platform. Anda tidak perlu membayar lagi di setiap tahapan bab. Cukup periksa hasil kerja tim penjoki dan klik Setujui (ACC) jika sudah sesuai.
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs inline-block">
                ✓ Bebas Biaya Tambahan Per Bab
              </span>
            </div>
          </div>
        ) : (
          /* Payment Scheme Distinction Banner (Bertahap) */
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-700" />
                  Skema Pembayaran Bertahap (Termin per Tahap)
                </span>
                <span className="text-[11px] font-bold text-amber-950 font-mono">
                  Termin Aktif: Tahap {milestones.find((m) => m.status === 'IN_PROGRESS' || m.status === 'SUBMITTED' || m.status === 'REVISION')?.order_index || 1}
                </span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Anda membayar secara bertahap. Setelah memeriksa dan menyetujui (ACC) hasil pengerjaan tahap ini, silakan lanjutkan pembayaran deposit termin tahap berikutnya agar tim dapat melanjutkan pengerjaan bab selanjutnya.
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-[11px] font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs inline-block">
                ⚠️ Pembayaran Dibuka per Termin
              </span>
            </div>
          </div>
        )}

        {/* Guidance Banner for Penjoki */}
        {isSeller && (
          <div className="mt-4 rounded-xl bg-forest-900 text-white p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Instruksi Alur Pengerjaan Tim Jokiskripsiku
              </h3>
            </div>
            <p className="text-xs text-forest-100 leading-relaxed">
              1. Kerjakan tugas sesuai metodologi riset dan instruksi klien. <br />
              {requiresTurnitin && (
                <>
                  2. Pastikan dokumen sudah melalui uji <strong>Turnitin resmi (&lt; 20% similarity)</strong>. <br />
                </>
              )}
              3. Klik tombol <strong>Unggah Hasil Pengerjaan</strong> di bawah untuk menyerahkan berkas ke mahasiswa.
            </p>
          </div>
        )}
      </div>

      {/* Milestone List / Workspace Body */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Memuat tahapan tugas...</div>
        ) : isFullPayment ? (
          /* WORKSPACE SKEMA PEMBAYARAN FULL LANGSUNG: 1 Workspace Pengerjaan Utuh Terpadu */
          <div className="space-y-5">
            {/* Full Payment Stepper */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Alur Pengerjaan Penuh Terpadu (Lunas 100%)
                </span>
                <span className="text-xs font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-100 self-start sm:self-auto">
                  Total Rekber: {formatRupiah(project?.budget_min || 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>1. Deposit Rekber</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">Lunas 100% Ditahan Aman</p>
                </div>

                <div
                  className={`rounded-xl p-3 border space-y-1 ${
                    milestones[0]?.status !== 'IN_PROGRESS' || isCompleted
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-forest-50 border-forest-300 ring-1 ring-forest-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    {milestones[0]?.status !== 'IN_PROGRESS' || isCompleted ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-forest-700 animate-pulse" />
                    )}
                    <span>2. Pengerjaan Penuh</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    {milestones[0]?.status !== 'IN_PROGRESS' || isCompleted ? 'Pengerjaan Tuntas' : 'Dikerjakan Tim Inti'}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 border space-y-1 ${
                    milestones[0]?.submission_doc_url || milestones[0]?.submission_doc_name
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    {milestones[0]?.submission_doc_url || milestones[0]?.submission_doc_name ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span>3. Serah Berkas</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    {milestones[0]?.submission_doc_url || milestones[0]?.submission_doc_name
                      ? 'Tersedia Diunduh'
                      : 'Menunggu Serahan'}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 border space-y-1 ${
                    isCompleted ? 'bg-emerald-50 border-emerald-200 font-bold' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                    <span>4. Persetujuan (ACC)</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    {isCompleted ? 'Disahkan & Dana Cair' : 'Menunggu ACC'}
                  </p>
                </div>
              </div>
            </div>

            {/* Single Unified Deliverable Card for Full Payment */}
            {milestones[0] && (() => {
              const deliverable = milestones[0];
              const isApproved = deliverable.status === 'APPROVED';
              const isSubmitted = deliverable.status === 'SUBMITTED';
              const isInProgress = deliverable.status === 'IN_PROGRESS';
              const isRevision = deliverable.status === 'REVISION';

              return (
                <Card
                  className={`p-6 transition-all ${
                    isApproved
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isSubmitted
                      ? 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-300 shadow-sm'
                      : isRevision
                      ? 'border-red-300 bg-red-50/20'
                      : 'border-forest-600 bg-white ring-1 ring-forest-600 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-forest-900 text-xs font-bold text-white shrink-0 shadow-2xs">
                          ★
                        </span>
                        <h3 className="font-serif font-bold text-xl text-gray-900">
                          {deliverable.title}
                        </h3>
                        {getStatusBadge(deliverable.status)}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {deliverable.description ||
                          'Pengerjaan menyeluruh terhadap instruksi tugas mahasiswa secara lengkap dan siap diserahkan.'}
                      </p>

                      {/* Info saat tim masih mengerjakan */}
                      {isInProgress && !deliverable.submission_doc_url && !deliverable.submission_doc_name && (
                        <div className="rounded-xl bg-forest-50 p-4 border border-forest-100 text-xs text-forest-900 space-y-1">
                          <p className="font-semibold flex items-center gap-1.5 text-forest-950">
                            <Clock className="h-4 w-4 text-emerald-600 animate-pulse" />
                            Tim Jokiskripsiku Sedang Mengerjakan Tugas Anda
                          </p>
                          <p className="text-gray-600 leading-relaxed text-[11px]">
                            Seluruh berkas tugas sedang disusun secara tuntas. Anda akan diberi tahu begitu berkas selesai diunggah ke ruang kerja ini untuk Anda periksa.
                          </p>
                        </div>
                      )}

                      {/* Berkas Serahan Hasil Tugas ketika sudah diserahkan */}
                      {(isSubmitted || isApproved) && (
                        <div className="rounded-xl bg-forest-50/80 p-4 border border-forest-100 space-y-3 mt-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-forest-200/60">
                            <span className="font-bold text-forest-950 uppercase text-[10px] flex items-center gap-1.5">
                              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                              {requiresTurnitin ? 'Hasil Serahan Berkas Lengkap & Laporan Turnitin' : 'Hasil Serahan Berkas Tugas Lengkap'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Diserahkan: {deliverable.submitted_at ? formatDate(deliverable.submitted_at) : 'Baru saja'}
                            </span>
                          </div>

                          {deliverable.submission_notes && (
                            <div className="bg-white p-3.5 rounded-lg border border-forest-100 text-gray-700 leading-relaxed shadow-2xs">
                              <span className="font-semibold text-forest-900 block text-[11px] mb-1">Catatan Pengerjaan dari Tim:</span>
                              &ldquo;{deliverable.submission_notes}&rdquo;
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            {requiresTurnitin && deliverable.plagiarism_score !== null && deliverable.plagiarism_score !== undefined && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500 font-medium">Uji Turnitin:</span>
                                <Badge variant={deliverable.plagiarism_score < 20 ? 'forest' : 'danger'}>
                                  {deliverable.plagiarism_score}% Similarity Index
                                </Badge>
                              </div>
                            )}

                            {requiresTurnitin && (deliverable.plagiarism_report_url || deliverable.plagiarism_report_name) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  toast({
                                    type: 'info',
                                    title: 'Menyiapkan Dokumen Turnitin',
                                    message: `Mengunduh ${deliverable.plagiarism_report_name || 'Laporan Turnitin'}...`,
                                  });
                                  const ok = await downloadMilestoneDocument(deliverable.id, 'turnitin', {
                                    fallbackUrl: deliverable.plagiarism_report_url,
                                    fallbackName: deliverable.plagiarism_report_name,
                                    fallbackMeta: {
                                      projectTitle: project?.title,
                                      milestoneTitle: deliverable.title,
                                      score: deliverable.plagiarism_score,
                                      serviceType: project?.service_type,
                                    },
                                  });
                                  if (ok) {
                                    toast({
                                      type: 'success',
                                      title: 'Laporan Turnitin Berhasil Diunduh!',
                                      message: `File telah disimpan ke folder Download perangkat Anda.`,
                                    });
                                  }
                                }}
                                className="font-bold text-forest-900 hover:bg-forest-50 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-forest-200 shadow-2xs transition-colors cursor-pointer text-xs"
                              >
                                <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Unduh {deliverable.plagiarism_report_name || 'Laporan Turnitin'}</span>
                                {deliverable.plagiarism_report_size && (
                                  <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.5 rounded font-medium">
                                    {deliverable.plagiarism_report_size}
                                  </span>
                                )}
                              </button>
                            )}

                            {(deliverable.submission_doc_url || deliverable.submission_doc_name) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const targetFileName =
                                    deliverable.submission_doc_name ||
                                    (project?.service_type === 'PPT'
                                      ? `Presentasi_${deliverable.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
                                      : `Draf_${deliverable.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);

                                  toast({
                                    type: 'info',
                                    title: 'Menyiapkan Berkas Tugas',
                                    message: `Mengunduh ${targetFileName}...`,
                                  });
                                  const ok = await downloadMilestoneDocument(deliverable.id, 'submission', {
                                    fallbackUrl: deliverable.submission_doc_url,
                                    fallbackName: targetFileName,
                                    fallbackMeta: {
                                      projectTitle: project?.title,
                                      milestoneTitle: deliverable.title,
                                      submissionNotes: deliverable.submission_notes,
                                      serviceType: project?.service_type,
                                    },
                                  });
                                  if (ok) {
                                    toast({
                                      type: 'success',
                                      title: 'Dokumen Tugas Berhasil Diunduh!',
                                      message: `Berkas ${targetFileName} telah tersimpan ke folder Download perangkat Anda.`,
                                    });
                                  }
                                }}
                                className="font-bold text-forest-900 hover:bg-forest-50 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-forest-200 shadow-2xs transition-colors cursor-pointer text-xs"
                              >
                                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Unduh {deliverable.submission_doc_name || (project?.service_type === 'PPT' ? 'Dokumen PPT' : 'Dokumen Tugas Lengkap')}</span>
                                {deliverable.submission_doc_size && (
                                  <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.5 rounded font-medium">
                                    {deliverable.submission_doc_size}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Catatan Revisi Aktif jika sedang dalam perbaikan */}
                      {isRevision && deliverable.submission_notes && (
                        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-900 space-y-1">
                          <span className="font-bold uppercase text-[10px] text-red-700 block">Catatan Permintaan Revisi Anda:</span>
                          <p className="italic leading-relaxed">&ldquo;{deliverable.submission_notes}&rdquo;</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                        <span>Status Rekber: <strong className="text-emerald-900 font-bold">Lunas 100% ({formatRupiah(deliverable.amount)})</strong></span>
                        <span>&bull;</span>
                        <span>Estimasi Selesai: {formatDate(deliverable.due_date)}</span>
                      </div>
                    </div>

                    {/* Aksi Mahasiswa / Penjoki untuk Deliverable Full */}
                    <div className="flex flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                      {/* 1. SELLER ACTIONS: Submit work when IN_PROGRESS or REVISION */}
                      {isSeller && (isInProgress || isRevision) && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleOpenSubmitModal(deliverable)}
                          className="w-full sm:w-auto bg-forest-900 hover:bg-forest-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Upload className="h-4 w-4 text-emerald-400" />
                          {isRevision ? 'Unggah Perbaikan Revisi' : requiresTurnitin ? 'Unggah Hasil Tugas & Turnitin' : 'Unggah Hasil Pengerjaan Selesai'}
                        </Button>
                      )}

                      {/* 2. BUYER ACTIONS: Review when SUBMITTED */}
                      {!isSeller && isSubmitted && (
                        <div className="space-y-2 w-full sm:w-auto text-right">
                          <Button
                            variant="primary"
                            size="md"
                            className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold shadow-sm flex items-center justify-center gap-1.5"
                            onClick={() => handleApprove(deliverable)}
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Setujui Hasil (ACC) &amp; Selesaikan Proyek
                          </Button>

                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold"
                              onClick={() => {
                                setSelectedMilestone(deliverable);
                                setIsRevisionOpen(true);
                              }}
                            >
                              Minta Revisi
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setSelectedMilestone(deliverable);
                                setIsDisputeOpen(true);
                              }}
                            >
                              <Gavel className="h-3.5 w-3.5 mr-1" /> Sengketa
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 3. Status Badges */}
                      {isApproved && (
                        <div className="text-right text-xs text-emerald-900 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-600" /> Tugas Disetujui (ACC) &bull; Selesai 100%
                        </div>
                      )}

                      {isSeller && isSubmitted && (
                        <div className="text-right text-xs text-amber-900 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                          <Clock className="h-3.5 w-3.5 inline mr-1 text-amber-600 animate-pulse" />
                          Menunggu ACC Mahasiswa
                        </div>
                      )}

                      {!isSeller && (isInProgress || isRevision) && (
                        <div className="text-right text-xs text-forest-900 font-medium bg-forest-50 px-3 py-1.5 rounded-lg border border-forest-200">
                          <Clock className="h-3.5 w-3.5 inline mr-1 text-forest-700 animate-pulse" />
                          {isRevision ? 'Tim sedang merevisi tugas...' : 'Tim sedang menyusun pengerjaan penuh...'}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        ) : (
          /* WORKSPACE SKEMA PEMBAYARAN BERTAHAP (MILESTONE): Tahap 1 s/d 4 */
          milestones.map((mile) => {
            const isApproved = mile.status === 'APPROVED';
            const isSubmitted = mile.status === 'SUBMITTED';
            const isInProgress = mile.status === 'IN_PROGRESS';
            const isRevision = mile.status === 'REVISION';
            const isLocked = mile.status === 'LOCKED';

            return (
              <Card
                key={mile.id}
                className={`p-6 transition-all ${
                  isApproved
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isSubmitted
                    ? 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-300 shadow-sm'
                    : isRevision
                    ? 'border-red-300 bg-red-50/20'
                    : isInProgress
                    ? 'border-forest-600 bg-white ring-1 ring-forest-600 shadow-sm'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-xs font-bold text-white shrink-0">
                        {mile.order_index}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-gray-900">{mile.title}</h3>
                      {getStatusBadge(mile.status)}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{mile.description}</p>

                    {/* Submission Details when submitted or approved */}
                    {(isSubmitted || isApproved) && (
                      <div className="rounded-xl bg-forest-50/80 p-4 border border-forest-100 space-y-3 mt-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-forest-200/60">
                          <span className="font-bold text-forest-950 uppercase text-[10px] flex items-center gap-1.5">
                            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                            {requiresTurnitin ? 'Hasil Serahan Tugas & Laporan Turnitin' : 'Hasil Serahan Tugas'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Diserahkan: {mile.submitted_at ? formatDate(mile.submitted_at) : 'Baru saja'}
                          </span>
                        </div>

                        {mile.submission_notes && (
                          <div className="bg-white p-3 rounded-lg border border-forest-100 text-gray-700 leading-relaxed">
                            <span className="font-semibold text-forest-900 block text-[11px] mb-1">Catatan Pengerjaan:</span>
                            &ldquo;{mile.submission_notes}&rdquo;
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {requiresTurnitin && mile.plagiarism_score !== null && mile.plagiarism_score !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500 font-medium">Uji Turnitin:</span>
                              <Badge variant={mile.plagiarism_score < 20 ? 'forest' : 'danger'}>
                                {mile.plagiarism_score}% Similarity Index
                              </Badge>
                            </div>
                          )}

                          {requiresTurnitin && (mile.plagiarism_report_url || mile.plagiarism_report_name) && (
                            <button
                              type="button"
                              onClick={async () => {
                                toast({
                                  type: 'info',
                                  title: 'Menyiapkan Dokumen Turnitin',
                                  message: `Mengunduh ${mile.plagiarism_report_name || 'Laporan Turnitin'}...`,
                                });
                                const ok = await downloadMilestoneDocument(mile.id, 'turnitin', {
                                  fallbackUrl: mile.plagiarism_report_url,
                                  fallbackName: mile.plagiarism_report_name,
                                  fallbackMeta: {
                                    projectTitle: project?.title,
                                    milestoneTitle: mile.title,
                                    score: mile.plagiarism_score,
                                    serviceType: project?.service_type,
                                  },
                                });
                                if (ok) {
                                  toast({
                                    type: 'success',
                                    title: 'Laporan Turnitin Berhasil Diunduh!',
                                    message: `File telah disimpan ke folder Download perangkat Anda.`,
                                  });
                                }
                              }}
                              className="font-bold text-forest-900 hover:bg-forest-50 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-forest-200 shadow-2xs transition-colors cursor-pointer text-xs"
                            >
                              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Unduh {mile.plagiarism_report_name || 'Laporan Turnitin'}</span>
                              {mile.plagiarism_report_size && (
                                <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.5 rounded font-medium">
                                  {mile.plagiarism_report_size}
                                </span>
                              )}
                            </button>
                          )}

                          {(mile.submission_doc_url || mile.submission_doc_name) && (
                            <button
                              type="button"
                              onClick={async () => {
                                const targetFileName =
                                  mile.submission_doc_name ||
                                  (project?.service_type === 'PPT'
                                    ? `Presentasi_${mile.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
                                    : `Draf_${mile.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);

                                toast({
                                  type: 'info',
                                  title: 'Menyiapkan Berkas Tugas',
                                  message: `Mengunduh ${targetFileName}...`,
                                });
                                const ok = await downloadMilestoneDocument(mile.id, 'submission', {
                                  fallbackUrl: mile.submission_doc_url,
                                  fallbackName: targetFileName,
                                  fallbackMeta: {
                                    projectTitle: project?.title,
                                    milestoneTitle: mile.title,
                                    submissionNotes: mile.submission_notes,
                                    serviceType: project?.service_type,
                                  },
                                });
                                if (ok) {
                                  toast({
                                    type: 'success',
                                    title: 'Dokumen Tugas Berhasil Diunduh!',
                                    message: `Berkas ${targetFileName} telah tersimpan ke folder Download perangkat Anda.`,
                                  });
                                }
                              }}
                              className="font-bold text-forest-900 hover:bg-forest-50 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-forest-200 shadow-2xs transition-colors cursor-pointer text-xs"
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Unduh {mile.submission_doc_name || (project?.service_type === 'PPT' ? 'Dokumen PPT' : 'Dokumen Tugas')}</span>
                              {mile.submission_doc_size && (
                                <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.5 rounded font-medium">
                                  {mile.submission_doc_size}
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Revision Note Banner if in revision */}
                    {isRevision && mile.submission_notes && (
                      <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-900 space-y-1">
                        <span className="font-bold uppercase text-[10px] text-red-700 block">Catatan Revisi dari Mahasiswa:</span>
                        <p className="italic leading-relaxed">&ldquo;{mile.submission_notes}&rdquo;</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span>Nominal Rekber: <strong className="text-forest-900 font-bold">{formatRupiah(mile.amount)}</strong></span>
                      <span>&bull;</span>
                      <span>Jatuh Tempo: {formatDate(mile.due_date)}</span>
                    </div>
                  </div>

                  {/* Action Column Based on Role & State */}
                  <div className="flex flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                    {/* 1. SELLER ACTIONS: Submit work when IN_PROGRESS or REVISION */}
                    {isSeller && (isInProgress || isRevision) && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenSubmitModal(mile)}
                        className="w-full sm:w-auto bg-forest-900 hover:bg-forest-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Upload className="h-4 w-4 text-emerald-400" />
                        {isRevision ? 'Unggah Perbaikan Revisi' : requiresTurnitin ? 'Unggah Hasil Bab & Turnitin' : 'Unggah Hasil Pengerjaan'}
                      </Button>
                    )}

                    {/* 2. BUYER ACTIONS: Review when SUBMITTED */}
                    {!isSeller && isSubmitted && (
                      <div className="space-y-2 w-full sm:w-auto text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full bg-forest-900 hover:bg-forest-800 text-white font-bold shadow-sm"
                          onClick={() => handleApprove(mile)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-300" /> Setujui Bab (ACC) &amp; Rilis Dana
                        </Button>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold"
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
                            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setSelectedMilestone(mile);
                              setIsDisputeOpen(true);
                            }}
                          >
                            <Gavel className="h-3.5 w-3.5 mr-1" /> Sengketa
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 3. Status Badges for Other Combinations */}
                    {isApproved && (
                      <div className="text-right text-xs text-emerald-900 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600" /> Bab Disetujui (ACC)
                      </div>
                    )}

                    {isSeller && isSubmitted && (
                      <div className="text-right text-xs text-amber-900 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <Clock className="h-3.5 w-3.5 inline mr-1 text-amber-600 animate-pulse" />
                        Menunggu ACC Mahasiswa
                      </div>
                    )}

                    {!isSeller && (isInProgress || isRevision) && (
                      <div className="text-right text-xs text-forest-900 font-medium bg-forest-50 px-3 py-1.5 rounded-lg border border-forest-200">
                        <Clock className="h-3.5 w-3.5 inline mr-1 text-forest-700 animate-pulse" />
                        {isRevision ? 'Tim sedang merevisi tugas...' : 'Tim sedang menyusun draf...'}
                      </div>
                    )}

                    {isLocked && (
                      <div className="space-y-1.5 text-right">
                        <div className="text-right text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center justify-end gap-1">
                          <Lock className="h-3.5 w-3.5 text-gray-400" />
                          {!isFullPayment ? 'Terkunci: Menunggu Pembayaran Termin' : 'Terkunci (Tahap Berikutnya)'}
                        </div>
                        {!isSeller && !isFullPayment && milestones.find((m) => m.order_index === mile.order_index - 1)?.status === 'APPROVED' && (
                          <Link href={`/buyer/projects/${projectId}/payment`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Bayar Termin Tahap Ini ({formatRupiah(mile.amount)})
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* SELLER MODAL: Penyerahan Hasil Tugas */}
      <Dialog
        isOpen={isSubmitWorkOpen}
        onClose={() => setIsSubmitWorkOpen(false)}
        title={requiresTurnitin ? "Serahkan Hasil Pengerjaan Tugas & Uji Turnitin" : "Serahkan Hasil Pengerjaan Tugas"}
        description={
          requiresTurnitin
            ? "Unggah berkas draf yang telah selesai beserta sertifikat resmi pengecekan plagiarisme Turnitin."
            : "Unggah berkas tugas yang telah selesai (Word, PDF, PPTX, Excel, atau ZIP) beserta catatan pengerjaan untuk mahasiswa."
        }
        className="max-w-lg p-5"
      >
        {selectedMilestone && (
          <div className="space-y-4 pt-1 text-xs text-left">
            <div className="rounded-lg bg-surface-muted p-3 border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tahap yang Diserahkan</span>
              <p className="font-serif font-bold text-sm text-gray-900">{selectedMilestone.title}</p>
              <p className="text-[11px] text-gray-500">Nominal Milestone: {formatRupiah(selectedMilestone.amount)}</p>
            </div>

            {/* Catatan Pengerjaan */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 block text-xs">Catatan / Uraian untuk Mahasiswa:</label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder={
                  requiresTurnitin
                    ? "Jelaskan ringkasan bab yang telah Anda selesaikan, penyesuaian panduan dosen, atau tips presentasi..."
                    : "Jelaskan ringkasan hasil pengerjaan tugas, instruksi pembacaan berkas, atau catatan penting..."
                }
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            {/* Dokumen Draf Pengerjaan */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 block text-xs">Dokumen Berkas Tugas (Word / PDF / PPTX / ZIP / Excel):</label>
              <div
                onClick={() => docInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-forest-600 rounded-xl p-3 bg-gray-50/60 hover:bg-forest-50/30 transition-all text-center"
              >
                <input
                  type="file"
                  ref={docInputRef}
                  onChange={handleDocFileChange}
                  accept=".doc,.docx,.pdf,.pptx,.ppt,.xlsx,.xls,.zip,.rar"
                  className="hidden"
                />
                <FileText className="h-5 w-5 text-forest-700 mx-auto mb-1" />
                <p className="font-bold text-xs text-forest-900">
                  {docFileName ? docFileName : 'Klik untuk memilih dokumen tugas dari laptop / HP'}
                </p>
                {docFileSize ? (
                  <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Ukuran Berkas: {docFileSize}
                  </span>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-0.5">Format .docx, .pdf, .pptx, .xlsx, .zip (Maks. 50MB)</p>
                )}
              </div>
            </div>

            {/* Skor Turnitin & Dokumen Laporan Turnitin: HANYA DITAMPILKAN JIKA LAYANAN SKRIPSI / KARYA ILMIAH */}
            {requiresTurnitin && (
              <div className="rounded-xl border border-forest-200 bg-forest-50/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Skor Uji Plagiasi Turnitin:
                  </span>
                  <Badge variant={turnitinScore < 20 ? 'forest' : 'danger'}>
                    {turnitinScore}% Similarity Index
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={turnitinScore}
                    onChange={(e) => setTurnitinScore(Number(e.target.value))}
                    className="w-20 rounded-lg border border-gray-300 p-1.5 text-center font-bold text-sm text-forest-900 bg-white"
                  />
                  <span className="text-[11px] text-gray-600">
                    {turnitinScore < 20 ? '✓ Memenuhi standar garansi Turnitin Jokiskripsiku (< 20%)' : '⚠️ Skor di atas 20%, disarankan parafrase ulang'}
                  </span>
                </div>

                <div className="pt-1 space-y-1">
                  <label className="font-bold text-forest-950 block text-[11px]">Unggah Bukti / Sertifikat Turnitin (.pdf / .png):</label>
                  <div
                    onClick={() => turnitinInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-forest-300 hover:border-forest-600 rounded-lg p-2.5 bg-white text-center transition-colors"
                  >
                    <input
                      type="file"
                      ref={turnitinInputRef}
                      onChange={handleTurnitinFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    <FileCheck2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold text-[11px] text-forest-900">
                      {turnitinFileName ? turnitinFileName : 'Klik untuk unggah file laporan Turnitin (.pdf)'}
                    </p>
                    {turnitinFileSize && (
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        Ukuran Berkas: {turnitinFileSize}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Action Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setIsSubmitWorkOpen(false)} disabled={isSubmittingWork}>
                Batal
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitWork}
                isLoading={isSubmittingWork}
                className="bg-forest-900 hover:bg-forest-800 text-white font-bold"
              >
                <Send className="h-3.5 w-3.5 mr-1" /> Kirimkan Hasil ke Mahasiswa
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Revision Dialog for Mahasiswa */}
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
              Kirim Catatan Revisi
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dispute Dialog for Mahasiswa */}
      <Dialog
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="Buka Tiket Sengketa (Dispute)"
        description="Dana escrow akan dibekukan sementara. Tim penengah admin akan meninjau komplain Anda."
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Alasan Sengketa:</label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-xs"
            >
              <option value="PLAGIARISM_DETECTED">Plagiarisme Terdeteksi Tinggi (&gt; 20%)</option>
              <option value="POOR_QUALITY">Kualitas Tulisan Tidak Sesuai Standar Akademik</option>
              <option value="DEADLINE_BREACH">Melewati Tenggat Waktu Tanpa Konfirmasi</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Uraian Masalah:</label>
            <textarea
              rows={3}
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              placeholder="Berikan bukti dan rincian masalah..."
              className="w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsDisputeOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleOpenDispute}>
              Konfirmasi Sengketa
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Completion Celebration & Review Dialog */}
      <Dialog
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        title={isFullPayment ? "🎉 Selamat! Pengerjaan Tugas Telah Selesai 100%" : "🎓 Selamat! Seluruh 4 Tahap Telah Tuntas & Di-ACC"}
        description="Seluruh hasil tugas telah disahkan secara resmi dan dana rekber telah sukses dicairkan ke tim penjoki."
        className="max-w-md p-6 text-center"
      >
        <div className="space-y-4 pt-1 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Pengerjaan Tugas Selesai Tuntas
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Terima kasih telah memercayakan pengerjaan tugas akademik Anda kepada <strong>Jokiskripsiku</strong>.
            </p>
          </div>

          {/* Rating stars */}
          <div className="rounded-xl bg-surface-muted p-4 border border-gray-100 space-y-2">
            <span className="text-xs font-bold text-gray-800 block">
              Beri Penilaian &amp; Rating untuk Tim Penjoki:
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-600 font-medium">
              {rating === 5
                ? '⭐⭐⭐⭐⭐ Luar Biasa & Sangat Memuaskan!'
                : rating === 4
                ? '⭐⭐⭐⭐ Sangat Baik & Tepat Waktu'
                : '⭐⭐⭐ Cukup Baik'}
            </p>
          </div>

          {/* Testimonial review */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-gray-700 block">
              Testimoni &amp; Ulasan Kepuasan Anda:
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tuliskan ulasan atau kepuasan Anda terhadap kecepatan & kualitas hasil pengerjaan tim..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCelebrationOpen(false)}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-forest-900 hover:bg-forest-800 text-white font-bold"
              onClick={() => {
                setReviewSubmitted(true);
                setIsCelebrationOpen(false);
                toast({
                  type: 'success',
                  title: 'Ulasan Berhasil Dikirim!',
                  message: 'Terima kasih atas penilaian Anda. Sukses selalu untuk studi Anda!',
                });
              }}
            >
              Kirim Penilaian &amp; Ulasan
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
