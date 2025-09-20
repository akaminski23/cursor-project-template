'use client';

import { useCallback, useState } from 'react';
import type { TutorExplainPayload, TutorExplainRequestBody } from '../lib/core';
import type { ChatMessage } from '../lib/ui';

interface SendPromptArgs extends TutorExplainRequestBody {}

interface UseTutorChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  sendPrompt: (args: SendPromptArgs) => Promise<TutorExplainPayload | undefined>;
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
      const response = await fetch('/api/tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      if (!response.ok) {
        throw new Error('Failed to reach tutor endpoint.');
      }
      const payload = (await response.json()) as TutorExplainPayload;
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

function formatAssistantContent(payload: TutorExplainPayload) {
  const parts = [payload.summary];

  if (payload.lineByLine && payload.lineByLine.length > 0) {
    parts.push('');
    parts.push(...payload.lineByLine);
  }

  return parts.join('\n');
}


function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
