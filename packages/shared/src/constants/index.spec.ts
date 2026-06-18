import { ROLES, ACCOUNT_CODES, MIN_DEPOSIT_AMOUNT, MAX_DEPOSIT_AMOUNT } from './index';

describe('constants', () => {
  it('defines all system roles', () => {
    expect(ROLES.SUPER_ADMIN).toBe('super_admin');
    expect(ROLES.COLLECTOR).toBe('collector');
    expect(ROLES.CUSTOMER).toBe('customer');
  });

  it('defines chart of account codes', () => {
    expect(ACCOUNT_CODES.PLATFORM_CASH).toBe('1000');
    expect(ACCOUNT_CODES.CUSTOMER_WALLETS).toBe('1100');
  });

  it('enforces deposit limits', () => {
    expect(MIN_DEPOSIT_AMOUNT).toBeLessThan(MAX_DEPOSIT_AMOUNT);
  });
});
