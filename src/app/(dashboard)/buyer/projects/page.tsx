'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getProjectsAction } from '@/actions/projects';
import type { Project } from '@/types/database.types';
import {
  FolderKanban,
  FilePlus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function BuyerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getProjectsAction({ role: 'buyer' });
      if (res.success && res.projects) {
        setProjects(res.projects);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.major.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="forest">Pesanan Diterima</Badge>;
      case 'BIDDING':
        return <Badge variant="gold">Menunggu Konfirmasi Tim</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="forest">Sedang Dikerjakan</Badge>;
      case 'REVIEW':
        return <Badge variant="burgundy">Dalam Peninjauan</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Selesai (ACC)</Badge>;
      case 'DISPUTED':
        return <Badge variant="danger">Sengketa (Dispute)</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Daftar Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola seluruh pesanan Anda, pantau proses pengerjaan oleh tim inti, dan unduh hasil Turnitin.
          </p>
        </div>

        <Link href="/buyer/create-project">
          <Button variant="primary" size="md">
            <FilePlus className="h-4 w-4 mr-1.5" /> Pesan Layanan Baru
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Cari berdasarkan judul, topik, atau jurusan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Semua Status Pesanan' },
              { value: 'OPEN', label: 'Pesanan Diterima' },
              { value: 'BIDDING', label: 'Menunggu Konfirmasi Tim' },
              { value: 'IN_PROGRESS', label: 'Sedang Dikerjakan' },
              { value: 'COMPLETED', label: 'Selesai (ACC)' },
              { value: 'DISPUTED', label: 'Sengketa' },
            ]}
          />
        </div>
      </div>

      {/* Projects List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan Ditemukan"
          description="Anda belum memiliki pesanan yang sesuai dengan kriteria pencarian."
          actionLabel="Pesan Layanan Sekarang"
          onAction={() => (window.location.href = '/buyer/create-project')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((proj) => (
            <Card key={proj.id} className="p-6 hover:border-forest-600 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(proj.status)}
                    <span className="text-xs font-semibold text-gray-600">{proj.major}</span>
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs text-gray-500">{proj.faculty}</span>
                  </div>

                  <Link href={`/buyer/projects/${proj.id}`}>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 hover:text-forest-800 transition-colors">
                      {proj.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2 max-w-3xl">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                    <span className="font-bold text-forest-900 text-sm">
                      Estimasi: {formatRupiah(proj.budget_min)} - {formatRupiah(proj.budget_max)}
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" /> Deadline: {formatDate(proj.deadline)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <Link href={`/buyer/projects/${proj.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Lihat Rincian Pesanan <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
