import { z } from 'zod';

// Business rule validators according to PRD v7.0 FR-04
const bidSubmissionSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.number().positive(),
  pitch: z.string().min(20, 'Pitch minimal 20 karakter'),
  deliveryDays: z.number().int().positive(),
});

interface Project {
  id: string;
  budget: number;
  status: string;
  bidsCount: number;
}

interface Bid {
  id: string;
  projectId: string;
  sellerId: string;
  amount: number;
  pitch: string;
  deliveryDays: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

function validateBid(
  project: Project,
  sellerId: string,
  existingBids: Bid[],
  bidData: { amount: number; pitch: string; deliveryDays: number },
  recentBidsInLastHourCount: number
) {
  // 1. Zod schema validation
  const parsed = bidSubmissionSchema.safeParse({
    projectId: project.id,
    ...bidData,
  });
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0].message };
  }

  // 2. Project must be in OPEN status
  if (project.status !== 'OPEN') {
    return { valid: false, error: 'Proyek tidak lagi menerima tawaran' };
  }

  // 3. One-shot bidding: Check if seller already bid
  const hasExistingBid = existingBids.some(
    (b) => b.projectId === project.id && b.sellerId === sellerId
  );
  if (hasExistingBid) {
    return { valid: false, error: 'Anda sudah mengajukan tawaran untuk proyek ini. Blind bidding bersifat one-shot.' };
  }

  // 4. Maximum 200% budget cap
  const maxAllowedBid = project.budget * 2.0;
  if (bidData.amount > maxAllowedBid) {
    return {
      valid: false,
      error: `Tawaran melebihi batas maksimum 200% dari anggaran (Maks: Rp ${maxAllowedBid.toLocaleString('id-ID')})`,
    };
  }

  // 5. Rate limit: Max 5 bids per hour
  if (recentBidsInLastHourCount >= 5) {
    return { valid: false, error: 'Batas bidding tercapai (Maksimal 5 bidding per jam)' };
  }

  return { valid: true, error: null };
}

describe('Blind Bidding Engine (PRD v7.0 FR-04)', () => {
  const sampleProject: Project = {
    id: '11111111-1111-1111-1111-111111111111',
    budget: 1500000,
    status: 'OPEN',
    bidsCount: 2,
  };

  test('TC-BID-01: Accepts valid bid within 200% budget cap', () => {
    const result = validateBid(
      sampleProject,
      'seller-1',
      [],
      {
        amount: 2000000,
        pitch: 'Saya ahli metodologi kuantitatif dengan SPSS dan SmartPLS.',
        deliveryDays: 14,
      },
      0
    );
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('TC-BID-02: Rejects bid exceeding 200% budget cap', () => {
    const result = validateBid(
      sampleProject,
      'seller-1',
      [],
      {
        amount: 3500000, // Budget 1.5M, 200% is 3.0M
        pitch: 'Saya tawarkan paket lengkap dengan bimbingan intensif berkala.',
        deliveryDays: 14,
      },
      0
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('melebihi batas maksimum 200%');
  });

  test('TC-BID-03: Rejects duplicate bid from same seller (One-Shot Rule)', () => {
    const existingBids: Bid[] = [
      {
        id: 'bid-1',
        projectId: sampleProject.id,
        sellerId: 'seller-1',
        amount: 1500000,
        pitch: 'Tawaran pertama saya',
        deliveryDays: 10,
        status: 'PENDING',
      },
    ];

    const result = validateBid(
      sampleProject,
      'seller-1',
      existingBids,
      {
        amount: 1400000,
        pitch: 'Revisi tawaran kedua lebih murah',
        deliveryDays: 8,
      },
      1
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Blind bidding bersifat one-shot');
  });

  test('TC-BID-04: Rejects bidding when seller exceeds 5 bids per hour rate limit', () => {
    const result = validateBid(
      sampleProject,
      'seller-active',
      [],
      {
        amount: 1500000,
        pitch: 'Konsultasi bimbingan bab 1-3 terstruktur dan rapi.',
        deliveryDays: 7,
      },
      5 // Already reached 5 bids
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Maksimal 5 bidding per jam');
  });

  test('TC-BID-05: Enforces blind visibility isolation (Competitors cannot view other bids)', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        projectId: sampleProject.id,
        sellerId: 'seller-1',
        amount: 1500000,
        pitch: 'Pitch A',
        deliveryDays: 10,
        status: 'PENDING',
      },
      {
        id: 'bid-2',
        projectId: sampleProject.id,
        sellerId: 'seller-2',
        amount: 1800000,
        pitch: 'Pitch B',
        deliveryDays: 12,
        status: 'PENDING',
      },
    ];

    const filterBidsForViewer = (viewerRole: string, viewerId: string) => {
      if (viewerRole === 'buyer' || viewerRole === 'admin') {
        return bids; // Buyer & Admin see all bids
      }
      // Seller only sees their own bid
      return bids.filter((b) => b.sellerId === viewerId);
    };

    const seller1View = filterBidsForViewer('seller', 'seller-1');
    expect(seller1View.length).toBe(1);
    expect(seller1View[0].sellerId).toBe('seller-1');

    const seller2View = filterBidsForViewer('seller', 'seller-2');
    expect(seller2View.length).toBe(1);
    expect(seller2View[0].sellerId).toBe('seller-2');

    const buyerView = filterBidsForViewer('buyer', 'buyer-owner');
    expect(buyerView.length).toBe(2);
  });
});
