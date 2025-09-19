export interface TutorExplainRequestBody {
  prompt: string;
  language?: string;
  focus?: string;
}

export interface TutorExplainResponse {
  summary: string;
  lineByLine: string[];
  socraticQuestion: string;
  exercise: string;
}

export interface TutorExplainPayload extends TutorExplainResponse {
  raw: string;
}
