import { describe, expect, it } from 'vitest';
import { buildExplainPrompt, createMockTutorResponse, formatTutorResponse } from '../formatTutorResponse';
import type { TutorExplainRequestBody } from '../types';

describe('formatTutorResponse', () => {
  it('parses valid JSON payloads', () => {
    const payload = formatTutorResponse(
      JSON.stringify({
        summary: 'Explains the loop.',
        lineByLine: ['Line 1', 'Line 2'],
        socraticQuestion: 'Why loop?',
        exercise: 'Do push ups.'
      })
    );

    expect(payload.summary).toBe('Explains the loop.');
    expect(payload.lineByLine).toHaveLength(2);
    expect(payload.socraticQuestion).toContain('Why');
    expect(payload.exercise).toContain('push');
  });

  it('falls back to parsed lines when JSON parsing fails', () => {
    const payload = formatTutorResponse('Summary\nLine1\nLine2');
    expect(payload.summary).toBe('Summary');
    expect(payload.lineByLine).toEqual(['Line1', 'Line2']);
    expect(payload.socraticQuestion).toContain('?');
  });
});

describe('buildExplainPrompt', () => {
  it('includes persona cues and prompt text', () => {
    const body: TutorExplainRequestBody = { prompt: 'function test() {}', language: 'en', focus: 'loops' };
    const prompt = buildExplainPrompt(body);
    expect(prompt).toContain('AI 2DoR');
    expect(prompt).toContain('loops');
    expect(prompt).toContain(body.prompt);
  });
});

describe('createMockTutorResponse', () => {
  it('produces deterministic summaries', () => {
    const mock = createMockTutorResponse('console.log("hi")');
    expect(mock.summary).toContain('console.log');
    expect(mock.lineByLine.length).toBeGreaterThan(0);
  });
});
