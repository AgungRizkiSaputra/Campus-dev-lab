'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Payment, EscrowTransaction } from '@/types/database.types';

// In-memory reliable mock ledger for testing and verification
let mockPayments: Payment[] = [
  {
    id: 'pay-1',
    project_id: 'demo-1',
    milestone_id: 'mile-1',
    payer_id: 'user-buyer-1',
    subtotal: 1000000,
    unique_code: 247,
    total_amount: 1000247,
    bank_name: 'BCA (Bank Central Asia)',
    transfer_ref: 'TRX-BCA-98127391',
    payment_proof_url: 'https://storage.jokiskripsi.com/proofs/trx-98127391.jpg',
    verification_status: 'VERIFIED',
    verified_by: 'admin-super-1',
    verified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    project_id: 'demo-1',
    milestone_id: 'mile-2',
    payer_id: 'user-buyer-1',
    subtotal: 1500000,
    unique_code: 482,
    total_amount: 1500482,
    bank_name: 'Mandiri',
    transfer_ref: 'MDR-20261123-8821',
    payment_proof_url: 'https://storage.jokiskripsi.com/proofs/mdr-8821.jpg',
    verification_status: 'PENDING_VERIFICATION',
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockEscrow: EscrowTransaction[] = [
  {
    id: 'escrow-1',
    project_id: 'demo-1',
    milestone_id: 'mile-1',
    payment_id: 'pay-1',
    amount: 1000000,
    status: 'HELD',
    held_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function initiateDepositPaymentAction(projectId: string, milestoneId: string, subtotal: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const payerId = user?.id || 'user-buyer-1';

  // 1. Generate 3-digit random unique code (100 - 999)
  const uniqueCode = Math.floor(100 + Math.random() * 900);
  const totalAmount = subtotal + uniqueCode;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    project_id: projectId,
    milestone_id: milestoneId,
    payer_id: payerId,
    subtotal,
    unique_code: uniqueCode,
    total_amount: totalAmount,
    bank_name: 'BCA (Bank Central Asia)',
    verification_status: 'UNPAID',
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockPayments.unshift(newPayment);
  revalidatePath(`/buyer/projects/${projectId}/payment`);
  return { success: true, payment: newPayment };
}

export async function uploadPaymentProofAction(
  paymentId: string,
  bankName: string,
  transferRef: string,
  proofUrl: string
) {
  // Prevent duplicate transfer reference
  const duplicate = mockPayments.find(
    (p) => p.transfer_ref === transferRef && p.id !== paymentId
  );
  if (duplicate) {
    return {
      success: false,
      error: 'Nomor referensi mutasi ini sudah pernah digunakan sebelumnya (Anti-Replay Protection).',
    };
  }

  const idx = mockPayments.findIndex((p) => p.id === paymentId);
  if (idx !== -1) {
    mockPayments[idx].bank_name = bankName;
    mockPayments[idx].transfer_ref = transferRef;
    mockPayments[idx].payment_proof_url = proofUrl;
    mockPayments[idx].verification_status = 'PENDING_VERIFICATION';
    mockPayments[idx].updated_at = new Date().toISOString();
  }

  revalidatePath('/admin/payments');
  return { success: true };
}

export async function getPendingPaymentsAction() {
  const pending = mockPayments.filter((p) => p.verification_status === 'PENDING_VERIFICATION');
  return { success: true, payments: pending };
}

export async function verifyPaymentAdminAction(
  paymentId: string,
  isApproved: boolean,
  notes?: string
) {
  const idx = mockPayments.findIndex((p) => p.id === paymentId);
  if (idx === -1) {
    return { success: false, error: 'Tagihan tidak ditemukan.' };
  }

  const payment = mockPayments[idx];

  if (isApproved) {
    payment.verification_status = 'VERIFIED';
    payment.verified_by = 'admin-super-1';
    payment.verified_at = new Date().toISOString();

    // Create or update Escrow Transaction to HELD
    const escrowIdx = mockEscrow.findIndex((e) => e.milestone_id === payment.milestone_id);
    if (escrowIdx !== -1) {
      mockEscrow[escrowIdx].status = 'HELD';
      mockEscrow[escrowIdx].held_at = new Date().toISOString();
    } else {
      mockEscrow.push({
        id: `escrow-${Date.now()}`,
        project_id: payment.project_id,
        milestone_id: payment.milestone_id,
        payment_id: payment.id,
        amount: payment.subtotal,
        status: 'HELD',
        held_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } else {
    payment.verification_status = 'REJECTED';
    payment.rejection_reason = notes || 'Bukti transfer tidak sesuai dengan mutasi rekening nyata.';
  }

  revalidatePath('/admin/payments');
  revalidatePath(`/buyer/projects/${payment.project_id}/payment`);
  return { success: true };
}

export async function getProjectEscrowStatusAction(projectId: string) {
  const txs = mockEscrow.filter((e) => e.project_id === projectId);
  return { success: true, escrow: txs };
}
