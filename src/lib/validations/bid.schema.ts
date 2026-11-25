import { z } from 'zod';

export const bidSubmissionSchema = z.object({
  project_id: z.string().min(1, 'ID Proyek wajib diisi.'),
  bid_amount: z
    .number({ invalid_type_error: 'Nominal penawaran harus berupa angka.' })
    .min(50_000, 'Penawaran minimal Rp 50.000.'),
  proposal: z
    .string()
    .min(10, 'Proposal penawaran minimal 10 karakter. Jelaskan kualifikasi dan rencana pengerjaan Anda.')
    .max(3000, 'Proposal maksimal 3000 karakter.'),
  estimated_days: z
    .number({ invalid_type_error: 'Estimasi hari harus berupa angka.' })
    .min(1, 'Estimasi hari minimal 1 hari.')
    .max(180, 'Estimasi hari maksimal 180 hari.'),
});

export type BidSubmissionInput = z.infer<typeof bidSubmissionSchema>;
