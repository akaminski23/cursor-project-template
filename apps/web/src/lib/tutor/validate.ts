import type { TutorRequestBody } from './types';

export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Trim a possible string input and coerce non-strings to an empty string.
 */
export function coerceString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

/**
 * Validate the shape of the request body coming from the tutor API.
 */
export function validateTutorRequest(input: unknown): TutorRequestBody {
  const candidate = (typeof input === 'object' && input !== null ? input : {}) as Partial<
    Record<'message' | 'code', unknown>
  >;

  const message = coerceString(candidate.message);
  if (!message) {
    throw new Error('Message is required.');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be less than or equal to ${MAX_MESSAGE_LENGTH} characters.`);
  }

  const codeValue = coerceString(candidate.code);
  const code = codeValue ? codeValue : undefined;

  return {
    message,
    code
  };
}
