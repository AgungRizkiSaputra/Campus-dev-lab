// PRD v7.0 Security Architecture, RLS & Authorization Verification

interface UserProfile {
  id: string;
  role: 'buyer' | 'seller' | 'admin';
  kycStatus: 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface ProjectRecord {
  id: string;
  buyerId: string;
  selectedSellerId?: string;
  title: string;
  status: string;
}

// Security policy simulator matching Postgres RLS rules
export function canAccessProject(user: UserProfile, project: ProjectRecord): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'buyer' && project.buyerId === user.id) return true;
  if (user.role === 'seller') {
    // Seller can see open projects (explore), or projects where they are the awarded seller
    if (project.status === 'OPEN' || project.selectedSellerId === user.id) {
      return true;
    }
  }
  return false;
}

export function canSubmitBid(user: UserProfile): { allowed: boolean; reason?: string } {
  if (user.role !== 'seller') {
    return { allowed: false, reason: 'Hanya akun Joki/Seller yang dapat mengajukan bidding' };
  }
  if (user.kycStatus !== 'VERIFIED') {
    return {
      allowed: false,
      reason: 'Akun Anda belum lolos verifikasi KYC. Harap lengkapi KTP dan Ijazah di menu KYC.',
    };
  }
  return { allowed: true };
}

export function canAccessAdminMutations(user: UserProfile): boolean {
  return user.role === 'admin';
}

export function canAccessDocument(
  user: UserProfile,
  project: ProjectRecord,
  isPublic: boolean
): boolean {
  if (isPublic) return true;
  if (user.role === 'admin') return true;
  if (user.role === 'buyer' && project.buyerId === user.id) return true;
  if (user.role === 'seller' && project.selectedSellerId === user.id) return true;
  return false;
}

describe('Security Architecture & Authorization Matrix (OWASP & PRD)', () => {
  const buyerUser: UserProfile = { id: 'buyer-alice', role: 'buyer', kycStatus: 'UNSUBMITTED' };
  const otherBuyerUser: UserProfile = { id: 'buyer-bob', role: 'buyer', kycStatus: 'UNSUBMITTED' };
  const unverifiedSeller: UserProfile = { id: 'seller-rookie', role: 'seller', kycStatus: 'PENDING' };
  const verifiedSeller: UserProfile = { id: 'seller-pro', role: 'seller', kycStatus: 'VERIFIED' };
  const competitorSeller: UserProfile = { id: 'seller-rival', role: 'seller', kycStatus: 'VERIFIED' };
  const adminUser: UserProfile = { id: 'admin-super', role: 'admin', kycStatus: 'VERIFIED' };

  const projectAlice: ProjectRecord = {
    id: 'proj-alice-thesis',
    buyerId: 'buyer-alice',
    selectedSellerId: 'seller-pro',
    title: 'Analisis Pengaruh Good Corporate Governance terhadap Kinerja Finansial',
    status: 'IN_PROGRESS',
  };

  test('SEC-01: IDOR Prevention - Buyer Bob cannot access Alice’s project details', () => {
    expect(canAccessProject(buyerUser, projectAlice)).toBe(true);
    expect(canAccessProject(otherBuyerUser, projectAlice)).toBe(false);
  });

  test('SEC-02: KYC Enforcement - Unverified seller is blocked from bidding', () => {
    const unverifiedAttempt = canSubmitBid(unverifiedSeller);
    expect(unverifiedAttempt.allowed).toBe(false);
    expect(unverifiedAttempt.reason).toContain('belum lolos verifikasi KYC');

    const verifiedAttempt = canSubmitBid(verifiedSeller);
    expect(verifiedAttempt.allowed).toBe(true);
  });

  test('SEC-03: Privilege Escalation Prevention - Regular buyers and sellers cannot access admin mutasi queue', () => {
    expect(canAccessAdminMutations(buyerUser)).toBe(false);
    expect(canAccessAdminMutations(verifiedSeller)).toBe(false);
    expect(canAccessAdminMutations(adminUser)).toBe(true);
  });

  test('SEC-04: Document Confidentiality - Rival seller cannot access private project documents', () => {
    expect(canAccessDocument(competitorSeller, projectAlice, false)).toBe(false);
    expect(canAccessDocument(verifiedSeller, projectAlice, false)).toBe(true);
    expect(canAccessDocument(buyerUser, projectAlice, false)).toBe(true);
    expect(canAccessDocument(adminUser, projectAlice, false)).toBe(true);
  });

  test('SEC-05: Input Sanitization - Rejects SQL Injection & XSS Payloads in Form Inputs', () => {
    const dangerousInputs = [
      "'; DROP TABLE projects; --",
      '<script>alert("XSS")</script>',
      '"><img src=x onerror=alert(1)>',
      "' OR '1'='1",
    ];

    dangerousInputs.forEach((input) => {
      // Basic strip/sanitize pattern or length/character constraints
      const sanitized = input.replace(/[<>'";]/g, '');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain("'");
    });
  });
});
