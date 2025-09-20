'use client';

import { useCallback, useState } from 'react';
import type { TutorRequestBody, TutorResponseBody } from '@/lib/tutor/types';
import { sendTutorMessage } from '@/lib/tutor/client';
import type { ChatMessage } from '@ai-2dor/ui';

interface SendPromptArgs extends TutorRequestBody {}

interface UseTutorChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  sendPrompt: (args: SendPromptArgs) => Promise<TutorResponseBody | undefined>;
  reset: () => void;
}

/**
 * Minimal chat controller for the mock tutor endpoint.
 */
export function useTutorChat(): UseTutorChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const reset = useCallback(() => {
    setMessages([]);
    setError(undefined);
  }, []);

  const sendPrompt = useCallback(async (args: SendPromptArgs) => {
    setIsLoading(true);
    setError(undefined);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: args.message
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const payload = await sendTutorMessage(args);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: formatAssistantContent(payload)
      };
      setMessages((prev) => [...prev, assistantMessage]);
      return payload;
    } catch (fetchError) {
      const description =
        fetchError instanceof Error ? fetchError.message : 'Unexpected error while talking to the tutor.';
      setError(description);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: description
        }
      ]);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, error, sendPrompt, reset };
}

function formatAssistantContent(payload: TutorResponseBody) {
  return [
    `**Reply**: ${payload.reply}`,
    '',
    '**Suggested steps:**',
    ...payload.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `**Socratic question**: ${payload.question}`,
    '',
    payload.received.hasCode ? '_We noticed you included code in your message._' : ''
  ]
    .filter(Boolean)
    .join('\n');
}


function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
