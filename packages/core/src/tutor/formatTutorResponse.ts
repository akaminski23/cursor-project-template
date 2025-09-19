import type { TutorExplainRequestBody, TutorExplainResponse, TutorExplainPayload } from './types.js';

export interface BuildPromptOptions {
  persona?: string;
}

/**
 * Generates the system prompt for the tutor explain endpoint.
 */
export function buildExplainPrompt(body: TutorExplainRequestBody, options: BuildPromptOptions = {}): string {
  const persona = options.persona ?? 'You are AI 2DoR, a supportive AI fitness coach who teaches programming concepts with actionable movement metaphors.';
  return [
    persona,
    'Return JSON with keys: summary, lineByLine (array), socraticQuestion, exercise.',
    'Keep responses encouraging and concise.',
    body.focus ? `Learning focus: ${body.focus}` : undefined,
    body.language ? `Respond in ${body.language}.` : undefined,
    'Content to explain:',
    body.prompt
  ]
    .filter(Boolean)
    .join('\n\n');
}

function coerceArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|\r/) // split lines
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Attempts to parse the language model output into the structured payload expected by the UI.
 */
export function formatTutorResponse(raw: string | Partial<TutorExplainResponse>): TutorExplainPayload {
  if (typeof raw === 'object' && raw !== null && 'summary' in raw) {
    return {
      summary: raw.summary ?? '',
      lineByLine: coerceArray(raw.lineByLine),
      socraticQuestion: raw.socraticQuestion ?? '',
      exercise: raw.exercise ?? '',
      raw: JSON.stringify(raw)
    };
  }

  let parsed: Partial<TutorExplainResponse> | undefined;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as TutorExplainResponse;
    } catch (error) {
      const fallbackLines = coerceArray(raw);
      return {
        summary: fallbackLines[0] ?? '',
        lineByLine: fallbackLines.slice(1),
        socraticQuestion: 'What part of the code feels least clear right now?',
        exercise: 'Implement a tiny variation of the code and describe what changed.',
        raw
      };
    }
  }

  return {
    summary: parsed?.summary ?? '',
    lineByLine: coerceArray(parsed?.lineByLine),
    socraticQuestion: parsed?.socraticQuestion ?? '',
    exercise: parsed?.exercise ?? '',
    raw: typeof raw === 'string' ? raw : JSON.stringify(raw)
  };
}

/**
 * Provides a predictable mock payload when the OpenAI key is not configured.
 */
export function createMockTutorResponse(prompt: string): TutorExplainPayload {
  const lines = prompt.split('\n').filter(Boolean);
  const summary = lines[0]?.slice(0, 120) ?? 'Let\'s explore your code together!';
  return {
    summary,
    lineByLine: lines.slice(0, 5).map((line, index) => `Line ${index + 1}: ${line}`),
    socraticQuestion: 'Which line in your code best expresses the main idea?',
    exercise: 'Refactor one function to improve clarity, then explain your change in two sentences.',
    raw: JSON.stringify({ prompt })
  };
}
