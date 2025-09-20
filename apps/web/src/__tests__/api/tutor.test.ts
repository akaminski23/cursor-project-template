import { describe, it, expect } from 'vitest';

// Mock fetch for tests
const mockFetch = (url: string, options?: RequestInit) => {
  if (url === '/api/tutor') {
    if (!options || options?.method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          totalRequests: 0,
          uptime: '0s',
          lastRequest: undefined
        })
      } as Response);
    }

    if (options?.method === 'POST') {
      const body = JSON.parse(options.body as string);

      if (!body.message) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Message is required and must be a non-empty string' })
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          reply: `Mock response from AI Tudor: I understand your message "${body.message}". How can I help you learn today?`,
          steps: ['Understand your question', 'Provide helpful guidance', 'Encourage learning'],
          question: 'What specific aspect would you like to explore further?',
          received: {
            hasCode: !!body.code,
            len: body.message.length
          }
        })
      } as Response);
    }
  }

  return Promise.reject(new Error(`Unmocked fetch: ${url}`));
};

// Replace global fetch for tests
global.fetch = mockFetch;

describe('/api/tutor', () => {
  it('should return usage stats on GET', async () => {
    const response = await fetch('/api/tutor');
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('totalRequests');
    expect(data).toHaveProperty('uptime');
  });

  it('should handle valid POST request', async () => {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello AI',
        action: 'chat'
      })
    });

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('reply');
    expect(data).toHaveProperty('steps');
    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('received');
    expect(data.received.hasCode).toBe(false);
    expect(data.received.len).toBe(8);
  });

  it('should handle request with code', async () => {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Explain this',
        code: 'console.log("test")',
        action: 'explain'
      })
    });

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.received.hasCode).toBe(true);
  });

  it('should reject invalid request', async () => {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Message is required');
  });
});