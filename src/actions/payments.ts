'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Payment, EscrowTransaction } from '@/types/database.types';
import { markProjectInProgress } from './projects';

// Clean in-memory reliable ledger starting empty for real user testing
let mockPayments: Payment[] = [];
let mockEscrow: EscrowTransaction[] = [];

export async function getOrCreateProjectPaymentAction(projectId: string, customSubtotal?: number) {
  let payment = mockPayments.find((p) => p.project_id === projectId);
  if (payment) {
    // If unpaid, allow updating subtotal when user toggles payment mode (Full vs Milestone)
    if (customSubtotal && payment.verification_status === 'UNPAID' && payment.subtotal !== customSubtotal) {
      payment.subtotal = customSubtotal;
      payment.total_amount = customSubtotal + payment.unique_code;
      payment.updated_at = new Date().toISOString();
    }
  } else {
    const subtotal = customSubtotal || 1500000;
    const uniqueCode = Math.floor(100 + Math.random() * 900);
    const totalAmount = subtotal + uniqueCode;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    payment = {
      id: `pay-${projectId}`,
      project_id: projectId,
      milestone_id: `mile-${projectId}-1`,
      payer_id: 'user-buyer',
      subtotal,
      unique_code: uniqueCode,
      total_amount: totalAmount,
      bank_name: 'BCA / SeaBank / ShopeePay',
      verification_status: 'UNPAID',
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPayments.unshift(payment);
  }
  return { success: true, payment };
}

export async function getPaymentsStatsAction() {
  const pendingCount = mockPayments.filter((p) => p.verification_status === 'PENDING_VERIFICATION').length;
  const totalHeldEscrow = mockEscrow
    .filter((e) => e.status === 'HELD')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return {
    success: true,
    pendingCount,
    totalHeldEscrow,
    payments: mockPayments,
  };
}

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
  proofUrl: string,
  payerName?: string,
  projectTitle?: string
) {
  try {
    const cleanRef = (transferRef || '').trim();
    const effectivePaymentId = paymentId && paymentId.trim() ? paymentId.trim() : `pay-${Date.now()}`;

    // Anti-replay check only if reference is a strict unique transaction hash/code (e.g. TRX-...)
    const isStrictTrxCode = /^TRX[-0-9A-Z]{8,}$/i.test(cleanRef);
    if (isStrictTrxCode) {
      const duplicate = mockPayments.find(
        (p) => p.transfer_ref === cleanRef && p.id !== effectivePaymentId
      );
      if (duplicate) {
        return {
          success: false,
          error: 'Nomor referensi mutasi ini sudah pernah digunakan sebelumnya.',
        };
      }
    }

    let idx = mockPayments.findIndex((p) => p.id === effectivePaymentId);
    if (idx === -1) {
      const projId = effectivePaymentId.startsWith('pay-')
        ? effectivePaymentId.replace('pay-', '')
        : effectivePaymentId;
      idx = mockPayments.findIndex((p) => p.project_id === projId || p.id === `pay-${projId}`);
    }

    if (idx !== -1) {
      mockPayments[idx].bank_name = bankName;
      mockPayments[idx].transfer_ref = cleanRef;
      mockPayments[idx].payment_proof_url = proofUrl;
      mockPayments[idx].verification_status = 'PENDING_VERIFICATION';
      if (payerName) mockPayments[idx].payer_name = payerName;
      if (projectTitle) mockPayments[idx].project_title = projectTitle;
      mockPayments[idx].updated_at = new Date().toISOString();
    } else {
      const projId = effectivePaymentId.startsWith('pay-')
        ? effectivePaymentId.replace('pay-', '')
        : effectivePaymentId;
      const newPay: Payment = {
        id: effectivePaymentId,
        project_id: projId,
        milestone_id: `mile-${projId}-1`,
        payer_id: 'user-buyer',
        payer_name: payerName,
        project_title: projectTitle,
        subtotal: 150000,
        unique_code: 341,
        total_amount: 150341,
        bank_name: bankName,
        transfer_ref: cleanRef,
        payment_proof_url: proofUrl,
        verification_status: 'PENDING_VERIFICATION',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPayments.unshift(newPay);
    }

    revalidatePath('/admin/payments');
    return { success: true };
  } catch (error: any) {
    console.error('Error in uploadPaymentProofAction:', error);
    return { success: false, error: error?.message || 'Gagal memproses unggah bukti transfer.' };
  }
}

export async function getPendingPaymentsAction() {
  const pending = mockPayments.filter((p) => p.verification_status === 'PENDING_VERIFICATION');
  return { success: true, payments: pending };
}

export async function verifyPaymentAdminAction(
  paymentId: string,
  isApproved: boolean,
  notes?: string,
  projectId?: string
) {
  try {
    let idx = mockPayments.findIndex((p) => p.id === paymentId);
    if (idx === -1 && projectId) {
      idx = mockPayments.findIndex((p) => p.project_id === projectId);
    }
    if (idx === -1) {
      const cleanId = paymentId.replace(/^pay-/, '');
      idx = mockPayments.findIndex((p) => p.id === cleanId || p.project_id === cleanId);
    }

    // If not found in in-memory server state, synthesize the record safely
    if (idx === -1) {
      const targetProjId = projectId || paymentId.replace(/^pay-/, '');
      const restoredPayment: Payment = {
        id: paymentId,
        project_id: targetProjId,
        milestone_id: `mile-${targetProjId}-1`,
        payer_id: 'user-buyer',
        subtotal: 150000,
        unique_code: 341,
        total_amount: 150341,
        bank_name: 'BCA / SeaBank / ShopeePay',
        verification_status: isApproved ? 'VERIFIED' : 'REJECTED',
        verified_by: isApproved ? 'admin-super-1' : undefined,
        verified_at: isApproved ? new Date().toISOString() : undefined,
        rejection_reason: isApproved ? undefined : (notes || 'Bukti transfer tidak sesuai dengan mutasi rekening nyata.'),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPayments.unshift(restoredPayment);
      idx = 0;
    }

    const payment = mockPayments[idx];

    if (isApproved) {
      payment.verification_status = 'VERIFIED';
      payment.verified_by = 'admin-super-1';
      payment.verified_at = new Date().toISOString();

      // Mark project status as IN_PROGRESS
      if (payment.project_id) {
        await markProjectInProgress(payment.project_id);
      }

      // Create or update Escrow Transaction to HELD
      const milestoneId = payment.milestone_id || `mile-${payment.project_id}-1`;
      const escrowIdx = mockEscrow.findIndex((e) => e.milestone_id === milestoneId);
      if (escrowIdx !== -1) {
        mockEscrow[escrowIdx].status = 'HELD';
        mockEscrow[escrowIdx].held_at = new Date().toISOString();
      } else {
        mockEscrow.push({
          id: `escrow-${Date.now()}`,
          project_id: payment.project_id,
          milestone_id: milestoneId,
          payment_id: payment.id,
          amount: payment.subtotal || 150000,
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

    try {
      revalidatePath('/admin/payments');
      if (payment.project_id) {
        revalidatePath(`/buyer/projects/${payment.project_id}/payment`);
        revalidatePath(`/buyer/projects/${payment.project_id}`);
        revalidatePath('/buyer/projects');
      }
    } catch {
      // ignore path revalidation errors
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in verifyPaymentAdminAction:', err);
    return { success: false, error: err?.message || 'Gagal memproses verifikasi mutasi.' };
  }
}

export async function getProjectEscrowStatusAction(projectId: string) {
  const txs = mockEscrow.filter((e) => e.project_id === projectId);
  return { success: true, escrow: txs };
}
