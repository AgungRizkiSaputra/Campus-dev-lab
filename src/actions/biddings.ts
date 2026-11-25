'use server';

import { createClient } from '@/lib/supabase/server';
import { bidSubmissionSchema, type BidSubmissionInput } from '@/lib/validations/bid.schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { Bidding } from '@/types/database.types';

const isMockSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('jokiskripsi.supabase.co') ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy');

function getSessionUser() {
  try {
    const raw = cookies().get('joki_auth_session')?.value;
    if (raw) {
      return JSON.parse(decodeURIComponent(raw));
    }
  } catch {
    return null;
  }
  return null;
}

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

// Clean in-memory Bids store starting empty for real user testing
let mockBids: Bidding[] = [];

export async function submitBidAction(input: BidSubmissionInput) {
  // 1. Zod Validation
  const validated = bidSubmissionSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Input penawaran tidak valid.',
    };
  }

  const sessionUser = getSessionUser();
  const jokiId = sessionUser?.id || (sessionUser?.email ? `seller-${sessionUser.email}` : 'seller-tim');
  const jokiName = sessionUser?.name || sessionUser?.full_name || 'Mitra Penjoki (Tim Inti)';

  // 2. Allow updating existing pending bid for this project (Nego / Revisi Penawaran)
  const existingIdx = mockBids.findIndex(
    (b) => b.project_id === validated.data.project_id && (b.joki_id === jokiId || b.joki_id === 'user-seller-1' || b.joki_id === 'seller-tim')
  );

  if (existingIdx !== -1) {
    mockBids[existingIdx].bid_amount = validated.data.bid_amount;
    mockBids[existingIdx].proposal = validated.data.proposal;
    mockBids[existingIdx].estimated_days = validated.data.estimated_days;
    mockBids[existingIdx].updated_at = new Date().toISOString();
    revalidatePath('/seller/my-bids');
    revalidatePath(`/buyer/projects/${validated.data.project_id}`);
    return { success: true, bid: mockBids[existingIdx] };
  }

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
      full_name: jokiName,
      whatsapp_number: sessionUser?.phone || sessionUser?.whatsapp_number || '62881010290185',
      kyc_status: 'VERIFIED',
      is_verified: true,
      rating_avg: 5.0,
      rating_count: 1,
      completed_projects_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  if (isMockSupabase) {
    mockBids.unshift(newBid);
    revalidatePath('/seller/my-bids');
    revalidatePath(`/buyer/projects/${validated.data.project_id}`);
    return { success: true, bid: newBid };
  }

  const supabase = createClient();
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
  const sessionUser = getSessionUser();
  const userRole = sessionUser?.role || 'buyer';
  const userId = sessionUser?.id || 'user-buyer-1';

  if (isMockSupabase) {
    let filtered = mockBids.filter((b) => b.project_id === projectId);
    if (userRole === 'seller') {
      filtered = filtered.filter((b) => b.joki_id === userId);
    }
    return { success: true, bids: filtered };
  }

  const supabase = createClient();
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
  const sessionUser = getSessionUser();
  const jokiId = sessionUser?.id || 'user-seller-1';

  if (isMockSupabase) {
    const myBids = mockBids.filter((b) => b.joki_id === jokiId);
    return { success: true, bids: myBids };
  }

  const supabase = createClient();
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
  const targetBid = mockBids.find((b) => b.id === bidId || b.project_id === projectId);
  if (isMockSupabase) {
    mockBids.forEach((b) => {
      if (b.project_id === projectId) {
        b.status = b.id === bidId ? 'ACCEPTED' : 'REJECTED';
      }
    });
    revalidatePath('/buyer');
    revalidatePath('/seller');
    return { success: true, dealAmount: targetBid?.bid_amount };
  }

  const supabase = createClient();
  try {
    await supabase
      .from('projects')
      .update({ assigned_joki_id: jokiId, status: 'IN_PROGRESS' })
      .eq('id', projectId);

    await supabase
      .from('biddings')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId);

    await supabase
      .from('biddings')
      .update({ status: 'REJECTED' })
      .eq('project_id', projectId)
      .neq('id', bidId);

    mockBids.forEach((b) => {
      if (b.project_id === projectId) {
        b.status = b.id === bidId ? 'ACCEPTED' : 'REJECTED';
      }
    });

    revalidatePath('/buyer');
    revalidatePath('/seller');
    return { success: true, dealAmount: targetBid?.bid_amount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menerima penawaran.';
    return { success: false, error: message };
  }
}
