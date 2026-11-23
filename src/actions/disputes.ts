'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DisputeTicket {
  id: string;
  project_id: string;
  milestone_id: string;
  initiator_id: string;
  initiator_name: string;
  against_id: string;
  against_name: string;
  reason: string;
  description: string;
  evidence_url?: string | null;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_RELEASE' | 'RESOLVED_REFUND' | 'CANCELLED';
  admin_notes?: string | null;
  resolved_by?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

let mockDisputes: DisputeTicket[] = [
  {
    id: 'dsp-882',
    project_id: 'demo-1',
    milestone_id: 'mile-2',
    initiator_id: 'user-buyer-1',
    initiator_name: 'Dimas Pratama (Mahasiswa)',
    against_id: 'user-seller-1',
    against_name: 'Dr. Hendra Wijaya (Joki)',
    reason: 'PLAGIARISM_DETECTED',
    description: 'Skor Turnitin pada draf Bab 3 terdeteksi 35%, melebihi batas toleransi fakultas yang maksimal 20%. Joki menolak melakukan parafrase ulang.',
    evidence_url: 'https://storage.jokiskripsi.com/evidence/turnitin_screenshot_35.png',
    status: 'OPEN',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getDisputesAction() {
  return { success: true, disputes: mockDisputes };
}

export async function getDisputeByIdAction(id: string) {
  const found = mockDisputes.find((d) => d.id === id);
  if (!found) return { success: false, error: 'Tiket sengketa tidak ditemukan.' };
  return { success: true, dispute: found };
}

export async function openDisputeAction(
  projectId: string,
  milestoneId: string,
  reason: string,
  description: string,
  evidenceUrl?: string
): Promise<{ success: true; dispute: DisputeTicket } | { success: false; error: string }> {
  try {
    const newDispute: DisputeTicket = {
      id: `dsp-${Date.now().toString().slice(-4)}`,
      project_id: projectId,
      milestone_id: milestoneId,
      initiator_id: 'user-buyer-1',
      initiator_name: 'Dimas Pratama',
      against_id: 'user-seller-1',
      against_name: 'Dr. Hendra Wijaya',
      reason,
      description,
      evidence_url: evidenceUrl,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    mockDisputes.unshift(newDispute);
    revalidatePath('/admin/arbitration');
    revalidatePath(`/buyer/projects/${projectId}/milestones`);
    return { success: true, dispute: newDispute };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membuka tiket sengketa.';
    return { success: false, error: message };
  }
}

export async function resolveDisputeAdminAction(
  disputeId: string,
  resolution: 'FORCE_RELEASE' | 'FORCE_REFUND',
  adminNotes: string
) {
  const idx = mockDisputes.findIndex((d) => d.id === disputeId);
  if (idx === -1) return { success: false, error: 'Tiket sengketa tidak ditemukan.' };

  const dispute = mockDisputes[idx];
  dispute.status = resolution === 'FORCE_RELEASE' ? 'RESOLVED_RELEASE' : 'RESOLVED_REFUND';
  dispute.admin_notes = adminNotes;
  dispute.resolved_by = 'admin-super-1';
  dispute.resolved_at = new Date().toISOString();

  revalidatePath('/admin/arbitration');
  return { success: true };
}
