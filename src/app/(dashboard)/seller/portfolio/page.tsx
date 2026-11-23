'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getJokiPortfoliosAction, addPortfolioAction, type PortfolioItem } from '@/actions/portfolio';
import {
  BookOpen,
  Plus,
  FileText,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function SellerPortfolioPage() {
  const { toast } = useToast();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Portfolio Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [major, setMajor] = useState('');
  const [description, setDescription] = useState('');
  const [abstractPreview, setAbstractPreview] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  async function loadPortfolios() {
    setIsLoading(true);
    const res = await getJokiPortfoliosAction('user-seller-1');
    if (res.success && res.portfolios) {
      setPortfolios(res.portfolios);
    }
    setIsLoading(false);
  }

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !major.trim() || !abstractPreview.trim()) {
      toast({
        type: 'error',
        title: 'Input Tidak Lengkap',
        message: 'Mohon isi judul, jurusan, dan abstrak penelitian.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addPortfolioAction(
        title,
        major,
        description,
        abstractPreview,
        sampleUrl || undefined
      );

      if (!res.success) {
        toast({ type: 'error', title: 'Gagal', message: 'Gagal menambahkan portofolio' });
        return;
      }

      toast({
        type: 'success',
        title: 'Portofolio Ditambahkan!',
        message: 'Portofolio karya ilmiah Anda kini tampil pada profil publik.',
      });

      setIsAddOpen(false);
      setTitle('');
      setMajor('');
      setDescription('');
      setAbstractPreview('');
      setSampleUrl('');
      loadPortfolios();
    } catch {
      toast({ type: 'error', title: 'Kesalahan Sistem', message: 'Gagal menyimpan portofolio' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Galeri Portofolio & Keahlian Riset
            </h1>
            <Badge variant="forest">Showcase</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tampilkan sampel karya ilmiah, publikasi, dan analisis data untuk membangun kredibilitas di mata mahasiswa.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Portofolio Baru
        </Button>
      </div>

      {portfolios.length === 0 ? (
        <EmptyState
          title="Belum Ada Portofolio"
          description="Tambahkan sampel penelitian atau paper ilmiah yang pernah Anda kerjakan untuk menarik klien mahasiswa."
          actionLabel="Tambah Portofolio Sekarang"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((item) => (
            <Card key={item.id} className="p-6 space-y-3 hover:border-forest-600 transition-colors">
              <div className="flex items-center justify-between">
                <Badge variant="forest">{item.major}</Badge>
                <span className="text-[10px] text-gray-400">{formatDate(item.created_at)}</span>
              </div>

              <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                {item.description}
              </p>

              <div className="rounded-md bg-surface-muted p-3 text-xs text-gray-700 italic border border-gray-200">
                <strong className="block not-italic text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Preview Abstrak:
                </strong>
                &ldquo;{item.abstract_preview}&rdquo;
              </div>

              {item.sample_file_url && (
                <div className="pt-2">
                  <a
                    href={item.sample_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-forest-800 hover:underline inline-flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" /> Buka Sampel Publikasi <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Portfolio Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Portofolio Akademik Baru"
        description="Pastikan data karya ilmiah tidak melanggar hak cipta atau kerahasiaan klien masa lalu."
      >
        <form onSubmit={handleAddPortfolio} className="space-y-4 pt-2 text-xs text-left">
          <Input
            label="Judul Publikasi / Proyek Penelitian"
            placeholder="Contoh: Implementasi Metode Random Forest pada Klasifikasi Citra Medis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Disiplin Ilmu / Jurusan"
            placeholder="Contoh: Teknik Informatika / Statistika Terapan"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uraikan metodologi, software yang digunakan (Python/R/SPSS), dan hasil temuan utama..."
              className="w-full rounded-md border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-gray-700">Preview Abstrak Ilmiah</label>
            <textarea
              rows={3}
              value={abstractPreview}
              onChange={(e) => setAbstractPreview(e.target.value)}
              placeholder="Kutipan ringkasan abstrak untuk ditampilkan pada kartu portofolio..."
              className="w-full rounded-md border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
              required
            />
          </div>

          <Input
            label="Tautan Berkas Sampel / PDF (Opsional)"
            placeholder="https://..."
            value={sampleUrl}
            onChange={(e) => setSampleUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Simpan ke Galeri Portofolio
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
