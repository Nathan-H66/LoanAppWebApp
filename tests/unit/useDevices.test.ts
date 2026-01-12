import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDevices } from '@/composables/useDevices';

// Mock useAuth0 composable
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: { value: true },
    getAccessTokenSilently: vi.fn().mockResolvedValue('dummy-token'),
  }),
}));

// Mock fetch
const mockDevices = [
  {
    id: '1',
    name: 'Device 1',
    description: 'Desc',
    category: 'Cat',
    quantity: 2,
  },
];
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => mockDevices,
  text: async () => JSON.stringify(mockDevices),
});

describe('useDevices', () => {
  beforeEach(() => {
    (globalThis.fetch as any).mockClear();
  });

  it('fetches devices and sets state', async () => {
    const { devices, loading, error, fetchDevices } = useDevices();
    await fetchDevices();
    expect(devices.value).toEqual(mockDevices);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });
});
