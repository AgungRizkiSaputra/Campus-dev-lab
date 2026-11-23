import { z } from 'zod';

export const messageSchema = z.object({
  project_id: z.string().uuid(),
  content: z.string().min(1, 'Pesan tidak boleh kosong.').max(2000, 'Pesan maksimal 2000 karakter.'),
  attachment_url: z.string().optional().nullable(),
});

export type MessageInput = z.infer<typeof messageSchema>;
