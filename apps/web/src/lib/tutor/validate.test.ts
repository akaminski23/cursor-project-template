import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE_LENGTH, coerceString, validateTutorRequest } from './validate';

describe('coerceString', () => {
  it('returns trimmed string input', () => {
    expect(coerceString('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string values', () => {
    expect(coerceString(undefined)).toBe('');
    expect(coerceString(123)).toBe('');
  });
});

describe('validateTutorRequest', () => {
  it('throws when message is empty', () => {
    expect(() => validateTutorRequest({ message: '   ' })).toThrow('Message is required.');
  });

  it('throws when message exceeds allowed length', () => {
    expect(() => validateTutorRequest({ message: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) })).toThrow(
      `Message must be less than or equal to ${MAX_MESSAGE_LENGTH} characters.`
    );
  });

  it('returns sanitized payload for valid input', () => {
    const payload = validateTutorRequest({ message: '  hello tutor  ', code: '  const x = 1;  ' });
    expect(payload).toEqual({ message: 'hello tutor', code: 'const x = 1;' });
  });
});
