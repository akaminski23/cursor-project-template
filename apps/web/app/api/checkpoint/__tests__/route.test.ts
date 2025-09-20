import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route.js';

const userUpsert = vi.fn();
const checkpointCreate = vi.fn();

vi.mock('@/src/server/prismaClient.js', () => ({
  getPrismaClient: () => ({
    user: { upsert: userUpsert },
    checkpoint: {
      create: checkpointCreate,
      findMany: vi.fn()
    }
  })
}));

describe('POST /api/checkpoint', () => {
  beforeEach(() => {
    userUpsert.mockReset();
    checkpointCreate.mockReset();
  });

  it('returns 400 when concept is missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
  });

  it('returns 200 when concept is provided', async () => {
    const createdAt = new Date('2024-05-01T00:00:00.000Z');
    checkpointCreate.mockResolvedValue({
      id: '1',
      concept: 'arrays',
      createdAt
    });

    const response = await POST(
      new Request('http://localhost/api/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: 'arrays' })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: '1',
      concept: 'arrays',
      createdAt: createdAt.toISOString()
    });
  });
});
