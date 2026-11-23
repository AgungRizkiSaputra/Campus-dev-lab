'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useToast } from '@/components/ui/toast';
import { formatRupiah } from '@/lib/utils';
import { projectWizardSchema, type ProjectWizardInput } from '@/lib/validations/project.schema';
import { createProjectAction } from '@/actions/projects';
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
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'joki_skripsi_project_draft';

const serviceTypeOptions = [
  { value: 'CONSULTATION', label: 'Konsultasi & Bimbingan Teori Akademik' },
  { value: 'RESEARCH_ASSISTANCE', label: 'Asistensi Metodologi & Analisis Data (SPSS / Python / R)' },
  { value: 'PROOFREADING', label: 'Proofreading & Penyuntingan Tata Bahasa Ilmiah (EYD)' },
  { value: 'FORMATTING', label: 'Formatting Skripsi & Sitasi Otomatis (Mendeley / Zotero)' },
];

export default function CreateProjectWizard() {
  const router = useRouter();
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
    service_type: 'CONSULTATION',
    description: '',
    budget_min: 1500000,
    budget_max: 2500000,
    deadline: '',
    initial_draft_url: '',
    milestones_count: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Auto-load draft from localStorage
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

  // 2. Auto-save draft on changes
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

  // Step Validations
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.faculty.trim()) newErrors.faculty = 'Fakultas wajib diisi.';
      if (!formData.major.trim()) newErrors.major = 'Jurusan wajib diisi.';
      if (!formData.topic.trim()) newErrors.topic = 'Topik penelitian wajib diisi (minimal 5 karakter).';
      else if (formData.topic.length < 5) newErrors.topic = 'Topik terlalu singkat.';
    }

    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Judul skripsi wajib diisi.';
      else if (formData.title.length < 10) newErrors.title = 'Judul minimal 10 karakter.';

      if (!formData.description.trim()) newErrors.description = 'Deskripsi kebutuhan wajib diisi.';
      else if (formData.description.length < 30) newErrors.description = 'Deskripsi minimal 30 karakter agar joki paham.';
    }

    if (step === 3) {
      if (formData.budget_min < 100_000) newErrors.budget_min = 'Budget minimum minimal Rp 100.000.';
      if (formData.budget_max < formData.budget_min) newErrors.budget_max = 'Budget maksimum harus >= minimum.';
      if (!formData.deadline) newErrors.deadline = 'Tenggat waktu wajib dipilih.';
      else {
        const d = new Date(formData.deadline);
        const minD = new Date();
        minD.setDate(minD.getDate() + 2);
        if (d <= minD) newErrors.deadline = 'Deadline minimal 3 hari ke depan.';
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
        title: 'Formulir Belum Valid',
        message: 'Mohon periksa dan lengkapi kolom yang ditandai merah.',
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
          title: 'Gagal Mempublikasikan Proyek',
          message: res.error,
        });
        return;
      }

      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      toast({
        type: 'success',
        title: 'Proyek Berhasil Dipublikasikan!',
        message: 'Proyek Anda sekarang terbuka untuk menerima Blind Bidding dari joki terverifikasi.',
      });

      router.push('/buyer');
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Terjadi kesalahan saat mempublikasikan proyek.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { title: 'Bidang Studi & Layanan', desc: 'Fakultas, jurusan, dan model bimbingan' },
    { title: 'Spesifikasi & Draf', desc: 'Judul, latar belakang, dan dokumen awal' },
    { title: 'Anggaran & Tenggat', desc: 'Rentang budget dan timeline pengerjaan' },
    { title: 'Tinjau & Publikasi', desc: 'Konfirmasi final sebelum dibuka ke bursa' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Posting Kebutuhan Skripsi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Panduan bertahap (Guided Wizard) untuk menjaring penawaran dari konsultan akademik terverifikasi.
          </p>
        </div>

        {draftSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-forest-800 bg-forest-50 px-3 py-1.5 rounded-md border border-forest-100">
            <Save className="h-3.5 w-3.5 text-forest-700" />
            <span className="font-medium">{draftSavedAt}</span>
          </div>
        )}
      </div>

      {/* Wizard Progress Bar & Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span>Langkah {currentStep} dari 4: <strong className="text-forest-900">{stepTitles[currentStep - 1].title}</strong></span>
          <span className="text-forest-800 font-bold">{currentStep * 25}%</span>
        </div>
        <ProgressBar progress={currentStep * 25} showPercentage={false} />

        <div className="grid grid-cols-4 gap-2 pt-2">
          {stepTitles.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-sm p-2 text-center transition-all ${
                idx + 1 === currentStep
                  ? 'bg-forest-800 text-white shadow-sm'
                  : idx + 1 < currentStep
                  ? 'bg-forest-50 text-forest-900 border border-forest-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider">Tahap {idx + 1}</p>
              <p className="hidden sm:block text-xs font-semibold truncate mt-0.5">{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content Container */}
      <Card className="border-forest-100 shadow-card">
        <CardContent className="pt-6">
          {/* STEP 1: BIDANG STUDI & LAYANAN */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-gray-900">Bidang Keilmuan & Tipe Asistensi</h3>
                <p className="text-xs text-gray-500">Tentukan jurusan spesifik agar hanya joki yang berkompeten yang dapat menawar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fakultas"
                  placeholder="Contoh: Fakultas Teknik"
                  value={formData.faculty}
                  onChange={(e) => updateField('faculty', e.target.value)}
                  error={errors.faculty}
                  required
                />
                <Input
                  label="Jurusan / Program Studi"
                  placeholder="Contoh: Teknik Informatika / Akuntansi"
                  value={formData.major}
                  onChange={(e) => updateField('major', e.target.value)}
                  error={errors.major}
                  required
                />
              </div>

              <Input
                label="Fokus / Topik Penelitian"
                placeholder="Contoh: Deteksi Penyakit Tanaman dengan Convolutional Neural Network"
                value={formData.topic}
                onChange={(e) => updateField('topic', e.target.value)}
                error={errors.topic}
                helperText="Tuliskan kata kunci utama dari riset yang akan dilakukan."
                required
              />

              <Select
                label="Model Layanan yang Dibutuhkan"
                value={formData.service_type}
                onChange={(e) => updateField('service_type', e.target.value)}
                options={serviceTypeOptions}
                helperText="Pilih jenis pendampingan yang paling tepat sesuai dengan kebutuhan Anda."
              />
            </div>
          )}

          {/* STEP 2: SPESIFIKASI & DRAF */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-gray-900">Judul & Uraian Kebutuhan Riset</h3>
                <p className="text-xs text-gray-500">Berikan instruksi yang jelas mengenai bab apa saja yang membutuhkan bimbingan.</p>
              </div>

              <Input
                label="Usulan Judul Skripsi Lengkap"
                placeholder="Contoh: Analisis Sentimen Opini Publik terhadap Kebijakan Transportasi Menggunakan Algoritma BERT"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={errors.title}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Uraian Detail Kebutuhan & Ekspektasi
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Jelaskan kebutuhan Anda: misal butuh pendampingan olah data kuesioner 100 responden, bimbingan penulisan Bab 4 pembahasan, atau pembuatan kerangka konseptual..."
                  className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-600 font-medium">{errors.description}</p>
                )}
                <p className="text-xs text-gray-400">Minimal 30 karakter. Karakter saat ini: {formData.description.length}</p>
              </div>

              <Input
                label="Tautan Dokumen Pendukung / Pedoman Kampus (Opsional)"
                placeholder="https://drive.google.com/..."
                value={formData.initial_draft_url || ''}
                onChange={(e) => updateField('initial_draft_url', e.target.value)}
                helperText="Link Google Drive / OneDrive draf awal atau panduan format penulisan skripsi kampus Anda."
              />
            </div>
          )}

          {/* STEP 3: ANGGARAN & TENGGAT WAKTU */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-gray-900">Anggaran (Budget Range) & Timeline</h3>
                <p className="text-xs text-gray-500">Tentukan rentang harga wajar. Joki akan mengajukan penawaran rahasia (Blind Bid) dalam rentang ini.</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tenggat Waktu Akhir (Deadline)"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  error={errors.deadline}
                  helperText="Tenggat keseluruhan pengerjaan selesai."
                  required
                />

                <Select
                  label="Pembagian Tahapan Pembayaran (Milestones)"
                  value={String(formData.milestones_count)}
                  onChange={(e) => updateField('milestones_count', Number(e.target.value))}
                  options={[
                    { value: '2', label: '2 Tahap (Bab 1-3 & Bab 4-5)' },
                    { value: '3', label: '3 Tahap (Bab 1-2, Bab 3, Bab 4-5)' },
                    { value: '4', label: '4 Tahap (Per Bab)' },
                    { value: '5', label: '5 Tahap (Bab 1 s/d Bab 5 Lengkap)' },
                  ]}
                  helperText="Dana ditahan di Rekber dan hanya dilepas bertahap per bab yang disetujui."
                />
              </div>

              <div className="rounded-md bg-forest-50 p-4 border border-forest-100 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-forest-900 block mb-0.5">Proteksi Escrow Aktif</strong>
                  Anda tidak perlu membayar sekarang. Pembayaran deposit baru dilakukan setelah Anda memilih satu joki terbaik.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW SEBELUM SUBMIT */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-gray-900">Konfirmasi Rincian Proyek</h3>
                <p className="text-xs text-gray-500">Periksa kembali ringkasan proyek Anda sebelum dipublikasikan ke bursa blind bidding.</p>
              </div>

              <div className="rounded-md border border-gray-200 bg-surface-muted p-5 space-y-4 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Judul Skripsi</span>
                  <p className="font-serif text-base font-bold text-gray-900 mt-0.5">{formData.title}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-200/60 pt-3">
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Jurusan & Fakultas</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{formData.major}, {formData.faculty}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Topik Riset</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{formData.topic}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Model Layanan</span>
                    <Badge variant="forest" className="mt-1">{formData.service_type}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-200/60 pt-3">
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Rentang Anggaran</span>
                    <p className="font-bold text-forest-900 text-sm mt-0.5">
                      {formatRupiah(formData.budget_min)} - {formatRupiah(formData.budget_max)}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Tenggat Waktu</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{formData.deadline}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[10px] text-gray-400">Rencana Milestone</span>
                    <p className="font-semibold text-gray-800 mt-0.5">{formData.milestones_count} Tahapan Bertahap</p>
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-3">
                  <span className="font-bold uppercase text-[10px] text-gray-400">Uraian Kebutuhan</span>
                  <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                </div>
              </div>

              <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                <strong>Catatan Etika Akademik:</strong> Layanan platform terbatas pada konsultasi, bimbingan penelitian, proofreading, dan formatting. Mahasiswa tetap bertanggung jawab atas orisinalitas karya ilmiahnya.
              </div>
            </div>
          )}
        </CardContent>

        {/* Wizard Footer Controls */}
        <CardFooter className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Sebelumnya
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button variant="primary" size="sm" onClick={handleNext}>
              Selanjutnya <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSubmitting}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Publikasikan Proyek ke Bursa
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
