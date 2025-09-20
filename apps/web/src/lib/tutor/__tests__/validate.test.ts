import { describe, it, expect } from 'vitest';
import { validateTutorRequest } from '../validate';

describe('validateTutorRequest', () => {
  it('should validate valid request', () => {
    const result = validateTutorRequest({
      message: 'Hello AI',
      code: 'console.log("test")',
      action: 'chat'
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      message: 'Hello AI',
      code: 'console.log("test")',
      action: 'chat'
    });
  });

  it('should require message', () => {
    const result = validateTutorRequest({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Message is required');
  });

  it('should reject empty message', () => {
    const result = validateTutorRequest({ message: '   ' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Message is required');
  });

  it('should default action to chat', () => {
    const result = validateTutorRequest({ message: 'test' });
    expect(result.valid).toBe(true);
    expect(result.data?.action).toBe('chat');
  });

  it('should reject invalid action', () => {
    const result = validateTutorRequest({
      message: 'test',
      action: 'invalid'
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Action must be one of');
  });

  it('should validate without code', () => {
    const result = validateTutorRequest({ message: 'test' });
    expect(result.valid).toBe(true);
    expect(result.data?.code).toBeUndefined();
  });
});