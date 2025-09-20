import { describe, expect, it } from 'vitest';
import handler from '../../pages/api/tutor';
import type { TutorResponseBody, TutorUsageResponse } from '@/lib/tutor/types';
import { createMockRequest, createMockResponse } from './testUtils';

describe('tutor api route', () => {
  it('returns usage information for GET requests', () => {
    const req = createMockRequest('GET');
    const res = createMockResponse<TutorUsageResponse>();

    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData).toMatchObject({ method: 'POST' });
    expect(res.headers['X-AI-Tudor-Mode']).toBe('mock');
  });

  it('rejects invalid request bodies', () => {
    const req = createMockRequest('POST', { message: '   ' });
    const res = createMockResponse<{ error: string }>();

    handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData?.error).toContain('Message is required');
  });

  it('returns mock response for valid messages', () => {
    const req = createMockRequest('POST', { message: 'Explain closures' });
    const res = createMockResponse<TutorResponseBody>();

    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData).toMatchObject({
      reply: 'Mock response from AI Tudor',
      question: expect.stringContaining('step')
    });
    expect(res.jsonData?.received).toEqual({ message: 'Explain closures', hasCode: false });
    expect(res.headers['X-AI-Tudor-Mode']).toBe('mock');
  });
});
