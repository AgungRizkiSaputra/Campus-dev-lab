import { z } from 'zod';

export const serviceTypeEnum = z.enum([
  'CONSULTATION',
  'RESEARCH_ASSISTANCE',
  'PROOFREADING',
  'FORMATTING',
]);

export const projectWizardSchema = z
  .object({
    title: z
      .string()
      .min(10, 'Judul skripsi minimal 10 karakter.')
      .max(255, 'Judul maksimal 255 karakter.'),
    faculty: z.string().min(2, 'Fakultas wajib diisi.'),
    major: z.string().min(2, 'Jurusan wajib diisi.'),
    topic: z
      .string()
      .min(5, 'Topik penelitian minimal 5 karakter.')
      .max(255, 'Topik maksimal 255 karakter.'),
    service_type: serviceTypeEnum,
    description: z
      .string()
      .min(30, 'Deskripsi kebutuhan riset minimal 30 karakter agar joki memahami dengan jelas.')
      .max(5000, 'Deskripsi maksimal 5000 karakter.'),
    budget_min: z
      .number({ invalid_type_error: 'Budget minimum harus berupa angka.' })
      .min(100_000, 'Budget minimum minimal Rp 100.000.'),
    budget_max: z
      .number({ invalid_type_error: 'Budget maksimum harus berupa angka.' })
      .min(100_000, 'Budget maksimum minimal Rp 100.000.'),
    deadline: z.string().refine((val) => {
      const date = new Date(val);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2); // minimal 2 hari ke depan
      return date > minDate;
    }, 'Tenggat waktu (deadline) minimal 3 hari ke depan.'),
    initial_draft_url: z.string().optional().nullable(),
    milestones_count: z.number().min(1).max(5).default(3),
  })
  .refine((data) => data.budget_max >= data.budget_min, {
    message: 'Budget maksimum harus lebih besar atau sama dengan budget minimum.',
    path: ['budget_max'],
  });

export type ProjectWizardInput = z.infer<typeof projectWizardSchema>;
