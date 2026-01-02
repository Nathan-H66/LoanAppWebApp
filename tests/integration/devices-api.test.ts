import { describe, it, expect } from 'vitest';

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:7071/api/';

describe('Devices API integration', () => {
  it('should return a list of devices', async () => {
    const res = await fetch(`${API_BASE}devices`, {
      headers: { Accept: 'application/json' },
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // Optionally check for expected device fields
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('category');
    }
  });
});
