/**
 * WhatsApp Notification Service (Wablas API Integration)
 * Strict Server-Side Only Execution
 */

export interface WhatsAppNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// In-memory log of sent notifications to prevent duplicates
const sentNotificationKeys = new Set<string>();

export async function sendWhatsAppMessage(
  recipientPhone: string,
  message: string,
  idempotencyKey?: string
): Promise<WhatsAppNotificationResult> {
  const apiKey = process.env.WABLAS_API_KEY;
  const domain = process.env.WABLAS_DOMAIN || 'https://jogja.wablas.com';

  // 1. Deduplication check
  if (idempotencyKey) {
    if (sentNotificationKeys.has(idempotencyKey)) {
      return { success: true, messageId: 'duplicate_skipped' };
    }
    sentNotificationKeys.add(idempotencyKey);
  }

  // 2. Format Indonesian phone number to international format (628xxx)
  let cleanPhone = recipientPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
  if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

  // 3. Fallback / Mock mode when API key is not configured or in testing
  if (!apiKey || apiKey.includes('dummy') || apiKey.includes('your-')) {
    console.log(`[Wablas WhatsApp Mock] To: ${cleanPhone} | Message: ${message}`);
    return { success: true, messageId: `mock-wa-${Date.now()}` };
  }

  // 4. Production API Request
  try {
    const response = await fetch(`${domain}/api/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message: message,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      return {
        success: false,
        error: data.message || 'Gagal mengirim pesan WhatsApp via Wablas',
      };
    }

    return { success: true, messageId: data.data?.id || `wa-${Date.now()}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan Wablas';
    console.error('[Wablas Error]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ==========================================
// TRANSACTIONAL EVENT TEMPLATES
// ==========================================

export async function notifyNewBid(
  phone: string,
  buyerName: string,
  projectTitle: string,
  bidAmount: number,
  projectId: string
) {
  const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bidAmount);
  const message = `🔔 *PENAMPILAN BARU MASUK*\n\nHalo ${buyerName},\n\nKabar baik! Ada penawaran rahasia (Blind Bid) baru sejumlah *${formattedAmount}* masuk untuk skripsi Anda:\n"${projectTitle}"\n\nBuka platform untuk melihat profil dan proposal joki:\nhttps://jokiskripsi.com/buyer/projects/${projectId}\n\n_Safe-Haven Academic Ecosystem_`;
  
  return sendWhatsAppMessage(phone, message, `bid-${projectId}-${Date.now()}`);
}

export async function notifyPaymentVerified(
  phone: string,
  jokiName: string,
  milestoneTitle: string,
  projectId: string
) {
  const message = `✅ *DANA REKBER DITERIMA (HELD)*\n\nHalo ${jokiName},\n\nMahasiswa telah menyelesaikan transfer deposit untuk:\n*${milestoneTitle}*\n\nStatus dana telah *DIAMANKAN DI REKBER PLATFORM (HELD)*. Anda dipersilakan memulai pengerjaan bab ini dengan tenang.\n\nRuang kerja & chat:\nhttps://jokiskripsi.com/shared/chat/${projectId}\n\n_PT Joki Skripsi Indonesia_`;

  return sendWhatsAppMessage(phone, message, `pay-${projectId}-${Date.now()}`);
}

export async function notifyMilestoneSubmitted(
  phone: string,
  buyerName: string,
  milestoneTitle: string,
  similarity: number,
  projectId: string
) {
  const message = `📑 *DRAF BAB & TURNITIN SELESAI*\n\nHalo ${buyerName},\n\nKonsultan joki telah menyerahkan draf pengerjaan untuk:\n*${milestoneTitle}*\nLaporan Turnitin: *${similarity}% Similarity*\n\nAnda memiliki waktu *3x24 Jam* untuk meninjau atau meminta revisi sebelum dana dicairkan otomatis:\nhttps://jokiskripsi.com/buyer/projects/${projectId}/milestones\n\n_Joki Skripsi Safe-Haven_`;

  return sendWhatsAppMessage(phone, message, `mile-sub-${projectId}-${Date.now()}`);
}

export async function notifyMilestoneEscalation(
  phone: string,
  buyerName: string,
  milestoneTitle: string,
  remainingHours: number,
  projectId: string
) {
  const message = `⚠️ *PERINGATAN BATAS REVIEW*\n\nHalo ${buyerName},\n\nWaktu peninjauan serahan *${milestoneTitle}* tersisa *${remainingHours} jam lagi*.\n\nJika tidak ada respons persetujuan atau revisi, sistem akan mengalihkan transaksi ke arbitrase mediasi admin untuk melindungi kepastian pencairan.\n\nhttps://jokiskripsi.com/buyer/projects/${projectId}/milestones`;

  return sendWhatsAppMessage(phone, message, `escala-${projectId}-${Date.now()}`);
}

export async function notifyDisputeOpened(
  phone: string,
  recipientName: string,
  projectTitle: string,
  reason: string,
  disputeId: string
) {
  const message = `⚖️ *TIKET SENGKETA AKTIF (#${disputeId})*\n\nHalo ${recipientName},\n\nTiket sengketa telah dibuka untuk proyek:\n"${projectTitle}"\nAlasan: *${reason}*\n\nDana di rekening penampungan rekber telah dibekukan (FROZEN). Tim mediasi admin akan meninjau bukti dan memutuskan penyelesaian dalam < 48 jam.`;

  return sendWhatsAppMessage(phone, message, `disp-${disputeId}`);
}

// ==========================================
// WHATSAPP SERVICE WRAPPER
// ==========================================

export const whatsappService = {
  normalizePhone(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;
    return clean;
  },

  formatMessage(eventType: string, data: Record<string, string>): string {
    switch (eventType) {
      case 'PAYMENT_RECEIVED':
        return `💳 *Tagihan Escrow Rekber Joki Skripsi*\n\nProyek: ${data.projectName}\nTotal: ${data.amount} (Termasuk kode unik ${data.uniqueCode})\nRekening: BCA 8801928371 a.n PT Joki Skripsi Indonesia\n\nHarap transfer sesuai nominal tepat.`;
      case 'MILESTONE_SUBMITTED':
        return `📑 *Draf & Turnitin Diajukan*\n\nProyek: ${data.projectName}\nMilestone: ${data.milestoneTitle}\nSkor Turnitin: ${data.plagiarismScore}\n\nTurnitin Anti-Plagiarism Lock lolos verifikasi. Silakan tinjau dalam 3x24 jam.`;
      default:
        return `Notifikasi Joki Skripsi untuk ${data.projectName || 'proyek Anda'}.`;
    }
  },

  async sendTransactionalMessage({
    phone,
    eventType,
    data,
    idempotencyKey,
  }: {
    phone: string;
    eventType: string;
    data: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<WhatsAppNotificationResult> {
    const cleanPhone = this.normalizePhone(phone);
    if (idempotencyKey && sentNotificationKeys.has(idempotencyKey)) {
      return { success: true, messageId: `cached-${idempotencyKey}` };
    }
    const message = this.formatMessage(eventType, data);
    return sendWhatsAppMessage(cleanPhone, message, idempotencyKey);
  },
};

