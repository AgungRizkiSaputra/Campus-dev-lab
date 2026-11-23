// PRD v7.0 FR-06 & Section 20: Milestone Progression & Turnitin Anti-Plagiarism Lock

interface Milestone {
  id: string;
  projectId: string;
  sequenceOrder: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
  draftUrl?: string;
  turnitinReportUrl?: string;
  plagiarismScore?: number;
  submittedAt?: string;
}

const MAX_ALLOWED_SIMILARITY_PERCENT = 25; // PRD v7.0 strict Turnitin threshold

function submitMilestoneDraft(
  milestone: Milestone,
  submission: {
    draftUrl: string;
    turnitinReportUrl: string;
    plagiarismScore: number;
  }
): { success: boolean; error?: string; updatedMilestone?: Milestone } {
  // 1. Mandatory Turnitin report check
  if (!submission.turnitinReportUrl || submission.turnitinReportUrl.trim() === '') {
    return {
      success: false,
      error: 'Turnitin Anti-Plagiarism Lock: Laporan uji kesamaan Turnitin (.pdf) wajib disertakan.',
    };
  }

  // 2. Draft manuscript required
  if (!submission.draftUrl || submission.draftUrl.trim() === '') {
    return {
      success: false,
      error: 'File naskah revisi/bimbingan (.docx/.pdf) wajib diunggah.',
    };
  }

  // 3. Similarity score threshold check
  if (submission.plagiarismScore > MAX_ALLOWED_SIMILARITY_PERCENT) {
    return {
      success: false,
      error: `Skor plagiarisme (${submission.plagiarismScore}%) melebihi ambang batas toleransi maksimal (${MAX_ALLOWED_SIMILARITY_PERCENT}%). Lakukan parafrase mandiri sebelum submit.`,
    };
  }

  return {
    success: true,
    updatedMilestone: {
      ...milestone,
      status: 'SUBMITTED',
      draftUrl: submission.draftUrl,
      turnitinReportUrl: submission.turnitinReportUrl,
      plagiarismScore: submission.plagiarismScore,
      submittedAt: new Date().toISOString(),
    },
  };
}

function checkSequentialMilestonePrerequisite(
  milestones: Milestone[],
  targetSequence: number
): boolean {
  if (targetSequence === 1) return true;
  const previousMilestone = milestones.find((m) => m.sequenceOrder === targetSequence - 1);
  return previousMilestone ? previousMilestone.status === 'APPROVED' : false;
}

describe('Milestones & Turnitin Anti-Plagiarism Lock Engine', () => {
  const sampleMilestone: Milestone = {
    id: 'mile-1',
    projectId: 'proj-1',
    sequenceOrder: 1,
    title: 'Bab 1: Pendahuluan & Latar Belakang Masalah',
    status: 'IN_PROGRESS',
  };

  test('TC-MLS-01: Accepts draft submission when Turnitin similarity <= 25%', () => {
    const submission = {
      draftUrl: 'https://supabase.co/storage/v1/object/sign/documents/bab1_draft.docx',
      turnitinReportUrl: 'https://supabase.co/storage/v1/object/sign/documents/turnitin_bab1.pdf',
      plagiarismScore: 18, // 18% <= 25%
    };

    const result = submitMilestoneDraft(sampleMilestone, submission);
    expect(result.success).toBe(true);
    expect(result.updatedMilestone?.status).toBe('SUBMITTED');
    expect(result.updatedMilestone?.plagiarismScore).toBe(18);
  });

  test('TC-MLS-02: Rejects submission if Turnitin report is missing (Lock Enforced)', () => {
    const submission = {
      draftUrl: 'https://supabase.co/storage/v1/object/sign/documents/bab1_draft.docx',
      turnitinReportUrl: '', // Missing
      plagiarismScore: 10,
    };

    const result = submitMilestoneDraft(sampleMilestone, submission);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Turnitin Anti-Plagiarism Lock');
  });

  test('TC-MLS-03: Rejects submission if similarity score exceeds 25%', () => {
    const submission = {
      draftUrl: 'https://supabase.co/storage/v1/object/sign/documents/bab1_draft.docx',
      turnitinReportUrl: 'https://supabase.co/storage/v1/object/sign/documents/turnitin_bab1.pdf',
      plagiarismScore: 32, // 32% > 25%
    };

    const result = submitMilestoneDraft(sampleMilestone, submission);
    expect(result.success).toBe(false);
    expect(result.error).toContain('melebihi ambang batas toleransi maksimal (25%)');
  });

  test('TC-MLS-04: Sequential milestone progression blocks milestone 2 until milestone 1 is approved', () => {
    const milestones: Milestone[] = [
      { id: 'm-1', projectId: 'p-1', sequenceOrder: 1, title: 'Bab 1', status: 'SUBMITTED' },
      { id: 'm-2', projectId: 'p-1', sequenceOrder: 2, title: 'Bab 2', status: 'PENDING' },
    ];

    expect(checkSequentialMilestonePrerequisite(milestones, 1)).toBe(true);
    expect(checkSequentialMilestonePrerequisite(milestones, 2)).toBe(false);

    // Approve Bab 1
    milestones[0].status = 'APPROVED';
    expect(checkSequentialMilestonePrerequisite(milestones, 2)).toBe(true);
  });
});
