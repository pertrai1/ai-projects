import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('smoke test', () => {
  it('test infrastructure works', () => {
    expect(true).toBe(true);
  });
});

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });
});
