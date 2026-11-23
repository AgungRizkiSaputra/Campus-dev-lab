'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getProjectsAction } from '@/actions/projects';
import { submitBidAction, getMyBidsAction } from '@/actions/biddings';
import type { Project, Bidding } from '@/types/database.types';
import {
  Search,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export default function SellerExplorePage() {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [myBids, setMyBids] = useState<Bidding[]>([]);
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Dialog State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(2000000);
  const [proposal, setProposal] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [projRes, bidsRes] = await Promise.all([
      getProjectsAction({ role: 'seller' }),
      getMyBidsAction(),
    ]);

    if (projRes.success && projRes.projects) {
      setProjects(projRes.projects);
    }
    if (bidsRes.success && bidsRes.bids) {
      setMyBids(bidsRes.bids as Bidding[]);
    }
    setIsLoading(false);
  }

  const handleOpenBid = (proj: Project) => {
    setSelectedProject(proj);
    setBidAmount(proj.budget_min);
    setProposal('Tim Jokiskripsiku siap mengerjakan tugas ini dengan standar riset terbaik dan garansi lolos Turnitin < 20%.');
    setEstimatedDays(14);
    setIsBidOpen(true);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!proposal.trim() || proposal.length < 20) {
      toast({
        type: 'error',
        title: 'Catatan Pengerjaan Belum Lengkap',
        message: 'Mohon tuliskan rencana pengerjaan minimal 20 karakter.',
      });
      return;
    }

    if (bidAmount <= 0) {
      toast({
        type: 'error',
        title: 'Nominal Tidak Valid',
        message: 'Nominal biaya pengerjaan harus lebih dari 0.',
      });
      return;
    }

    setIsSubmittingBid(true);
    try {
      const res = await submitBidAction({
        project_id: selectedProject.id,
        bid_amount: bidAmount,
        proposal,
        estimated_days: estimatedDays,
      });

      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Mengonfirmasi Pesanan',
          message: res.error,
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Pesanan Dikonfirmasi!',
        message: 'Konfirmasi pengerjaan dan estimasi biaya telah dikirimkan ke mahasiswa.',
      });

      setIsBidOpen(false);
      loadData();
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Gagal memproses konfirmasi.',
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const hasBidOnProject = (projId: string) => {
    return myBids.some((b) => b.project_id === projId);
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.major.toLowerCase().includes(search.toLowerCase());

    const matchesMajor = !majorFilter || p.major.toLowerCase().includes(majorFilter.toLowerCase());
    const matchesBudget = !maxBudget || p.budget_min <= maxBudget;

    return matchesSearch && matchesMajor && matchesBudget;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Antrean Pesanan Masuk (Mahasiswa)
          </h1>
          <Badge variant="forest">Khusus Tim Inti</Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Daftar pesanan tugas dan skripsi baru yang dikirim mahasiswa. Anda dan rekan tim dapat langsung menerima pesanan dan menetapkan jadwal pengerjaan.
        </p>
      </div>

      {/* Info Notice about Direct Team Flow */}
      <div className="rounded-2xl bg-forest-50/90 p-4 border border-forest-200 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-forest-900 leading-relaxed">
          <strong className="text-forest-950 block mb-0.5">Alur Kerja Tim Inti Jokiskripsiku:</strong>
          Seluruh pesanan pada daftar ini dikirimkan langsung oleh mahasiswa ke tim Anda (bukan lelang umum). Klik <strong>&quot;Terima &amp; Jadwalkan&quot;</strong> untuk mengonfirmasi biaya dan estimasi waktu. Setelah mahasiswa mentransfer deposit ke Rekber BCA resmi, Anda dapat langsung mulai mengerjakan.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Cari topik atau judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        <Input
          placeholder="Filter berdasarkan jurusan..."
          value={majorFilter}
          onChange={(e) => setMajorFilter(e.target.value)}
        />

        <Select
          value={maxBudget ? String(maxBudget) : 'ALL'}
          onChange={(e) => setMaxBudget(e.target.value === 'ALL' ? undefined : Number(e.target.value))}
          options={[
            { value: 'ALL', label: 'Semua Rentang Budget' },
            { value: '2000000', label: 'Maks. Rp 2.000.000' },
            { value: '3500000', label: 'Maks. Rp 3.500.000' },
            { value: '5000000', label: 'Maks. Rp 5.000.000' },
          ]}
        />
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan Tersedia"
          description="Saat ini belum ada pesanan baru yang cocok dengan filter yang Anda tentukan."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((proj) => {
            const alreadyBid = hasBidOnProject(proj.id);

            return (
              <Card key={proj.id} className="p-6 hover:border-forest-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="gray">{proj.major}</Badge>
                      <span className="text-xs text-gray-500 font-medium">{proj.faculty}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <Badge variant="forest">{proj.service_type}</Badge>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 max-w-3xl">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                      <span className="font-bold text-forest-900 text-sm">
                        Anggaran Klien: {formatRupiah(proj.budget_min)} - {formatRupiah(proj.budget_max)}
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" /> Deadline: {formatDate(proj.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {alreadyBid ? (
                      <Badge variant="gold" className="py-1.5 px-3">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Sudah Dikonfirmasi Tim
                      </Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenBid(proj)}
                        className="font-bold shadow-sm"
                      >
                        <Send className="h-4 w-4 mr-1.5" /> Terima &amp; Jadwalkan
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={isBidOpen}
        onClose={() => setIsBidOpen(false)}
        title="Konfirmasi Pengerjaan Pesanan"
        description="Tetapkan nominal biaya dan durasi pengerjaan yang akan diteruskan ke mahasiswa."
      >
        {selectedProject && (
          <form onSubmit={handleSubmitBid} className="space-y-4 pt-2 text-left">
            <div className="rounded-xl bg-forest-50 p-3.5 border border-forest-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400">Pesanan Mahasiswa:</span>
              <p className="font-serif font-bold text-gray-900 line-clamp-1">{selectedProject.title}</p>
              <p className="text-gray-500 mt-0.5">
                Estimasi Anggaran Klien: {formatRupiah(selectedProject.budget_min)} - {formatRupiah(selectedProject.budget_max)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nominal Biaya Pengerjaan (Rp)"
                type="number"
                step={50000}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                helperText={formatRupiah(bidAmount)}
                required
              />

              <Input
                label="Estimasi Penyelesaian (Hari)"
                type="number"
                min={1}
                max={180}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(Number(e.target.value))}
                helperText="Durasi hingga draf siap diserahkan."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Catatan Rencana Kerja ke Mahasiswa
              </label>
              <textarea
                rows={3}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Tuliskan jadwal pengerjaan dan jaminan bebas Turnitin..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                required
              />
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>
                Mahasiswa akan diminta menyetorkan dana ke Rekber resmi BCA (8801928371) sebelum pengerjaan dimulai.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsBidOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingBid} className="font-bold">
                Kirim Konfirmasi Pengerjaan
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
