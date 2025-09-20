'use client';

import { useCallback, useState } from 'react';
import type { ChatMessage } from '@ai-2dor/ui';
import type { TutorRequest, TutorResponse } from '../lib/tutor/types';

interface SendPromptArgs {
  prompt: string;
  code?: string;
}

interface UseTutorChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  sendPrompt: (args: SendPromptArgs) => Promise<TutorResponse | undefined>;
  reset: () => void;
}

/**
 * Minimal chat controller for the explain tutor endpoint.
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
      content: args.prompt
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const request: TutorRequest = {
        message: args.prompt,
        code: args.code,
        action: 'chat'
      };

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to reach tutor endpoint.');
      }

      const payload = (await response.json()) as TutorResponse;
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

function formatAssistantContent(payload: TutorResponse) {
  return [
    payload.reply,
    '',
    payload.steps.length > 0 ? '**Steps**:' : '',
    ...payload.steps.map((step) => `- ${step}`),
    payload.steps.length > 0 ? '' : '',
    `**Question**: ${payload.question}`
  ].filter(Boolean).join('\n');
}


function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
