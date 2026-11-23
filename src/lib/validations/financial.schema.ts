import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  project_id: z.string().uuid(),
  milestone_id: z.string().uuid(),
  subtotal: z.number().min(50_000, 'Nominal minimal Rp 50.000'),
});

export const uploadPaymentProofSchema = z.object({
  payment_id: z.string().uuid('ID Pembayaran tidak valid.'),
  bank_name: z.string().min(2, 'Nama bank pengirim wajib diisi.'),
  transfer_ref: z
    .string()
    .min(4, 'Nomor referensi mutasi / transfer wajib diisi.')
    .max(100, 'Nomor referensi terlalu panjang.'),
  payment_proof_url: z.string().min(1, 'Bukti transfer wajib diunggah.'),
});

export const verifyPaymentAdminSchema = z.object({
  payment_id: z.string().uuid(),
  is_approved: z.boolean(),
  notes: z.string().optional(),
});

export const submitMilestoneSchema = z.object({
  milestone_id: z.string().uuid(),
  submission_notes: z.string().min(10, 'Catatan serahan minimal 10 karakter.'),
  submission_doc_url: z.string().min(1, 'Dokumen draf skripsi wajib diunggah.'),
  plagiarism_report_url: z.string().min(1, 'Laporan plagiarisme (Turnitin) wajib disertakan.'),
  plagiarism_score: z
    .number()
    .min(0, 'Skor plagiarisme tidak valid.')
    .max(100, 'Skor plagiarisme maksimal 100%.'),
});

export const openDisputeSchema = z.object({
  project_id: z.string().uuid(),
  milestone_id: z.string().uuid(),
  reason: z.enum([
    'QUALITY_ISSUE',
    'DEADLINE_MISSED',
    'COMMUNICATION_BREAKDOWN',
    'PLAGIARISM_DETECTED',
    'CLIENT_UNRESPONSIVE',
    'OTHER',
  ]),
  description: z.string().min(20, 'Jelaskan alasan sengketa secara rinci minimal 20 karakter.'),
  evidence_url: z.string().optional(),
});

export const resolveDisputeSchema = z.object({
  dispute_id: z.string().uuid(),
  action: z.enum(['FORCE_RELEASE', 'FORCE_REFUND']),
  admin_notes: z.string().min(10, 'Catatan putusan mediasi admin minimal 10 karakter.'),
});
