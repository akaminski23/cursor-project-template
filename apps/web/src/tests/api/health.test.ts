import { describe, expect, it } from 'vitest';
import handler from '../../pages/api/health';
import { createMockRequest, createMockResponse } from './testUtils';

describe('health api route', () => {
  it('returns ok true with version and time', () => {
    const req = createMockRequest('GET');
    const res = createMockResponse<{ ok: boolean; version: string; time: string }>();

    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData?.ok).toBe(true);
    expect(res.jsonData?.version).toBeTruthy();
    expect(new Date(res.jsonData?.time ?? '').toString()).not.toBe('Invalid Date');
  });
});
