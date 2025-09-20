export interface TutorRequest {
  message: string;
  code?: string;
  action?: 'chat' | 'run' | 'explain';
}

export interface TutorResponse {
  reply: string;
  steps: string[];
  question: string;
  received: {
    hasCode: boolean;
    len: number;
  };
}

export interface TutorUsage {
  totalRequests: number;
  uptime: string;
  lastRequest?: string;
}