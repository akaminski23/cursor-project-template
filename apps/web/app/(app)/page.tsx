'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatComposer, ChatMessageList } from '@ai-2dor/ui';
import { useSpeechRecognition, useSpeechSynthesis } from '@ai-2dor/core';
import { useTutorChat } from '@/hooks/useTutorChat';
import { getMockUser } from '@/lib/auth';

export default function HomePage() {
  const user = useMemo(() => getMockUser(), []);
  const [input, setInput] = useState('');
  const { messages, isLoading, sendPrompt, error } = useTutorChat();
  const speechRecognition = useSpeechRecognition({
    onResult: (transcript) => setInput(transcript)
  });
  const speechSynthesis = useSpeechSynthesis({ lang: 'en-US', rate: 1 });
  const lastSpokenId = useRef<string | null>(null);

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (lastAssistant && speechSynthesis.supported && lastSpokenId.current !== lastAssistant.id) {
      speechSynthesis.speak(lastAssistant.content.replace(/\*\*/g, ''));
      lastSpokenId.current = lastAssistant.id;
    }
  }, [messages, speechSynthesis, lastSpokenId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const payload = await sendPrompt({ prompt: input });
    if (payload) {
      setInput('');
    }
  };

  const toggleVoice = () => {
    if (!speechRecognition.supported) return;
    if (speechRecognition.isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <section className="w-full max-w-5xl space-y-4">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-slate-400">Signed in as {user.email} (mocked)</p>
          <h1 className="text-3xl font-semibold">AI 2DoR – AI Code Tutor</h1>
          <p className="text-sm text-slate-400">
            Paste code, receive structured breakdowns, and stay active with fitness inspired nudges.
          </p>
        </header>
        <div className="flex h-[60vh] flex-col rounded-3xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur">
          <ChatMessageList messages={messages} className="max-h-[calc(60vh-200px)]" />
          <div className="border-t border-slate-800 p-4">
            <ChatComposer
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              isSending={isLoading}
              onVoiceToggle={speechRecognition.supported ? toggleVoice : undefined}
              isListening={speechRecognition.isListening}
            />
            {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
            {!speechRecognition.supported ? (
              <p className="mt-2 text-xs text-slate-500">Speech recognition not available in this browser.</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
