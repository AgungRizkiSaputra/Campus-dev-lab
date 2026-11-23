'use server';

import { createClient } from '@/lib/supabase/server';
import { projectWizardSchema, type ProjectWizardInput } from '@/lib/validations/project.schema';
import { revalidatePath } from 'next/cache';
import type { Project, Milestone } from '@/types/database.types';

// Mock storage for offline/testing mode when database table is not yet seeded
let mockProjects: Project[] = [
  {
    id: 'demo-1',
    buyer_id: 'user-buyer-1',
    assigned_joki_id: 'user-seller-1',
    title: 'Pengembangan Model Deteksi Anomali Jaringan Berbasis Deep Learning',
    faculty: 'Teknik',
    major: 'Teknik Informatika',
    topic: 'Keamanan Jaringan & Deep Learning',
    description: 'Penelitian untuk mendeteksi serangan DDoS menggunakan model arsitektur LSTM dan Transformer dengan dataset CICIDS2017.',
    service_type: 'RESEARCH_ASSISTANCE',
    budget_min: 2500000,
    budget_max: 3500000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    buyer_id: 'user-buyer-1',
    title: 'Analisis Pengaruh Good Corporate Governance terhadap Kinerja Finansial',
    faculty: 'Ekonomi dan Bisnis',
    major: 'Akuntansi',
    topic: 'Tata Kelola Perusahaan & Rasio Keuangan',
    description: 'Analisis regresi data panel untuk menguji pengaruh dewan komisaris independen dan komite audit terhadap ROA dan ROE perusahaan manufaktur di BEI.',
    service_type: 'CONSULTATION',
    budget_min: 1500000,
    budget_max: 2200000,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function createProjectAction(input: ProjectWizardInput) {
  // 1. Zod Validation
  const validated = projectWizardSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Input tidak valid.',
    };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const buyerId = user?.id || 'user-buyer-1';

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        buyer_id: buyerId,
        title: validated.data.title,
        faculty: validated.data.faculty,
        major: validated.data.major,
        topic: validated.data.topic,
        description: validated.data.description,
        service_type: validated.data.service_type,
        budget_min: validated.data.budget_min,
        budget_max: validated.data.budget_max,
        deadline: validated.data.deadline,
        initial_draft_url: validated.data.initial_draft_url,
        status: 'OPEN',
      })
      .select()
      .single();

    if (error || !data) {
      // In development fallback to mock array
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        buyer_id: buyerId,
        title: validated.data.title,
        faculty: validated.data.faculty,
        major: validated.data.major,
        topic: validated.data.topic,
        description: validated.data.description,
        service_type: validated.data.service_type,
        budget_min: validated.data.budget_min,
        budget_max: validated.data.budget_max,
        deadline: validated.data.deadline,
        initial_draft_url: validated.data.initial_draft_url,
        status: 'OPEN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProjects.unshift(newProject);
      revalidatePath('/buyer');
      revalidatePath('/seller/explore');
      return { success: true, project: newProject };
    }

    revalidatePath('/buyer');
    revalidatePath('/seller/explore');
    return { success: true, project: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membuat proyek.';
    return { success: false, error: message };
  }
}

export async function getProjectsAction(filter?: {
  role?: 'buyer' | 'seller';
  major?: string;
  maxBudget?: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    let query = supabase.from('projects').select('*, buyer:profiles!buyer_id(*)');

    if (filter?.role === 'buyer') {
      const buyerId = user?.id || 'user-buyer-1';
      query = query.eq('buyer_id', buyerId);
    } else {
      // Sellers only view OPEN or BIDDING
      query = query.in('status', ['OPEN', 'BIDDING']);
    }

    if (filter?.major) {
      query = query.ilike('major', `%${filter.major}%`);
    }

    if (filter?.maxBudget) {
      query = query.lte('budget_min', filter.maxBudget);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Filter mock projects as reliable fallback
      let result = [...mockProjects];
      if (filter?.role === 'buyer') {
        result = result.filter((p) => p.buyer_id === (user?.id || 'user-buyer-1'));
      } else {
        result = result.filter((p) => p.status === 'OPEN' || p.status === 'BIDDING');
      }
      if (filter?.major) {
        result = result.filter((p) => p.major.toLowerCase().includes(filter.major!.toLowerCase()));
      }
      if (filter?.maxBudget) {
        result = result.filter((p) => p.budget_min <= filter.maxBudget!);
      }
      return { success: true, projects: result };
    }

    return { success: true, projects: data as Project[] };
  } catch {
    return { success: true, projects: mockProjects };
  }
}

export async function getProjectByIdAction(id: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, buyer:profiles!buyer_id(*), assigned_joki:profiles!assigned_joki_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      const found = mockProjects.find((p) => p.id === id);
      if (!found) return { success: false, error: 'Proyek tidak ditemukan.' };
      return { success: true, project: found };
    }

    return { success: true, project: data as Project };
  } catch {
    const found = mockProjects.find((p) => p.id === id);
    if (!found) return { success: false, error: 'Proyek tidak ditemukan.' };
    return { success: true, project: found };
  }
}

export async function cancelProjectAction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'REFUNDED' })
      .eq('id', id)
      .eq('buyer_id', user?.id || 'user-buyer-1')
      .in('status', ['DRAFT', 'OPEN']);

    if (error) {
      const idx = mockProjects.findIndex((p) => p.id === id);
      if (idx !== -1) mockProjects[idx].status = 'REFUNDED';
    }

    revalidatePath('/buyer');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membatalkan proyek.';
    return { success: false, error: message };
  }
}
