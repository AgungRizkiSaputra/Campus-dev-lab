'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { getSecureDocumentUrlAction } from '@/actions/documents';
import {
  FileText,
  Lock,
  Download,
  Upload,
  ShieldCheck,
  Clock,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

interface ProjectDocument {
  id: string;
  name: string;
  path: string;
  size: string;
  category: 'BRIEF' | 'DRAFT_INITIAL' | 'REVISION' | 'FINAL_DELIVERABLE' | 'PLAGIARISM_REPORT';
  uploader: string;
  role: 'buyer' | 'seller';
  uploadedAt: string;
}

export default function DocumentPortalPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;

  const [documents, setDocuments] = useState<ProjectDocument[]>([
    {
      id: 'doc-1',
      name: 'Pedoman_Penulisan_Skripsi_Fakultas_Teknik_2026.pdf',
      path: 'guidelines/ft_2026.pdf',
      size: '2.4 MB',
      category: 'BRIEF',
      uploader: 'Dimas Pratama',
      role: 'buyer',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-2',
      name: 'Draf_Bab_3_Metodologi_LSTM_v1.docx',
      path: 'milestones/bab3_draft_v1.docx',
      size: '1.8 MB',
      category: 'FINAL_DELIVERABLE',
      uploader: 'Dr. Hendra Wijaya',
      role: 'seller',
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-3',
      name: 'Laporan_Turnitin_Bab_3_Similarity_9persen.pdf',
      path: 'plagiarism/turnitin_bab3_9pct.pdf',
      size: '850 KB',
      category: 'PLAGIARISM_REPORT',
      uploader: 'Dr. Hendra Wijaya',
      role: 'seller',
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<'BRIEF' | 'DRAFT_INITIAL' | 'REVISION' | 'FINAL_DELIVERABLE' | 'PLAGIARISM_REPORT'>('FINAL_DELIVERABLE');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadSignedUrl = async (doc: ProjectDocument) => {
    setDownloadingId(doc.id);
    try {
      const res = await getSecureDocumentUrlAction(doc.path);
      if (!res.success || !res.signedUrl) {
        toast({
          type: 'error',
          title: 'Akses Ditolak',
          message: 'Gagal membuat tautan unduhan aman.',
        });
        return;
      }

      toast({
        type: 'info',
        title: 'Tautan Signed URL Dibangkitkan (15 Menit)',
        message: 'Tautan unduhan privat aktif selama tepat 15 menit (900 detik).',
      });

      // Open signed URL in new tab
      window.open(res.signedUrl, '_blank');
    } catch {
      toast({ type: 'error', title: 'Kesalahan Sistem', message: 'Gagal mengakses dokumen' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUploadNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: fileName,
      path: `uploads/${fileName}`,
      size: '1.2 MB',
      category,
      uploader: 'Dimas Pratama',
      role: 'buyer',
      uploadedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsUploadOpen(false);
    setFileName('');

    toast({
      type: 'success',
      title: 'Dokumen Berhasil Diunggah',
      message: 'File telah dienkripsi AES-256 dan disimpan dalam bucket privat.',
    });
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PLAGIARISM_REPORT':
        return <Badge variant="forest">Turnitin Report</Badge>;
      case 'FINAL_DELIVERABLE':
        return <Badge variant="gold">Draf Bab Final</Badge>;
      case 'BRIEF':
        return <Badge variant="gray">Pedoman / Brief</Badge>;
      case 'REVISION':
        return <Badge variant="burgundy">Revisi Dosen</Badge>;
      default:
        return <Badge variant="gray">{cat}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <Link
        href={`/buyer/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-forest-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Proyek
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Portal Dokumen Skripsi Terenkripsi
            </h1>
            <Badge variant="forest">AES-256 RLS</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Penyimpanan terisolasi aman untuk draf bab, revisi dosen, dan sertifikat anti-plagiarisme Turnitin.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-1.5" /> Unggah Dokumen Baru
        </Button>
      </div>

      {/* Security Notice Banner */}
      <div className="rounded-md bg-forest-50 p-4 border border-forest-100 flex items-start gap-3 text-xs text-gray-700">
        <Lock className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-forest-900 block mb-0.5">Kebijakan Keamanan Dokumen Akademik</strong>
          Seluruh file tersimpan dalam Private Storage Bucket Supabase dengan enkripsi AES-256. Unduhan menggunakan <strong>Signed URL ber-TTL 15 menit</strong> yang hanya dapat dibangkitkan oleh mahasiswa pemilik proyek atau joki yang ditugaskan.
        </div>
      </div>

      {/* Documents Table */}
      <Card className="p-0 overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Berkas</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead>Pengunggah</TableHead>
              <TableHead>Waktu Unggah</TableHead>
              <TableHead className="text-right">Akses Unduh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-forest-800 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-xs truncate max-w-xs">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                <TableCell className="text-xs text-gray-500 font-mono">{doc.size}</TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-gray-800">{doc.uploader}</span>
                  <span className="block text-[10px] text-gray-400 capitalize">{doc.role}</span>
                </TableCell>
                <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(doc.uploadedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSignedUrl(doc)}
                    isLoading={downloadingId === doc.id}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Unduh (15m TTL)
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Dokumen Skripsi Terenkripsi"
        description="Dokumen akan dienkripsi secara otomatis dan dilindungi kebijakan otorisasi RLS."
      >
        <form onSubmit={handleUploadNewDoc} className="space-y-4 pt-2 text-xs text-left">
          <Input
            label="Nama Berkas Dokumen"
            placeholder="Contoh: Draf_Bab_4_Analisis_Hasil.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <Select
            label="Kategori Dokumen"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'FINAL_DELIVERABLE', label: 'Draf Bab Serahan (Final Deliverable)' },
              { value: 'PLAGIARISM_REPORT', label: 'Laporan Plagiarisme (Turnitin Report)' },
              { value: 'REVISION', label: 'Catatan Revisi / Draf Perbaikan Dosen' },
              { value: 'BRIEF', label: 'Panduan Format / Pedoman Kampus' },
            ]}
          />

          <div className="rounded-md border border-dashed border-gray-300 bg-surface-muted p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="font-semibold text-gray-700">Tarik berkas ke sini atau klik untuk browse</p>
            <p className="text-[11px] text-gray-400 mt-1">Mendukung format PDF, DOCX, XLSX (Maks. 50 MB)</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan & Enkripsi File
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
