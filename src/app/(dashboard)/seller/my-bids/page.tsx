'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getMyBidsAction } from '@/actions/biddings';
import type { Bidding } from '@/types/database.types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bidding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getMyBidsAction();
      if (res.success && res.bids) {
        setBids(res.bids as Bidding[]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success">Disetujui Klien (Sedang Dikerjakan)</Badge>;
      case 'PENDING':
        return <Badge variant="gold">Menunggu Konfirmasi Deposit Rekber</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Dibatalkan</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Tugas Aktif Tim Jokiskripsiku
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Lacak seluruh pesanan mahasiswa yang sedang aktif dikerjakan oleh Anda dan rekan tim.
          </p>
        </div>

        <Link href="/seller/explore">
          <Button variant="primary" size="md" className="font-bold">
            Buka Antrean Pesanan &rarr;
          </Button>
        </Link>
      </div>

      {bids.length === 0 ? (
        <EmptyState
          title="Belum Ada Tugas yang Sedang Dikerjakan"
          description="Anda belum menerima pesanan dari antrean mahasiswa."
          actionLabel="Buka Antrean Pesanan"
          onAction={() => (window.location.href = '/seller/explore')}
        />
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card
              key={bid.id}
              className={`p-6 transition-all ${
                bid.status === 'ACCEPTED'
                  ? 'border-forest-600 bg-forest-50/20 ring-1 ring-forest-600'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(bid.status)}
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs text-gray-500">Dikonfirmasi: {formatDate(bid.created_at)}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Pesanan #{bid.project_id}
                  </h3>

                  <div className="rounded-xl bg-surface-muted p-3 text-xs text-gray-700 leading-relaxed border border-gray-100 max-w-3xl">
                    <strong className="block text-gray-900 mb-1">Catatan Pengerjaan Tim:</strong>
                    {bid.proposal}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                    <span>Estimasi Durasi: <strong className="text-gray-900">{bid.estimated_days} Hari</strong></span>
                    <span>&bull;</span>
                    <span className="font-bold text-forest-900 text-sm">
                      Biaya: {formatRupiah(bid.bid_amount)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/shared/chat/${bid.project_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1 text-emerald-600" /> Chat Klien
                      </Button>
                    </Link>
                    <Link href={`/shared/documents/${bid.project_id}`}>
                      <Button variant="primary" size="sm" className="font-bold">
                        <FileCheck2 className="h-4 w-4 mr-1" /> Dokumen &amp; Turnitin
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
