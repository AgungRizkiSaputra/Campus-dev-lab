'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PortfolioItem {
  id: string;
  joki_id: string;
  title: string;
  major: string;
  description: string;
  abstract_preview: string;
  sample_file_url?: string | null;
  created_at: string;
}

let mockPortfolios: PortfolioItem[] = [];

export async function getJokiPortfoliosAction(jokiId: string) {
  const list = mockPortfolios.filter((p) => p.joki_id === jokiId);
  return { success: true, portfolios: list };
}

export async function addPortfolioAction(
  title: string,
  major: string,
  description: string,
  abstractPreview: string,
  sampleFileUrl?: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jokiId = user?.id || 'user-seller-1';

  const newItem: PortfolioItem = {
    id: `port-${Date.now()}`,
    joki_id: jokiId,
    title,
    major,
    description,
    abstract_preview: abstractPreview,
    sample_file_url: sampleFileUrl,
    created_at: new Date().toISOString(),
  };

  mockPortfolios.unshift(newItem);
  revalidatePath('/seller/portfolio');
  revalidatePath('/profile');
  return { success: true, portfolio: newItem };
}
