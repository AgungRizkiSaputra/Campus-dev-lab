'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ReviewItem {
  id: string;
  project_id: string;
  project_title: string;
  buyer_id: string;
  buyer_name: string;
  joki_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

let mockReviews: ReviewItem[] = [];

export async function submitReviewAction(
  projectId: string,
  projectTitle: string,
  jokiId: string,
  rating: number,
  reviewText: string
) {
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Rating harus antara 1 sampai 5 bintang.' };
  }
  if (!reviewText.trim() || reviewText.length < 10) {
    return { success: false, error: 'Ulasan minimal 10 karakter.' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const newRev: ReviewItem = {
    id: `rev-${Date.now()}`,
    project_id: projectId,
    project_title: projectTitle,
    buyer_id: user?.id || 'user-buyer-1',
    buyer_name: user?.user_metadata?.full_name || 'Dimas Pratama',
    joki_id: jokiId,
    rating,
    review_text: reviewText,
    created_at: new Date().toISOString(),
  };

  mockReviews.unshift(newRev);
  revalidatePath('/profile');
  return { success: true, review: newRev };
}

export async function getJokiReviewsAction(jokiId: string) {
  const list = mockReviews.filter((r) => r.joki_id === jokiId);
  const avg = list.length ? (list.reduce((acc, r) => acc + r.rating, 0) / list.length).toFixed(2) : '5.00';
  return { success: true, reviews: list, average: Number(avg), count: list.length };
}
