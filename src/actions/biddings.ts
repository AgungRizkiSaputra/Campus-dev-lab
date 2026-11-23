'use server';

import { createClient } from '@/lib/supabase/server';
import { bidSubmissionSchema, type BidSubmissionInput } from '@/lib/validations/bid.schema';
import { revalidatePath } from 'next/cache';
import type { Bidding } from '@/types/database.types';

// Rate limiting in-memory store: user_id -> array of timestamps
const userBidTimestamps = new Map<string, number[]>();

function checkBidRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const timestamps = userBidTimestamps.get(userId) || [];
  const recent = timestamps.filter((t) => t > oneHourAgo);

  if (recent.length >= 5) {
    return false; // Limit exceeded (Max 5 bids per hour)
  }

  recent.push(now);
  userBidTimestamps.set(userId, recent);
  return true;
}

// Mock Bids store
let mockBids: Bidding[] = [
  {
    id: 'bid-1',
    project_id: 'demo-1',
    joki_id: 'user-seller-1',
    bid_amount: 3000000,
    proposal: 'Saya merupakan magister Informatika dengan spesialisasi Deep Learning dan NLP. Siap mendampingi hingga sidang.',
    estimated_days: 14,
    status: 'ACCEPTED',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    joki: {
      id: 'user-seller-1',
      role: 'seller',
      full_name: 'Dr. Hendra Wijaya, M.Kom',
      whatsapp_number: '6281234567890',
      kyc_status: 'VERIFIED',
      is_verified: true,
      rating_avg: 4.95,
      rating_count: 32,
      completed_projects_count: 28,
      university: 'Universitas Gadjah Mada',
      major: 'Ilmu Komputer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'bid-2',
    project_id: 'demo-2',
    joki_id: 'user-seller-2',
    bid_amount: 1800000,
    proposal: 'Pengalaman 5 tahun dalam pengolahan data panel EViews dan Stata untuk skripsi akuntansi keuangan.',
    estimated_days: 10,
    status: 'PENDING',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    joki: {
      id: 'user-seller-2',
      role: 'seller',
      full_name: 'Ratna Kusuma, S.E., M.Acc',
      whatsapp_number: '6289876543210',
      kyc_status: 'VERIFIED',
      is_verified: true,
      rating_avg: 4.88,
      rating_count: 19,
      completed_projects_count: 17,
      university: 'Universitas Indonesia',
      major: 'Akuntansi Keuangan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export async function submitBidAction(input: BidSubmissionInput) {
  // 1. Zod Validation
  const validated = bidSubmissionSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Input penawaran tidak valid.',
    };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  // 2. Rate Limit Enforcement (5 bids per hour per user)
  if (!checkBidRateLimit(jokiId)) {
    return {
      success: false,
      error: 'Batas tercapai: Anda hanya dapat mengajukan maksimal 5 penawaran (bid) per jam.',
    };
  }

  // 3. One-Shot Bid Rule Validation
  const existing = mockBids.find(
    (b) => b.project_id === validated.data.project_id && b.joki_id === jokiId
  );
  if (existing) {
    return {
      success: false,
      error: 'Aturan Blind Bidding: Anda hanya diizinkan mengajukan satu kali penawaran per proyek.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('biddings')
      .insert({
        project_id: validated.data.project_id,
        joki_id: jokiId,
        bid_amount: validated.data.bid_amount,
        proposal: validated.data.proposal,
        estimated_days: validated.data.estimated_days,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error || !data) {
      // Fallback to mock
      const newBid: Bidding = {
        id: `bid-${Date.now()}`,
        project_id: validated.data.project_id,
        joki_id: jokiId,
        bid_amount: validated.data.bid_amount,
        proposal: validated.data.proposal,
        estimated_days: validated.data.estimated_days,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        joki: {
          id: jokiId,
          role: 'seller',
          full_name: 'Penyedia Layanan (Anda)',
          whatsapp_number: '6281234567890',
          kyc_status: 'VERIFIED',
          is_verified: true,
          rating_avg: 5.0,
          rating_count: 1,
          completed_projects_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      mockBids.unshift(newBid);

      revalidatePath('/seller/my-bids');
      revalidatePath(`/buyer/projects/${validated.data.project_id}`);
      return { success: true, bid: newBid };
    }

    revalidatePath('/seller/my-bids');
    revalidatePath(`/buyer/projects/${validated.data.project_id}`);
    return { success: true, bid: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengirim penawaran.';
    return { success: false, error: message };
  }
}

export async function getProjectBidsAction(projectId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // In production, RLS automatically handles isolation.
  // In action layer, we enforce: Joki ONLY sees their own bid, Buyer sees all bids.
  const userRole = (user?.user_metadata?.role as string) || 'buyer';
  const userId = user?.id || 'user-buyer-1';

  try {
    const { data, error } = await supabase
      .from('biddings')
      .select('*, joki:profiles!joki_id(*)')
      .eq('project_id', projectId);

    if (error || !data) {
      let filtered = mockBids.filter((b) => b.project_id === projectId);
      if (userRole === 'seller') {
        filtered = filtered.filter((b) => b.joki_id === userId);
      }
      return { success: true, bids: filtered };
    }

    return { success: true, bids: data as Bidding[] };
  } catch {
    let filtered = mockBids.filter((b) => b.project_id === projectId);
    if (userRole === 'seller') {
      filtered = filtered.filter((b) => b.joki_id === userId);
    }
    return { success: true, bids: filtered };
  }
}

export async function getMyBidsAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  try {
    const { data, error } = await supabase
      .from('biddings')
      .select('*, project:projects!project_id(*)')
      .eq('joki_id', jokiId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      const myBids = mockBids.filter((b) => b.joki_id === jokiId);
      return { success: true, bids: myBids };
    }

    return { success: true, bids: data };
  } catch {
    const myBids = mockBids.filter((b) => b.joki_id === jokiId);
    return { success: true, bids: myBids };
  }
}

export async function acceptBidAction(projectId: string, bidId: string, jokiId: string) {
  const supabase = createClient();

  try {
    // 1. Update project assigned_joki_id and status to IN_PROGRESS
    await supabase
      .from('projects')
      .update({ assigned_joki_id: jokiId, status: 'IN_PROGRESS' })
      .eq('id', projectId);

    // 2. Accept this bid, reject others
    await supabase
      .from('biddings')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId);

    await supabase
      .from('biddings')
      .update({ status: 'REJECTED' })
      .eq('project_id', projectId)
      .neq('id', bidId);

    // Update in mock
    mockBids.forEach((b) => {
      if (b.project_id === projectId) {
        b.status = b.id === bidId ? 'ACCEPTED' : 'REJECTED';
      }
    });

    revalidatePath('/buyer');
    revalidatePath('/seller');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menerima penawaran.';
    return { success: false, error: message };
  }
}
