interface TutorConfig {
  apiKey?: string;
  model: string;
  isMock: boolean;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_TUDOR_MODEL = process.env.AI_TUDOR_MODEL ?? 'gpt-5-tutor';

export function getTutorConfig(): TutorConfig {
  return {
    apiKey: OPENAI_API_KEY || undefined,
    model: AI_TUDOR_MODEL,
    isMock: !OPENAI_API_KEY
  };
}
