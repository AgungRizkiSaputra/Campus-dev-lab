'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { addAppNotification } from '@/lib/notifications';
import {
  Search,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileCheck2,
  MessageSquare,
  Upload,
  ArrowRight,
} from 'lucide-react';

export default function SellerExplorePage() {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [myBids, setMyBids] = useState<Bidding[]>([]);
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'IN_PROGRESS' | 'OPEN'>('ALL');
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Dialog State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(2000000);
  const [proposal, setProposal] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const loadData = async () => {
    let localList: Project[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('joki_user_projects');
        if (rawLocal) {
          localList = JSON.parse(rawLocal);
          setProjects(localList);
        }
      } catch {
        // ignore
      }
    }

    try {
      const [projRes, bidsRes] = await Promise.all([
        getProjectsAction({ role: 'seller' }),
        getMyBidsAction(),
      ]);

      let combined: Project[] = [];
      if (projRes.success && projRes.projects) {
        combined = [...projRes.projects];
      }

      const serverIds = new Set(combined.map((p) => p.id));
      for (const lp of localList) {
        if (!serverIds.has(lp.id)) {
          combined.unshift(lp);
        }
      }

      setProjects(combined);
      if (bidsRes.success && bidsRes.bids) {
        setMyBids(bidsRes.bids as Bidding[]);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBid = (proj: Project) => {
    setSelectedProject(proj);
    const midPrice =
      proj.budget_max && proj.budget_max > proj.budget_min
        ? Math.round((proj.budget_min + proj.budget_max) / 2)
        : proj.budget_min;
    setBidAmount(midPrice);
    setProposal('Tim Jokiskripsiku siap mengerjakan tugas ini dengan standar riset akademik terbaik, metodologi valid, dan garansi lolos Turnitin < 20%.');
    setEstimatedDays(14);
    setIsBidOpen(true);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!proposal.trim() || proposal.length < 10) {
      toast({
        type: 'error',
        title: 'Catatan Rencana Kerja Terlalu Singkat',
        message: 'Mohon tuliskan rencana kerja minimal 10 karakter.',
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
        toast({ type: 'error', title: 'Gagal Mengirim Penawaran', message: res.error });
        return;
      }

      // Simpan sinkron ke localStorage agar mahasiswa langsung melihat penawaran ini di detail proyeknya
      if (typeof window !== 'undefined') {
        try {
          const bidObj: Bidding = (res as any).bid || {
            id: `bid-${Date.now()}`,
            project_id: selectedProject.id,
            joki_id: 'seller-tim',
            bid_amount: bidAmount,
            proposal,
            estimated_days: estimatedDays,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const rawBids = localStorage.getItem(`joki_project_bids_${selectedProject.id}`);
          let bidList: Bidding[] = rawBids ? JSON.parse(rawBids) : [];
          bidList = [bidObj, ...bidList.filter((b) => b.id !== bidObj.id)];
          localStorage.setItem(`joki_project_bids_${selectedProject.id}`, JSON.stringify(bidList));

          // Simpan juga ke daftar semua bids
          const rawAllBids = localStorage.getItem('joki_all_bids');
          let allBids: Bidding[] = rawAllBids ? JSON.parse(rawAllBids) : [];
          allBids = [bidObj, ...allBids.filter((b) => b.id !== bidObj.id)];
          localStorage.setItem('joki_all_bids', JSON.stringify(allBids));

          // Update status proyek di joki_user_projects menjadi BIDDING dan tetapkan proposed_deal_price
          const rawProjects = localStorage.getItem('joki_user_projects');
          if (rawProjects) {
            const list: Project[] = JSON.parse(rawProjects);
            const pIdx = list.findIndex((p) => p.id === selectedProject.id);
            if (pIdx !== -1) {
              list[pIdx].status = 'BIDDING';
              (list[pIdx] as any).proposed_deal_price = bidAmount;
              (list[pIdx] as any).deal_price = bidAmount;
              (list[pIdx] as any).assigned_joki_id = bidObj.joki_id;
              localStorage.setItem('joki_user_projects', JSON.stringify(list));
            }
          }
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
      }

      // Kirim notifikasi resmi ke mahasiswa
      addAppNotification({
        title: `📩 Penawaran Harga Masuk: ${selectedProject.title}`,
        message: `Tim Penjoki telah menetapkan penawaran harga pengerjaan sebesar ${formatRupiah(bidAmount)}. Silakan periksa rincian penawaran dan setujui untuk lanjut pembayaran Rekber.`,
        type: 'project',
      });

      toast({
        type: 'success',
        title: 'Penawaran Pengerjaan Berhasil Terkirim ke Mahasiswa!',
        message: `Harga kesepakatan ${formatRupiah(bidAmount)} telah diteruskan ke halaman detail pesanan mahasiswa. Mahasiswa dapat memeriksa, berdiskusi via WA, atau menyetujui untuk lanjut bayar Rekber.`,
      });

      setIsBidOpen(false);
      loadData();
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Gagal memproses penawaran pengerjaan.',
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const hasBidOnProject = (projId: string) => {
    return myBids.some((b) => b.project_id === projId);
  };

  const countInProgress = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'REVIEW').length;
  const countOpen = projects.filter((p) => p.status === 'OPEN' || p.status === 'BIDDING').length;

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.major.toLowerCase().includes(search.toLowerCase());

    const matchesMajor = !majorFilter || p.major.toLowerCase().includes(majorFilter.toLowerCase());
    const matchesBudget = !maxBudget || p.budget_min <= maxBudget;

    const matchesStatus =
      statusTab === 'ALL'
        ? true
        : statusTab === 'IN_PROGRESS'
        ? p.status === 'IN_PROGRESS' || p.status === 'REVIEW'
        : p.status === 'OPEN' || p.status === 'BIDDING';

    return matchesSearch && matchesMajor && matchesBudget && matchesStatus;
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
          Daftar seluruh pesanan tugas dan skripsi mahasiswa, baik pesanan baru maupun tugas yang sedang aktif dikerjakan.
        </p>
      </div>

      {/* Info Notice about Direct Team Flow */}
      <div className="rounded-2xl bg-forest-50/90 p-4 border border-forest-200 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-forest-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-forest-900 leading-relaxed">
          <strong className="text-forest-950 block mb-0.5">Alur Kerja Tim Inti Jokiskripsiku:</strong>
          Seluruh pesanan pada daftar ini dikirimkan langsung oleh mahasiswa ke tim Anda. Saat pembayaran Rekber disahkan Admin, tugas otomatis berstatus <strong>Sedang Dikerjakan</strong>. Klik <strong>&quot;Kerjakan &amp; Unggah Bab&quot;</strong> untuk membuka milestone pengerjaan dan mengunggah laporan Turnitin resmi.
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <Button
          variant={statusTab === 'ALL' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusTab('ALL')}
          className="text-xs font-semibold"
        >
          Semua Pesanan ({projects.length})
        </Button>
        <Button
          variant={statusTab === 'IN_PROGRESS' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusTab('IN_PROGRESS')}
          className="text-xs font-semibold"
        >
          <Clock className="h-3.5 w-3.5 mr-1" /> Sedang Dikerjakan ({countInProgress})
        </Button>
        <Button
          variant={statusTab === 'OPEN' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusTab('OPEN')}
          className="text-xs font-semibold"
        >
          <Search className="h-3.5 w-3.5 mr-1" /> Pesanan Baru Masuk ({countOpen})
        </Button>
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
          title={statusTab === 'OPEN' ? 'Semua Pesanan Telah Berhasil Diambil' : 'Tidak Ada Pesanan Tersedia'}
          description={
            statusTab === 'OPEN'
              ? 'Seluruh pesanan mahasiswa saat ini telah diambil dan sedang aktif dikerjakan. Silakan pilih tab "Sedang Dikerjakan" di atas.'
              : 'Saat ini belum ada pesanan yang sesuai dengan filter pencarian Anda.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((proj) => {
            const alreadyBid = hasBidOnProject(proj.id);
            const isInProgress = proj.status === 'IN_PROGRESS' || proj.status === 'REVIEW';

            return (
              <Card key={proj.id} className="p-6 hover:border-forest-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={isInProgress ? 'forest' : 'gold'}>
                        {isInProgress ? 'Sedang Dikerjakan (Dana HELD di Rekber)' : 'Menunggu Tim Inti'}
                      </Badge>
                      <Badge variant="gray">{proj.major}</Badge>
                      <span className="text-xs text-gray-500 font-medium">{proj.faculty}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <span className="text-xs font-semibold text-forest-900">{proj.service_type}</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 max-w-3xl leading-relaxed">
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

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                    {isInProgress ? (
                      <div className="text-right space-y-1">
                        <Badge variant="forest" className="py-1.5 px-3 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Sedang Dikerjakan Tim
                        </Badge>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Tugas aktif di ruang kerja pengerjaan tim
                        </p>
                      </div>
                    ) : alreadyBid ? (
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
        title="Konfirmasi Pengerjaan & Tentukan Penawaran Harga"
        description="Tetapkan nominal harga kesepakatan dan estimasi durasi pengerjaan yang akan diajukan ke mahasiswa."
      >
        {selectedProject && (
          <form onSubmit={handleSubmitBid} className="space-y-4 pt-2 text-left">
            <div className="rounded-xl bg-forest-50 p-3.5 border border-forest-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-500">Tugas Akademik Mahasiswa:</span>
              <p className="font-serif font-bold text-gray-900 text-sm mt-0.5">{selectedProject.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-forest-200/60 text-[11px]">
                <span className="text-gray-600">Rentang Budget Mahasiswa:</span>
                <span className="font-bold text-forest-900 font-mono bg-white px-2 py-0.5 rounded border border-forest-200">
                  {formatRupiah(selectedProject.budget_min)} &ndash; {formatRupiah(selectedProject.budget_max || selectedProject.budget_min)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nominal Penawaran Harga Final (Rp)"
                type="number"
                step={25000}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                helperText={`Harga ini akan diajukan ke mahasiswa: ${formatRupiah(bidAmount)}`}
                required
              />

              <Input
                label="Estimasi Penyelesaian (Hari)"
                type="number"
                min={1}
                max={180}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(Number(e.target.value))}
                helperText="Durasi hingga naskah tugas siap diserahkan."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Catatan Rencana Kerja &amp; Garansi ke Mahasiswa
              </label>
              <textarea
                rows={3}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                placeholder="Rencana tahapan bab, metode pengerjaan, dan garansi Turnitin..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsBidOpen(false)} disabled={isSubmittingBid}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingBid}>
                Kirim Penawaran ke Mahasiswa
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
