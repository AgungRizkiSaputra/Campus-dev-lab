'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Milestone } from '@/types/database.types';
import { getServiceConfig, serviceRequiresTurnitin } from '@/lib/services-config';

let mockMilestones: Milestone[] = [];

export async function getProjectMilestonesAction(
  projectId: string,
  serviceType?: string,
  totalBudget?: number,
  paymentMode?: 'FULL' | 'MILESTONE' | null
) {
  let list = mockMilestones.filter((m) => m.project_id === projectId);
  if (list.length === 0 && projectId) {
    const config = getServiceConfig(serviceType);
    const budget = totalBudget || config.minBudget || 1500000;

    // Jika skema adalah FULL (Bayar Lunas 100%), hanya buat 1 deliverable menyeluruh (bukan bertahap)
    if (paymentMode === 'FULL') {
      const single: Milestone = {
        id: `mile-${projectId}-full`,
        project_id: projectId,
        order_index: 1,
        title: 'Pengerjaan & Penyerahan Hasil Akhir Tugas',
        description: 'Pengerjaan tuntas seluruh berkas tugas, draf akademik, dan dokumen kelengkapan sesuai instruksi.',
        amount: budget,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockMilestones.push(single);
      list = [single];
    } else {
      const stageCount = config.stages.length || 3;
      const amountPerStage = Math.round(budget / stageCount);

      const generated: Milestone[] = config.stages.map((st, idx) => ({
        id: `mile-${projectId}-${st.num}`,
        project_id: projectId,
        order_index: st.num,
        title: st.title,
        description: st.desc,
        amount: amountPerStage,
        due_date: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: idx === 0 ? 'IN_PROGRESS' : 'LOCKED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      mockMilestones.push(...generated);
      list = generated;
    }
  }
  return { success: true, milestones: list };
}

export async function submitMilestoneWorkAction(
  milestoneId: string,
  submissionNotes: string,
  submissionDocUrl: string,
  plagiarismReportUrl?: string,
  plagiarismScore?: number,
  projectId?: string,
  serviceType?: string,
  fileMeta?: {
    submissionDocName?: string;
    submissionDocSize?: string;
    submissionDocType?: string;
    plagiarismReportName?: string;
    plagiarismReportSize?: string;
  }
) {
  // Hanya mewajibkan laporan Turnitin jika jenis layanan adalah skripsi / karya ilmiah akademik
  const requiresTurnitin = serviceRequiresTurnitin(serviceType);
  if (requiresTurnitin && (!plagiarismReportUrl || plagiarismReportUrl.trim() === '')) {
    return {
      success: false,
      error: 'Uji Turnitin Wajib: Untuk layanan skripsi / karya ilmiah, laporan uji kesamaan Turnitin (.pdf) wajib disertakan.',
    };
  }

  let idx = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (idx === -1) {
    const projId = projectId || milestoneId.split('-')[1] || 'proj-1';
    const newMile: Milestone = {
      id: milestoneId,
      project_id: projId,
      order_index: 1,
      title: 'Tahap 1: Outline & Draf Kerja',
      amount: 150000,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SUBMITTED',
      submission_notes: submissionNotes,
      submission_doc_url: submissionDocUrl,
      submission_doc_name: fileMeta?.submissionDocName || null,
      submission_doc_size: fileMeta?.submissionDocSize || null,
      submission_doc_type: fileMeta?.submissionDocType || null,
      plagiarism_report_url: requiresTurnitin ? (plagiarismReportUrl || null) : null,
      plagiarism_report_name: requiresTurnitin ? (fileMeta?.plagiarismReportName || null) : null,
      plagiarism_report_size: requiresTurnitin ? (fileMeta?.plagiarismReportSize || null) : null,
      plagiarism_score: requiresTurnitin ? (plagiarismScore ?? null) : null,
      submitted_at: new Date().toISOString(),
      escalation_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockMilestones.push(newMile);
    idx = mockMilestones.length - 1;
  } else {
    mockMilestones[idx].status = 'SUBMITTED';
    mockMilestones[idx].submission_notes = submissionNotes;
    mockMilestones[idx].submission_doc_url = submissionDocUrl;
    if (fileMeta?.submissionDocName) mockMilestones[idx].submission_doc_name = fileMeta.submissionDocName;
    if (fileMeta?.submissionDocSize) mockMilestones[idx].submission_doc_size = fileMeta.submissionDocSize;
    if (fileMeta?.submissionDocType) mockMilestones[idx].submission_doc_type = fileMeta.submissionDocType;
    mockMilestones[idx].plagiarism_report_url = requiresTurnitin ? (plagiarismReportUrl || null) : null;
    if (requiresTurnitin && fileMeta?.plagiarismReportName) mockMilestones[idx].plagiarism_report_name = fileMeta.plagiarismReportName;
    if (requiresTurnitin && fileMeta?.plagiarismReportSize) mockMilestones[idx].plagiarism_report_size = fileMeta.plagiarismReportSize;
    mockMilestones[idx].plagiarism_score = requiresTurnitin ? (plagiarismScore ?? null) : null;
    mockMilestones[idx].submitted_at = new Date().toISOString();
    mockMilestones[idx].escalation_deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    mockMilestones[idx].updated_at = new Date().toISOString();
  }

  try {
    if (mockMilestones[idx]?.project_id) {
      revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
    }
  } catch {
    // ignore
  }
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

  try {
    revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
  } catch {
    // ignore
  }
  return { success: true };
}

export async function requestMilestoneRevisionAction(milestoneId: string, notes: string) {
  const idx = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (idx === -1) return { success: false, error: 'Milestone tidak ditemukan.' };

  mockMilestones[idx].status = 'REVISION';
  mockMilestones[idx].submission_notes = notes;
  mockMilestones[idx].updated_at = new Date().toISOString();

  try {
    revalidatePath(`/buyer/projects/${mockMilestones[idx].project_id}/milestones`);
  } catch {
    // ignore
  }
  return { success: true };
}
