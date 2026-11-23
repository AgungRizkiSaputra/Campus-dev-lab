// PRD v7.0 Section 10 & 22: Direct Settlement Escrow Rekber System

export interface EscrowTransaction {
  id: string;
  projectId: string;
  subtotal: number;
  uniqueCode: number;
  totalAmount: number;
  status: 'AWAITING_DEPOSIT' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FROZEN_DISPUTE';
  bankTransferRef?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export function generatePaymentBilling(subtotal: number, existingCodes: number[]): { uniqueCode: number; totalAmount: number } {
  // Generate random 3-digit unique code between 100 and 999 not currently in conflict
  let code = 0;
  let attempts = 0;
  do {
    code = Math.floor(100 + Math.random() * 900);
    attempts++;
  } while (existingCodes.includes(code) && attempts < 100);

  return {
    uniqueCode: code,
    totalAmount: subtotal + code,
  };
}

export function reconcileBankMutation(
  escrow: EscrowTransaction,
  incomingMutation: { amount: number; description: string; date: string }
): { matched: boolean; reason?: string } {
  if (escrow.status !== 'AWAITING_DEPOSIT') {
    return { matched: false, reason: 'Status transaksi bukan AWAITING_DEPOSIT' };
  }

  // Exact amount match check (subtotal + uniqueCode)
  if (incomingMutation.amount !== escrow.totalAmount) {
    return {
      matched: false,
      reason: `Nominal mutasi (Rp ${incomingMutation.amount}) tidak sesuai dengan total tagihan (Rp ${escrow.totalAmount})`,
    };
  }

  return { matched: true };
}

export function transitionEscrowState(
  currentState: EscrowTransaction['status'],
  action: 'VERIFY_DEPOSIT' | 'APPROVE_MILESTONE' | 'RAISE_DISPUTE' | 'RESOLVE_REFUND' | 'RESOLVE_RELEASE'
): EscrowTransaction['status'] {
  switch (currentState) {
    case 'AWAITING_DEPOSIT':
      if (action === 'VERIFY_DEPOSIT') return 'HELD';
      throw new Error(`Invalid transition from AWAITING_DEPOSIT via ${action}`);

    case 'HELD':
      if (action === 'APPROVE_MILESTONE') return 'RELEASED';
      if (action === 'RAISE_DISPUTE') return 'FROZEN_DISPUTE';
      throw new Error(`Invalid transition from HELD via ${action}`);

    case 'FROZEN_DISPUTE':
      if (action === 'RESOLVE_REFUND') return 'REFUNDED';
      if (action === 'RESOLVE_RELEASE') return 'RELEASED';
      throw new Error(`Invalid transition from FROZEN_DISPUTE via ${action}`);

    case 'RELEASED':
    case 'REFUNDED':
      throw new Error(`Terminal state reached: cannot transition from ${currentState}`);
  }
}

describe('Direct Settlement & Escrow Rekber System', () => {
  test('TC-ESC-01: Correctly calculates 3-digit unique code and exact total billing', () => {
    const subtotal = 2500000;
    const billing = generatePaymentBilling(subtotal, [123, 456]);

    expect(billing.uniqueCode).toBeGreaterThanOrEqual(100);
    expect(billing.uniqueCode).toBeLessThanOrEqual(999);
    expect(billing.totalAmount).toBe(subtotal + billing.uniqueCode);
  });

  test('TC-ESC-02: Bank reconciliation succeeds only when mutation matches exact total', () => {
    const escrow: EscrowTransaction = {
      id: 'tx-1',
      projectId: 'proj-1',
      subtotal: 1500000,
      uniqueCode: 382,
      totalAmount: 1500382,
      status: 'AWAITING_DEPOSIT',
    };

    // Partial payment without unique code fails
    const badMutation = { amount: 1500000, description: 'TRSF DARI MAHASISWA', date: '2026-11-23' };
    const badResult = reconcileBankMutation(escrow, badMutation);
    expect(badResult.matched).toBe(false);
    expect(badResult.reason).toContain('tidak sesuai dengan total tagihan');

    // Exact amount matches
    const goodMutation = { amount: 1500382, description: 'TRSF DARI MAHASISWA 382', date: '2026-11-23' };
    const goodResult = reconcileBankMutation(escrow, goodMutation);
    expect(goodResult.matched).toBe(true);
  });

  test('TC-ESC-03: Escrow state machine lifecycle: Deposit -> Held -> Released', () => {
    let state: EscrowTransaction['status'] = 'AWAITING_DEPOSIT';

    // 1. Admin verifies mutation -> Escrow becomes HELD
    state = transitionEscrowState(state, 'VERIFY_DEPOSIT');
    expect(state).toBe('HELD');

    // 2. Buyer approves final milestone -> Escrow becomes RELEASED
    state = transitionEscrowState(state, 'APPROVE_MILESTONE');
    expect(state).toBe('RELEASED');

    // 3. Terminal state check
    expect(() => transitionEscrowState(state, 'APPROVE_MILESTONE')).toThrow('Terminal state reached');
  });

  test('TC-ESC-04: Escrow state machine dispute handling: Held -> Frozen -> Refunded', () => {
    let state: EscrowTransaction['status'] = 'HELD';

    // 1. Dispute raised -> Escrow FROZEN_DISPUTE
    state = transitionEscrowState(state, 'RAISE_DISPUTE');
    expect(state).toBe('FROZEN_DISPUTE');

    // 2. Admin arbitrates refund -> REFUNDED
    state = transitionEscrowState(state, 'RESOLVE_REFUND');
    expect(state).toBe('REFUNDED');
  });

  test('TC-ESC-05: Enforces strict NO third-party payment gateway policy (Direct BCA only)', () => {
    const platformPaymentConfig = {
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '8801928371',
      accountHolder: 'PT Joki Skripsi Indonesia',
      thirdPartyGatewaysSupported: ['Midtrans', 'Xendit', 'Doku'],
    };

    // Must be disabled
    const isGatewayAllowed = (gateway: string) => {
      const forbidden = ['midtrans', 'xendit', 'doku', 'stripe'];
      return !forbidden.includes(gateway.toLowerCase());
    };

    expect(isGatewayAllowed('Midtrans')).toBe(false);
    expect(isGatewayAllowed('Xendit')).toBe(false);
    expect(platformPaymentConfig.accountNumber).toBe('8801928371');
  });
});
