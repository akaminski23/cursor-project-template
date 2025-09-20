export function normalizeConceptInput(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new Error('Concept must be a string');
  }

  const value = raw.trim();
  if (!value) {
    throw new Error('Concept cannot be empty.');
  }

  return value;
}
