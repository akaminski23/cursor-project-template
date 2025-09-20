export interface TutorRequestBody {
  /**
   * Natural language message from the user.
   */
  message: string;
  /**
   * Optional source code snippet to give the tutor more context.
   */
  code?: string;
}

export interface TutorResponseBody {
  /**
   * Mock assistant reply rendered in the chat UI.
   */
  reply: string;
  /**
   * Actionable bullet points the tutor would highlight.
   */
  steps: string[];
  /**
   * Follow-up question to keep the session Socratic.
   */
  question: string;
  /**
   * Echo of the received input for debugging and transparency.
   */
  received: {
    message: string;
    hasCode: boolean;
  };
}

export interface TutorUsageResponse {
  description: string;
  method: 'POST';
  body: {
    message: 'string (1-2000 chars)';
    code?: 'string optional';
  };
}
