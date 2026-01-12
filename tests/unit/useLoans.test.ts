import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLoans } from '@/composables/useLoans';

// Mock useAuth0 composable
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: { value: true },
    getAccessTokenSilently: vi.fn().mockResolvedValue('dummy-token'),
  }),
}));

// Mock fetch
const mockLoans = {
  data: [
    {
      id: '1',
      deviceId: '1',
      deviceName: 'Device 1',
      loanStartDate: '2026-01-01',
      loanDueDate: '2026-01-03',
      user: 'test@example.com',
    },
  ],
};
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => mockLoans,
});

describe('useLoans', () => {
  beforeEach(() => {
    (globalThis.fetch as any).mockClear();
  });

  it('fetches loans and sets state', async () => {
    const { loans, loading, error, fetchLoans } = useLoans();
    await fetchLoans();
    expect(loans.value).toEqual(mockLoans.data);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });
});
