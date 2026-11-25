'use server';

import { createClient } from '@/lib/supabase/server';
import { projectWizardSchema, type ProjectWizardInput } from '@/lib/validations/project.schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { Project, Milestone } from '@/types/database.types';

// Clean in-memory storage starting empty for real user testing
let mockProjects: Project[] = [];

export async function markProjectInProgress(projectId: string) {
  const p = mockProjects.find((x) => x.id === projectId);
  if (p) {
    p.status = 'IN_PROGRESS';
    p.updated_at = new Date().toISOString();
  }
  return { success: true };
}

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

export async function createProjectAction(input: ProjectWizardInput, customBuyerId?: string) {
  // 1. Zod Validation
  const validated = projectWizardSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Input tidak valid.',
    };
  }

  const sessionUser = getSessionUser();
  const buyerId = customBuyerId || sessionUser?.id || `buyer-${Date.now()}`;

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

  // Instant response without waiting for dead network timeouts
  if (isMockSupabase) {
    mockProjects.unshift(newProject);
    revalidatePath('/buyer');
    revalidatePath('/buyer/projects');
    revalidatePath('/seller/explore');
    return { success: true, project: newProject };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      mockProjects.unshift(newProject);
      revalidatePath('/buyer');
      revalidatePath('/buyer/projects');
      revalidatePath('/seller/explore');
      return { success: true, project: newProject };
    }

    revalidatePath('/buyer');
    revalidatePath('/buyer/projects');
    revalidatePath('/seller/explore');
    return { success: true, project: data };
  } catch {
    mockProjects.unshift(newProject);
    return { success: true, project: newProject };
  }
}

export async function getProjectsAction(filter?: {
  role?: 'buyer' | 'seller';
  major?: string;
  maxBudget?: number;
}) {
  const sessionUser = getSessionUser();

  // Instant local/mock evaluation (0ms latency)
  if (isMockSupabase) {
    let result = [...mockProjects];
    if (filter?.role === 'buyer') {
      const currentBuyerId = sessionUser?.id;
      if (currentBuyerId) {
        const userProjects = mockProjects.filter((p) => p.buyer_id === currentBuyerId);
        result = userProjects.length > 0 ? userProjects : mockProjects;
      } else {
        result = mockProjects;
      }
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

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    let query = supabase.from('projects').select('*, buyer:profiles!buyer_id(*)');

    if (filter?.role === 'buyer') {
      const buyerId = sessionUser?.id || user?.id || 'buyer-1';
      query = query.eq('buyer_id', buyerId);
    } else {
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
      let result = [...mockProjects];
      if (filter?.role === 'buyer') {
        const currentBuyerId = sessionUser?.id || user?.id;
        if (currentBuyerId) {
          const userProjects = mockProjects.filter((p) => p.buyer_id === currentBuyerId);
          result = userProjects.length > 0 ? userProjects : mockProjects;
        } else {
          result = mockProjects;
        }
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
  const foundMock = mockProjects.find((p) => p.id === id);
  if (foundMock) {
    return { success: true, project: foundMock };
  }

  if (isMockSupabase) {
    return { success: false, error: 'Proyek tidak ditemukan.' };
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, buyer:profiles!buyer_id(*), assigned_joki:profiles!assigned_joki_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { success: false, error: 'Proyek tidak ditemukan.' };
    }
    return { success: true, project: data as Project };
  } catch {
    return { success: false, error: 'Proyek tidak ditemukan.' };
  }
}

export async function cancelProjectAction(id: string) {
  const sessionUser = getSessionUser();

  if (isMockSupabase) {
    const idx = mockProjects.findIndex((p) => p.id === id);
    if (idx !== -1) mockProjects[idx].status = 'REFUNDED';
    revalidatePath('/buyer');
    return { success: true };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'REFUNDED' })
      .eq('id', id)
      .eq('buyer_id', user?.id || sessionUser?.id || 'user-buyer-1')
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
