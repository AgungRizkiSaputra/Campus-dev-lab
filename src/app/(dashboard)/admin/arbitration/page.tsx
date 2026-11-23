'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { getDisputesAction, type DisputeTicket } from '@/actions/disputes';
import {
  Gavel,
  ShieldAlert,
  ArrowRight,
  Clock,
  UserCheck,
} from 'lucide-react';

export default function AdminArbitrationListPage() {
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getDisputesAction();
      if (res.success && res.disputes) {
        setDisputes(res.disputes);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Pusat Mediasi & Arbitrase Sengketa
          </h1>
          <Badge variant="danger">Admin Arbitration</Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Daftar sengketa aktif antara mahasiswa dan konsultan joki yang memerlukan peninjauan bukti dan putusan force action.
        </p>
      </div>

      {disputes.length === 0 ? (
        <EmptyState
          title="Tidak Ada Sengketa Aktif"
          description="Seluruh proyek dan milestone transaksi berjalan lancar tanpa sengketa."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((dsp) => (
            <Card key={dsp.id} className="p-6 border-red-100 hover:border-red-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={dsp.status === 'OPEN' ? 'danger' : 'forest'}>
                      {dsp.status}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-gray-500">Tiket #{dsp.id}</span>
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs text-gray-500">{formatDate(dsp.created_at)}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-gray-900">
                    Alasan: {dsp.reason}
                  </h3>

                  <p className="text-xs text-gray-700 leading-relaxed max-w-3xl">
                    {dsp.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Pelapor: <strong className="text-gray-900">{dsp.initiator_name}</strong></span>
                    <span>&bull;</span>
                    <span>Pihak Terlapor: <strong className="text-gray-900">{dsp.against_name}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <Link href={`/admin/arbitration/${dsp.id}`}>
                    <Button variant="primary" size="sm">
                      <Gavel className="h-4 w-4 mr-1.5" /> Buka Ruang Arbitrase
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
