'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Milestone } from '@/types/database.types';

let mockMilestones: Milestone[] = [
  {
    id: 'mile-1',
    project_id: 'demo-1',
    order_index: 1,
    title: 'Bab 1 & Bab 2: Pendahuluan dan Tinjauan Pustaka',
    description: 'Penyusunan latar belakang masalah, gap penelitian, rumusan masalah, dan kerangka teori.',
    amount: 1000000,
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PAID',
    plagiarism_score: 12.5,
    submission_doc_url: 'https://storage.jokiskripsi.com/docs/bab1_2_final.pdf',
    plagiarism_report_url: 'https://storage.jokiskripsi.com/docs/turnitin_bab1_2.pdf',
    submitted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mile-2',
    project_id: 'demo-1',
    order_index: 2,
    title: 'Bab 3: Metodologi Penelitian & Desain Arsitektur',
    description: 'Desain model LSTM, preprocessing dataset, skema pengujian validasi silang (cross-validation).',
    amount: 1500000,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SUBMITTED',
    submission_notes: 'Draf Bab 3 lengkap telah selesai beserta source code arsitektur model dan laporan Turnitin 9%.',
    submission_doc_url: 'https://storage.jokiskripsi.com/docs/bab3_draft.docx',
    plagiarism_report_url: 'https://storage.jokiskripsi.com/docs/turnitin_bab3.pdf',
    plagiarism_score: 9.0,
    submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    escalation_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 3x24 jam window
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mile-3',
    project_id: 'demo-1',
    order_index: 3,
    title: 'Bab 4 & Bab 5: Hasil Pengujian, Pembahasan & Kesimpulan',
    description: 'Evaluasi metrik akurasi, presisi, recall, F1-score, serta perumusan saran riset lanjutan.',
    amount: 1000000,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'LOCKED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getProjectMilestonesAction(projectId: string) {
  const list = mockMilestones.filter((m) => m.project_id === projectId);
  return { success: true, milestones: list };
}

export async function submitMilestoneWorkAction(
  milestoneId: string,
  submissionNotes: string,
  submissionDocUrl: string,
  plagiarismReportUrl: string,
  plagiarismScore: number
) {
  // FR-15 Anti-Plagiarism Lock: Must upload plagiarism report
  if (!plagiarismReportUrl) {
    return {
      success: false,
      error: 'Turnitin / Anti-Plagiarism Lock: Anda wajib menyertakan laporan plagiarisme sebelum mengajukan serahan.',
    };
  }

  const idx = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (idx === -1) return { success: false, error: 'Milestone tidak ditemukan.' };

  mockMilestones[idx].status = 'SUBMITTED';
  mockMilestones[idx].submission_notes = submissionNotes;
  mockMilestones[idx].submission_doc_url = submissionDocUrl;
  mockMilestones[idx].plagiarism_report_url = plagiarismReportUrl;
  mockMilestones[idx].plagiarism_score = plagiarismScore;
  mockMilestones[idx].submitted_at = new Date().toISOString();
  // 3-day approval window
  mockMilestones[idx].escalation_deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  mockMilestones[idx].updated_at = new Date().toISOString();

  revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
  return { success: true };
}

export async function approveMilestoneAction(milestoneId: string) {
  const idx = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (idx === -1) return { success: false, error: 'Milestone tidak ditemukan.' };

  // Set APPROVED & trigger payout release
  mockMilestones[idx].status = 'APPROVED';
  mockMilestones[idx].approved_at = new Date().toISOString();
  mockMilestones[idx].updated_at = new Date().toISOString();

  // Next milestone unlocks to IN_PROGRESS if exists
  const nextIdx = mockMilestones.findIndex(
    (m) => m.project_id === mockMilestones[idx].project_id && m.order_index === mockMilestones[idx].order_index + 1
  );
  if (nextIdx !== -1 && mockMilestones[nextIdx].status === 'LOCKED') {
    mockMilestones[nextIdx].status = 'IN_PROGRESS';
  }

  revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
  return { success: true };
}

export async function requestMilestoneRevisionAction(milestoneId: string, notes: string) {
  const idx = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (idx === -1) return { success: false, error: 'Milestone tidak ditemukan.' };

  mockMilestones[idx].status = 'REVISION';
  mockMilestones[idx].submission_notes = notes;
  mockMilestones[idx].updated_at = new Date().toISOString();

  revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
  return { success: true };
}
