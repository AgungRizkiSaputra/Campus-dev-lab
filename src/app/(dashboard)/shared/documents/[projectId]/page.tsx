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

export default function DocumentCenterPage() {
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
      category: 'DRAFT_INITIAL',
      uploader: 'Tim Jokiskripsiku',
      role: 'seller',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-3',
      name: 'Hasil_Uji_Turnitin_Bab3_Sim_9persen.pdf',
      path: 'turnitin/turnitin_bab3_report.pdf',
      size: '850 KB',
      category: 'PLAGIARISM_REPORT',
      uploader: 'Tim Jokiskripsiku',
      role: 'seller',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'DRAFT_INITIAL' | 'REVISION' | 'FINAL_DELIVERABLE' | 'PLAGIARISM_REPORT'>('DRAFT_INITIAL');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = async (doc: ProjectDocument) => {
    toast({
      type: 'info',
      title: 'Menyiapkan Unduhan Aman',
      message: `Mengunduh file terenkripsi ${doc.name}...`,
    });

    try {
      const res = await getSecureDocumentUrlAction(doc.path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, '_blank');
      } else {
        toast({
          type: 'error',
          title: 'Akses Ditolak',
          message: 'Tautan unduh kedaluwarsa atau tidak memiliki izin akses.',
        });
      }
    } catch {
      toast({ type: 'error', title: 'Kesalahan Sistem', message: 'Gagal mengunduh dokumen' });
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        name: docName.endsWith('.pdf') || docName.endsWith('.docx') ? docName : `${docName}.docx`,
        path: `milestones/${docName}`,
        size: '1.5 MB',
        category: uploadCategory,
        uploader: 'Tim Jokiskripsiku',
        role: 'seller',
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setIsUploadOpen(false);
      setDocName('');

      toast({
        type: 'success',
        title: 'Dokumen Berhasil Diunggah',
        message: 'File telah terenkripsi dan tersedia untuk diunduh mahasiswa.',
      });
    }, 1000);
  };

  const getCategoryBadge = (cat: ProjectDocument['category']) => {
    switch (cat) {
      case 'BRIEF':
        return <Badge variant="gray">Panduan / Bahan</Badge>;
      case 'DRAFT_INITIAL':
        return <Badge variant="forest">Draf Pengerjaan</Badge>;
      case 'REVISION':
        return <Badge variant="warning">Revisi Draf</Badge>;
      case 'FINAL_DELIVERABLE':
        return <Badge variant="success">Hasil Akhir ACC</Badge>;
      case 'PLAGIARISM_REPORT':
        return <Badge variant="burgundy">Uji Turnitin Resmi</Badge>;
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
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Pesanan
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Pusat Dokumen &amp; Hasil Uji Turnitin
            </h1>
            <Badge variant="forest">Terkunci &amp; Aman</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Repositori draf skripsi, sertifikat Turnitin, dan pedoman penulisan terenkripsi untuk Pesanan #{projectId}.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)} className="font-bold">
          <Upload className="h-4 w-4 mr-1.5" /> Unggah Dokumen Baru
        </Button>
      </div>

      {/* Security Warning Notice */}
      <div className="rounded-2xl bg-forest-50 p-4 border border-forest-100 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-forest-900 leading-relaxed">
          <strong className="text-forest-950 block mb-0.5">Jaminan Keamanan &amp; Kerahasiaan Dokumen</strong>
          Seluruh berkas yang diunggah diproteksi enkripsi private bucket. Akses unduh menggunakan Signed URL temporer berdurasi 60 detik. Turnitin dilakukan dengan mode <em>No-Repository</em> sehingga naskah Anda tidak akan tersimpan di database publik.
        </div>
      </div>

      {/* Documents Table */}
      <Card className="overflow-hidden border-gray-200 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Berkas</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pengunggah</TableHead>
              <TableHead>Waktu Unggah</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-forest-900">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-xs block truncate max-w-xs sm:max-w-md">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{doc.size}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                <TableCell className="text-xs text-gray-600">
                  <span className="font-medium text-gray-900">{doc.uploader}</span>
                </TableCell>
                <TableCell className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Unduh
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Upload Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Berkas Baru"
        description="Pilih kategori berkas dan masukkan nama dokumen yang akan diserahkan."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2 text-left">
          <Input
            label="Nama Berkas / Judul Dokumen"
            placeholder="Contoh: Draf_Bab_4_Hasil_Pengujian.docx"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            required
          />

          <Select
            label="Kategori Berkas"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as any)}
            options={[
              { value: 'DRAFT_INITIAL', label: 'Draf Pengerjaan Bab' },
              { value: 'PLAGIARISM_REPORT', label: 'Laporan Uji Turnitin Resmi' },
              { value: 'REVISION', label: 'Draf Revisi' },
              { value: 'FINAL_DELIVERABLE', label: 'Naskah Final ACC' },
            ]}
          />

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-500 bg-gray-50">
            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <span className="font-semibold text-gray-700 block">Pilih file dari komputer</span>
            <span className="text-[10px] text-gray-400">Mendukung file DOCX, PDF, ZIP (Maks. 50MB)</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading} className="font-bold">
              Unggah Dokumen
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
