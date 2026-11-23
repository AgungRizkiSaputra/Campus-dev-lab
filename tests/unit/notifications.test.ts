import { whatsappService } from '@/lib/services/whatsapp';

describe('WhatsApp Notification Service (Wablas Gateway)', () => {
  test('TC-NOTIF-01: Formats professional Indonesian academic message templates', () => {
    const paymentMsg = whatsappService.formatMessage('PAYMENT_RECEIVED', {
      projectName: 'Bimbingan Metodologi Penelitian Kuantitatif',
      amount: 'Rp 1.500.382',
      uniqueCode: '382',
    });

    expect(paymentMsg).toContain('Tagihan Escrow Rekber Joki Skripsi');
    expect(paymentMsg).toContain('Rp 1.500.382');
    expect(paymentMsg).toContain('382');
    expect(paymentMsg).toContain('BCA 8801928371 a.n PT Joki Skripsi Indonesia');

    const milestoneMsg = whatsappService.formatMessage('MILESTONE_SUBMITTED', {
      projectName: 'Skripsi Akuntansi Perpajakan',
      milestoneTitle: 'Bab 1: Pendahuluan',
      plagiarismScore: '14%',
    });

    expect(milestoneMsg).toContain('Bab 1: Pendahuluan');
    expect(milestoneMsg).toContain('14%');
    expect(milestoneMsg).toContain('Turnitin Anti-Plagiarism Lock');
  });

  test('TC-NOTIF-02: Normalizes Indonesian phone numbers (08xx -> 628xx)', () => {
    expect(whatsappService.normalizePhone('081234567890')).toBe('6281234567890');
    expect(whatsappService.normalizePhone('+6281234567890')).toBe('6281234567890');
    expect(whatsappService.normalizePhone('6281234567890')).toBe('6281234567890');
  });

  test('TC-NOTIF-03: Enforces message idempotency to avoid duplicate transactional messages', async () => {
    const idempotencyKey = 'payment-bill-proj-12345';
    
    // First dispatch
    const res1 = await whatsappService.sendTransactionalMessage({
      phone: '081234567890',
      eventType: 'PAYMENT_RECEIVED',
      data: {
        projectName: 'Analisis Multivariate',
        amount: 'Rp 2.000.123',
        uniqueCode: '123',
      },
      idempotencyKey,
    });
    expect(res1.success).toBe(true);

    // Second dispatch with same idempotency key must be recognized as duplicate
    const res2 = await whatsappService.sendTransactionalMessage({
      phone: '081234567890',
      eventType: 'PAYMENT_RECEIVED',
      data: {
        projectName: 'Analisis Multivariate',
        amount: 'Rp 2.000.123',
        uniqueCode: '123',
      },
      idempotencyKey,
    });
    expect(res2.success).toBe(true);
    expect(res2.messageId).toContain('cached-');
  });
});
