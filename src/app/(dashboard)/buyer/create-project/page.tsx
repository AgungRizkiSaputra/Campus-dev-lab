'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatRupiah } from '@/lib/utils';
import { projectWizardSchema, type ProjectWizardInput } from '@/lib/validations/project.schema';
import { createProjectAction } from '@/actions/projects';
import { getServiceConfig, type ServiceConfig } from '@/lib/services-config';
import {
  BookOpen,
  FileText,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  Clock,
  Sparkles,
  Laptop,
  Mail,
  SearchCheck,
  FileSearch,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'joki_skripsi_project_draft';

const serviceCatalog = [
  {
    value: 'SEMPRO',
    title: '1. SEMPRO',
    subtitle: 'Seminar Proposal',
    icon: BookOpen,
    tag: 'Bab 1–3',
    defaultMilestones: 3,
    minBudget: 800000,
    maxBudget: 1500000,
  },
  {
    value: 'SKRIPSI',
    title: '2. SKRIPSI',
    subtitle: 'Lengkap Bab 1–5',
    icon: GraduationCap,
    tag: 'Paket Lengkap',
    defaultMilestones: 5,
    minBudget: 1800000,
    maxBudget: 3500000,
  },
  {
    value: 'TUGAS',
    title: '3. TUGAS',
    subtitle: 'Tugas Kuliah Harian',
    icon: FileText,
    tag: 'Cepat & Akurat',
    defaultMilestones: 1,
    minBudget: 150000,
    maxBudget: 400000,
  },
  {
    value: 'UTS_UAS',
    title: '4. UTS / UAS',
    subtitle: 'Ujian Semester',
    icon: Clock,
    tag: 'Fast Response',
    defaultMilestones: 1,
    minBudget: 200000,
    maxBudget: 600000,
  },
  {
    value: 'MAKALAH',
    title: '5. MAKALAH',
    subtitle: 'Karya Tulis Ilmiah',
    icon: FileText,
    tag: 'Rapi & Terstruktur',
    defaultMilestones: 1,
    minBudget: 250000,
    maxBudget: 600000,
  },
  {
    value: 'PPT',
    title: '6. PPT',
    subtitle: 'Slide Presentasi Sidang',
    icon: Sparkles,
    tag: 'Desain Modern',
    defaultMilestones: 1,
    minBudget: 150000,
    maxBudget: 400000,
  },
  {
    value: 'WEBSITE_APP',
    title: '7. WEB & APLIKASI',
    subtitle: 'Coding Tugas/Skripsi IT',
    icon: Laptop,
    tag: 'Full-Stack',
    defaultMilestones: 3,
    minBudget: 1500000,
    maxBudget: 3500000,
  },
  {
    value: 'UNDANGAN_DIGITAL',
    title: '8. UNDANGAN DIGITAL',
    subtitle: 'Custom & Estetik',
    icon: Mail,
    tag: 'Mobile Responsive',
    defaultMilestones: 2,
    minBudget: 250000,
    maxBudget: 750000,
  },
  {
    value: 'CEK_PLAGIASI',
    title: '9. CEK PLAGIASI',
    subtitle: 'Uji Turnitin Resmi',
    icon: SearchCheck,
    tag: 'No Repository',
    defaultMilestones: 1,
    minBudget: 50000,
    maxBudget: 150000,
  },
  {
    value: 'TURUNIN_PLAGIASI',
    title: '10. TURUNIN PLAGIASI',
    subtitle: 'Parafrase Lolos Uji',
    icon: FileSearch,
    tag: 'Garansi < 20%',
    defaultMilestones: 2,
    minBudget: 350000,
    maxBudget: 850000,
  },
];

function CreateProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProjectWizardInput>({
    title: '',
    faculty: '',
    major: '',
    topic: '',
    service_type: 'SKRIPSI',
    description: '',
    budget_min: 1800000,
    budget_max: 3500000,
    deadline: '',
    initial_draft_url: '',
    milestones_count: 4,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentConfig = getServiceConfig(formData.service_type);

  // 1. Auto-select service from URL param if present
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      const config = getServiceConfig(serviceParam);
      setFormData((prev) => ({
        ...prev,
        service_type: config.value as any,
        budget_min: config.minBudget,
        budget_max: config.maxBudget,
        milestones_count: config.defaultMilestones,
      }));
    }
  }, [searchParams]);

  // 2. Auto-load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setDraftSavedAt('Draf sebelumnya dipulihkan');
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const saveDraft = (data: ProjectWizardInput) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setDraftSavedAt(`Tersimpan otomatis pk ${now}`);
    } catch {
      // Ignore
    }
  };

  const updateField = (field: keyof ProjectWizardInput, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveDraft(updated);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectService = (item: typeof serviceCatalog[0]) => {
    const config = getServiceConfig(item.value);
    const updated = {
      ...formData,
      service_type: item.value as any,
      budget_min: config.minBudget,
      budget_max: config.maxBudget,
      milestones_count: config.defaultMilestones,
    };
    setFormData(updated);
    saveDraft(updated);
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.service_type) newErrors.service_type = 'Layanan wajib dipilih.';
      if (!formData.faculty.trim()) newErrors.faculty = 'Fakultas wajib diisi.';
      if (!formData.major.trim()) newErrors.major = 'Jurusan / Prodi wajib diisi.';
      if (!formData.topic.trim()) newErrors.topic = 'Topik penelitian / mata kuliah wajib diisi.';
    }

    if (step === 2) {
      if (!formData.title.trim() || formData.title.length < 5) {
        newErrors.title = 'Judul tugas atau skripsi minimal 5 karakter.';
      }
      if (!formData.description.trim() || formData.description.length < 20) {
        newErrors.description = 'Instruksi pengerjaan minimal 20 karakter.';
      }
    }

    if (step === 3) {
      if (formData.budget_min < 50_000) newErrors.budget_min = 'Budget minimum minimal Rp 50.000.';
      if (formData.budget_max < formData.budget_min) newErrors.budget_max = 'Budget maksimum harus >= minimum.';
      if (!formData.deadline) newErrors.deadline = 'Tenggat waktu pengerjaan wajib dipilih.';
      else {
        const d = new Date(formData.deadline);
        const minD = new Date();
        minD.setDate(minD.getDate() + 1); // minimal besok
        if (d <= minD) newErrors.deadline = 'Tenggat waktu minimal 2 hari ke depan.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        type: 'error',
        title: 'Formulir Belum Lengkap',
        message: 'Mohon periksa kolom yang masih berwarna merah.',
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createProjectAction(formData);
      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Mengajukan Pesanan',
          message: res.error,
        });
        return;
      }

      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Save to client-side localStorage to guarantee immediate visibility
      if (res.project) {
        try {
          const raw = localStorage.getItem('joki_user_projects');
          const existing = raw ? JSON.parse(raw) : [];
          let currentUserName = '';
          const authRaw = localStorage.getItem('joki_auth_session');
          if (authRaw) {
            try {
              currentUserName = JSON.parse(authRaw)?.name || '';
            } catch {}
          }
          const projectWithBuyer = {
            ...res.project,
            student_name: currentUserName,
            buyer_name: currentUserName,
          };
          const updated = [projectWithBuyer, ...existing.filter((p: any) => p.id !== res.project!.id)];
          localStorage.setItem('joki_user_projects', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      toast({
        type: 'success',
        title: 'Pesanan Berhasil Diajukan!',
        message: 'Pesanan Anda telah diteruskan langsung ke Tim Inti Jokiskripsiku.',
      });

      router.push('/buyer/projects');
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Terjadi gangguan saat memproses pesanan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { title: 'Pilih Layanan & Jurusan', desc: '10 Opsi Layanan Jokiskripsiku' },
    { title: 'Instruksi & Dokumen', desc: 'Judul, panduan dosen & draf' },
    { title: 'Estimasi Biaya & Waktu', desc: 'Budget & tenggat pengerjaan' },
    { title: 'Konfirmasi Pesanan', desc: 'Kirim langsung ke Tim Ahli' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Formulir Pemesanan Layanan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pilih dari 10 layanan resmi Jokiskripsiku. Dikerjakan langsung oleh tim internal kami.
          </p>
        </div>

        {draftSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-forest-800 bg-forest-50 px-3 py-1.5 rounded-lg border border-forest-200">
            <Save className="h-3.5 w-3.5 text-forest-700" />
            <span className="font-medium">{draftSavedAt}</span>
          </div>
        )}
      </div>

      {/* Stepper Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span>
            Langkah {currentStep} dari 4:{' '}
            <strong className="text-forest-900">{stepTitles[currentStep - 1].title}</strong>
          </span>
          <span className="text-forest-800 font-bold">{currentStep * 25}%</span>
        </div>
        <ProgressBar progress={currentStep * 25} showPercentage={false} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {stepTitles.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-2.5 text-center transition-all ${
                idx + 1 === currentStep
                  ? 'bg-forest-800 text-white shadow-sm'
                  : idx + 1 < currentStep
                  ? 'bg-forest-50 text-forest-900 border border-forest-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider">Tahap {idx + 1}</p>
              <p className="text-xs font-semibold truncate mt-0.5">{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card Content */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardContent className="pt-6">
          {/* STEP 1: PILIH DARI 10 LAYANAN & BIDANG STUDI */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  1. Pilih Jenis Layanan yang Dibutuhkan
                </h2>
                <p className="text-xs text-gray-500">
                  Klik salah satu kartu di bawah ini sesuai kebutuhan tugas/skripsi Anda.
                </p>
              </div>

              {/* 10 Services Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {serviceCatalog.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.service_type === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelectService(item)}
                      className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-forest-800 bg-forest-50/90 text-forest-950 shadow-sm ring-2 ring-forest-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-forest-300 hover:bg-forest-50/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5">
                          <CheckCircle2 className="h-4 w-4 text-forest-800" />
                        </div>
                      )}
                      <div className={`p-2 rounded-lg mb-2 ${isSelected ? 'bg-forest-800 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold leading-tight">{item.title}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{item.subtitle}</span>
                      <span className="mt-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-gray-200 text-forest-800">
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h3 className="font-serif text-base font-bold text-gray-900">
                  2. Informasi Kampus & Jurusan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Fakultas"
                    placeholder="Contoh: Fakultas Teknik / Ekonomi"
                    value={formData.faculty}
                    onChange={(e) => updateField('faculty', e.target.value)}
                    error={errors.faculty}
                    required
                  />
                  <Input
                    label="Jurusan / Program Studi"
                    placeholder="Contoh: Teknik Informatika / Manajemen"
                    value={formData.major}
                    onChange={(e) => updateField('major', e.target.value)}
                    error={errors.major}
                    required
                  />
                </div>

                <Input
                  label="Mata Kuliah / Topik Fokus"
                  placeholder="Contoh: Metodologi Penelitian Kuantitatif / Analisis Data"
                  value={formData.topic}
                  onChange={(e) => updateField('topic', e.target.value)}
                  error={errors.topic}
                  helperText="Tuliskan mata kuliah atau topik utama agar tim menyiapkan referensi yang tepat."
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: SPESIFIKASI & INSTRUKSI */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-[10px] font-bold text-forest-800 mb-1.5">
                  <Sparkles className="h-3 w-3 text-forest-700" />
                  <span>Kategori: {currentConfig.name}</span>
                </div>
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  {currentConfig.step2Title}
                </h2>
                <p className="text-xs text-gray-500">
                  {currentConfig.step2Desc}
                </p>
              </div>

              <Input
                label="Judul Tugas / Topik"
                placeholder={currentConfig.titlePlaceholder}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={errors.title}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Uraian Lengkap Instruksi Pengerjaan
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={currentConfig.descPlaceholder}
                  className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-600 font-medium">{errors.description}</p>
                )}
                <p className="text-xs text-gray-400">Minimal 20 karakter.</p>
              </div>

              <Input
                label="Tautan Berkas Pendukung / Google Drive (Opsional)"
                placeholder="https://drive.google.com/..."
                value={formData.initial_draft_url || ''}
                onChange={(e) => updateField('initial_draft_url', e.target.value)}
                helperText={currentConfig.draftHelper}
              />
            </div>
          )}

          {/* STEP 3: ESTIMASI BIAYA & DEADLINE */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Estimasi Anggaran &amp; Tenggat Waktu
                </h2>
                <p className="text-xs text-gray-500">
                  Rekomendasi biaya untuk <strong>{currentConfig.name}</strong>: {formatRupiah(currentConfig.minBudget)} – {formatRupiah(currentConfig.maxBudget)}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Budget Minimum (Rp)"
                  type="number"
                  step={50000}
                  value={formData.budget_min}
                  onChange={(e) => updateField('budget_min', Number(e.target.value))}
                  error={errors.budget_min}
                  helperText={formatRupiah(formData.budget_min)}
                  required
                />
                <Input
                  label="Budget Maksimum (Rp)"
                  type="number"
                  step={50000}
                  value={formData.budget_max}
                  onChange={(e) => updateField('budget_max', Number(e.target.value))}
                  error={errors.budget_max}
                  helperText={formatRupiah(formData.budget_max)}
                  required
                />
              </div>

              <Input
                label="Tenggat Waktu Selesai (Deadline)"
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                error={errors.deadline}
                helperText="Pilih tanggal kapan hasil draf ini harus sudah Anda terima."
                required
              />

              <div className="rounded-lg bg-forest-50 p-3.5 border border-forest-200 text-xs text-forest-900 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Dilindungi Rekber Resmi:</strong>
                  Pembayaran tidak langsung cair ke siapapun sebelum draf diserahkan dan disetujui oleh Anda.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KONFIRMASI PESANAN */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Tinjau Ringkasan Pesanan Anda
                </h2>
                <p className="text-xs text-gray-500">
                  Pesanan akan langsung masuk ke antrean pengerjaan Tim Inti Jokiskripsiku.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-surface-muted/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Layanan Dipilih</span>
                    <h3 className="font-serif text-base font-bold text-forest-950">
                      {currentConfig.name}
                    </h3>
                  </div>
                  <Badge variant="forest">Dikerjakan Tim Inti</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">Judul</span>
                    <span className="font-semibold text-gray-900">{formData.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">Jurusan / Kampus</span>
                    <span className="font-semibold text-gray-900">{formData.major} ({formData.faculty})</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">Estimasi Budget</span>
                    <span className="font-semibold text-forest-900">
                      {formatRupiah(formData.budget_min)} – {formatRupiah(formData.budget_max)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">Target Deadline</span>
                    <span className="font-semibold text-gray-900">{formData.deadline}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200/80 pt-3 text-xs">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold mb-1">Instruksi Pengerjaan</span>
                  <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                {/* DYNAMIC STAGES FOR SELECTED SERVICE */}
                <div className="border-t border-gray-200/80 pt-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900">
                    Rencana Tahap Pengerjaan ({currentConfig.name}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {currentConfig.stages.map((st) => (
                      <div key={st.num} className="rounded-lg bg-white p-2.5 border border-gray-200 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-forest-900 font-bold text-xs">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-800 text-white text-[9px]">
                            {st.num}
                          </span>
                          <span className="truncate">{st.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">{st.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-xs text-forest-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-forest-950">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Jaminan Layanan Jokiskripsiku:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-forest-800 text-xs">
                  <li>Pengerjaan langsung oleh tim internal teruji tanpa pihak ketiga.</li>
                  <li>Laporan Turnitin disertakan pada setiap penyerahan draf.</li>
                  <li>Garansi revisi sampai tuntas sesuai instruksi Anda.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Stepper Footer Buttons */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" size="md" onClick={handlePrev} disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button variant="primary" size="md" onClick={handleNext} className="font-bold">
                Langkah Selanjutnya <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="bg-forest-800 hover:bg-forest-900 font-bold px-6 shadow-md"
              >
                Kirim Pesanan ke Tim <CheckCircle2 className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8"><Skeleton className="h-64 w-full" /></div>}>
      <CreateProjectForm />
    </Suspense>
  );
}
