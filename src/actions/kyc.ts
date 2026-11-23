'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { KycStatus } from '@/types/database.types';

export interface KycSubmission {
  id: string;
  joki_id: string;
  joki_name: string;
  university: string;
  major: string;
  id_card_type: string;
  id_card_number_masked: string;
  id_card_image_url: string;
  selfie_with_id_url: string;
  status: KycStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

let mockKycList: KycSubmission[] = [
  {
    id: 'kyc-1',
    joki_id: 'user-seller-1',
    joki_name: 'Dr. Hendra Wijaya, M.Kom',
    university: 'Universitas Gadjah Mada',
    major: 'Ilmu Komputer',
    id_card_type: 'KTP',
    id_card_number_masked: '3304**********01',
    id_card_image_url: 'https://storage.jokiskripsi.com/kyc/ktp_hendra.jpg',
    selfie_with_id_url: 'https://storage.jokiskripsi.com/kyc/selfie_hendra.jpg',
    status: 'VERIFIED',
    submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'kyc-2',
    joki_id: 'user-seller-2',
    joki_name: 'Ratna Kusuma, S.E., M.Acc',
    university: 'Universitas Indonesia',
    major: 'Akuntansi Keuangan',
    id_card_type: 'KTP',
    id_card_number_masked: '3171**********02',
    id_card_image_url: 'https://storage.jokiskripsi.com/kyc/ktp_ratna.jpg',
    selfie_with_id_url: 'https://storage.jokiskripsi.com/kyc/selfie_ratna.jpg',
    status: 'PENDING',
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export async function submitKycAction(
  idCardNumberMasked: string,
  idCardImageUrl: string,
  selfieWithIdUrl: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  const newSubmission: KycSubmission = {
    id: `kyc-${Date.now()}`,
    joki_id: jokiId,
    joki_name: user?.user_metadata?.full_name || 'Ratna Kusuma',
    university: 'Universitas Indonesia',
    major: 'Akuntansi',
    id_card_type: 'KTP',
    id_card_number_masked: idCardNumberMasked,
    id_card_image_url: idCardImageUrl,
    selfie_with_id_url: selfieWithIdUrl,
    status: 'PENDING',
    submitted_at: new Date().toISOString(),
  };

  const existingIdx = mockKycList.findIndex((k) => k.joki_id === jokiId);
  if (existingIdx !== -1) {
    mockKycList[existingIdx] = newSubmission;
  } else {
    mockKycList.unshift(newSubmission);
  }

  revalidatePath('/seller/kyc');
  revalidatePath('/admin/kyc-queue');
  return { success: true, submission: newSubmission };
}

export async function getKycStatusAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  const found = mockKycList.find((k) => k.joki_id === jokiId);
  return { success: true, kyc: found || null };
}

export async function getAdminKycQueueAction() {
  return { success: true, queue: mockKycList };
}

export async function reviewKycAdminAction(
  kycId: string,
  isApproved: boolean,
  rejectionReason?: string
) {
  const idx = mockKycList.findIndex((k) => k.id === kycId);
  if (idx === -1) return { success: false, error: 'Pengajuan KYC tidak ditemukan.' };

  mockKycList[idx].status = isApproved ? 'VERIFIED' : 'REJECTED';
  mockKycList[idx].rejection_reason = isApproved ? null : rejectionReason;
  mockKycList[idx].reviewed_at = new Date().toISOString();

  revalidatePath('/admin/kyc-queue');
  revalidatePath('/seller/kyc');
  return { success: true };
}
