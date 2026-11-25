'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getAllUsers, type AuthUser } from '@/lib/auth';
import { getProjectsAction } from '@/actions/projects';
import { getPendingPaymentsAction, getPaymentsStatsAction } from '@/actions/payments';
import { getDisputesAction, type DisputeTicket } from '@/actions/disputes';
import type { Project, Payment } from '@/types/database.types';
import {
  CreditCard,
  ShieldCheck,
  Gavel,
  History,
  TrendingUp,
  AlertTriangle,
  Users,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [totalEscrow, setTotalEscrow] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Instant local display on frame 1
    const allUsers = getAllUsers();
    setUsers(allUsers);

    let localProjects: Project[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('joki_user_projects');
        if (rawLocal) {
          localProjects = JSON.parse(rawLocal);
          setProjects(localProjects);
        }
      } catch {
        // ignore
      }
    }

    // 2. Background server fetch
    async function loadData() {
      try {
        const [projRes, payRes, statsRes, dispRes] = await Promise.all([
          getProjectsAction({}),
          getPendingPaymentsAction(),
          getPaymentsStatsAction(),
          getDisputesAction(),
        ]);

        let combined: Project[] = [];
        if (projRes.success && projRes.projects) {
          combined = [...projRes.projects];
        }

        const serverIds = new Set(combined.map((p) => p.id));
        for (const lp of localProjects) {
          if (!serverIds.has(lp.id)) {
            combined.unshift(lp);
          }
        }

        setProjects(combined);
        let currentPending: Payment[] = [];
        if (payRes.success && payRes.payments) {
          currentPending = [...payRes.payments];
        }
        for (const lp of localProjects) {
          if ((lp as any).payment_status === 'PENDING_VERIFICATION') {
            const exists = currentPending.some((x) => x.project_id === lp.id);
            if (!exists) {
              currentPending.unshift({
                id: `pay-${lp.id}`,
                project_id: lp.id,
                milestone_id: `mile-${lp.id}-1`,
                payer_id: (lp as any).user_id || (lp as any).buyer_id || 'user-buyer',
                subtotal: (lp as any).paid_amount || lp.budget_min || 150000,
                unique_code: ((lp as any).paid_amount || 150341) % 1000,
                total_amount: (lp as any).paid_amount || 150341,
                bank_name: (lp as any).bank_name || 'BCA / SeaBank / ShopeePay',
                transfer_ref: (lp as any).transfer_ref || 'TRX-BUKTI-MANUAL',
                payment_proof_url: (lp as any).proof_url || '',
                verification_status: 'PENDING_VERIFICATION',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                created_at: (lp as any).paid_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
        setPendingPayments(currentPending);
        if (statsRes.success) {
          setTotalEscrow(statsRes.totalHeldEscrow);
        }
        if (dispRes.success && dispRes.disputes) {
          setDisputes(dispRes.disputes);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      label: 'Total Pengguna Terdaftar',
      value: `${users.length} Akun`,
      icon: Users,
      color: 'text-forest-800',
      link: '/admin/users',
    },
    {
      label: 'Proyek Skripsi Aktif',
      value: `${projects.length} Proyek`,
      icon: FolderKanban,
      color: 'text-forest-800',
    },
    {
      label: 'Antrean Verifikasi Mutasi',
      value: `${pendingPayments.length} Tagihan`,
      icon: CreditCard,
      color: 'text-amber-600',
      link: '/admin/payments',
    },
    {
      label: 'Sengketa Aktif (Dispute)',
      value: `${disputes.length} Kasus`,
      icon: Gavel,
      color: 'text-red-600',
      link: '/admin/arbitration',
    },
    {
      label: 'Total Saldo di Escrow Rekber',
      value: formatRupiah(totalEscrow),
      icon: TrendingUp,
      color: 'text-forest-800',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Pusat Kendali Super Admin
          </h1>
          <Badge variant="burgundy">Super Admin Resmi</Badge>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Monitoring operasional platform, verifikasi mutasi rekening bank nyata, pendaftaran akun penjoki, dan penyelesaian sengketa.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 hover:border-forest-600 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              {stat.link && (
                <Link
                  href={stat.link}
                  className="text-xs font-semibold text-forest-800 hover:underline inline-flex items-center gap-1 mt-2"
                >
                  Buka Antrean &rarr;
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Verification Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-forest-800" />
              <h3 className="font-serif font-bold text-base text-gray-900">
                Verifikasi Deposit Bank Mahasiswa
              </h3>
            </div>
            <Link href="/admin/payments" className="text-xs font-semibold text-forest-800 hover:underline">
              Kelola Semua &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Memuat antrean mutasi...</div>
          ) : pendingPayments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-gray-700">Semua Mutasi Terverifikasi</p>
              <p className="text-[11px] text-gray-400">Tidak ada antrean pembayaran deposit baru dari mahasiswa.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md bg-forest-50/40 p-3 border border-forest-100/60 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {p.payer_name ? `${p.payer_name} • ` : ''}Tagihan #{p.id.slice(0, 10)}
                    </p>
                    <p className="text-gray-500">
                      Bank: {p.bank_name} &bull; Ref: <strong className="text-forest-900">{p.transfer_ref || '-'}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest-900">{formatRupiah(p.total_amount)}</p>
                    <Link href="/admin/payments">
                      <Button variant="primary" size="sm" className="mt-1">
                        Cocokkan Mutasi
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dispute Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-burgundy-700" />
              <h3 className="font-serif font-bold text-base text-gray-900">
                Antrean Mediasi Sengketa (Dispute)
              </h3>
            </div>
            <Link href="/admin/arbitration" className="text-xs font-semibold text-burgundy-700 hover:underline">
              Buka Arbitrase &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Memuat status sengketa...</div>
          ) : disputes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 space-y-1">
              <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-gray-700">Tidak Ada Sengketa Aktif</p>
              <p className="text-[11px] text-gray-400">Semua proyek berjalan lancar tanpa kendala eskalasi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="rounded-md bg-red-50/50 p-4 border border-red-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="danger">{d.status}</Badge>
                    <span className="text-[11px] text-gray-500">Tiket #{d.id}</span>
                  </div>
                  <p className="font-bold text-gray-900">{d.reason}</p>
                  <p className="text-gray-600">Pelapor: {d.initiator_name}</p>
                  <div className="pt-2">
                    <Link href={`/admin/arbitration/${d.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Tinjau Bukti &amp; Eksekusi Putusan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
