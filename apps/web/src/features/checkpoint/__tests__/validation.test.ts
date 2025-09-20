import { describe, expect, it } from 'vitest';
import { normalizeConceptInput } from '../validation.js';

describe('normalizeConceptInput', () => {
  it('trims whitespace', () => {
    expect(normalizeConceptInput('  arrays  ')).toBe('arrays');
  });

  it('throws for empty strings', () => {
    expect(() => normalizeConceptInput('   ')).toThrow('Concept cannot be empty.');
  });

  it('throws when not a string', () => {
    expect(() => normalizeConceptInput(null)).toThrow('Concept must be a string');
  });
});
