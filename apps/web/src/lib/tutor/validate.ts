import type { TutorRequest } from './types';

export function validateTutorRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: TutorRequest
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const req = body as Record<string, unknown>;

  if (!req.message || typeof req.message !== 'string' || !req.message.trim()) {
    return { valid: false, error: 'Message is required and must be a non-empty string' };
  }

  if (req.code !== undefined && typeof req.code !== 'string') {
    return { valid: false, error: 'Code must be a string if provided' };
  }

  if (req.action !== undefined && !['chat', 'run', 'explain'].includes(req.action as string)) {
    return { valid: false, error: 'Action must be one of: chat, run, explain' };
  }

  return {
    valid: true,
    data: {
      message: req.message as string,
      code: req.code as string | undefined,
      action: (req.action as 'chat' | 'run' | 'explain') || 'chat'
    }
  };
}