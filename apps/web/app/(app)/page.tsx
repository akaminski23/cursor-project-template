'use client';

import { useMemo, useState } from 'react';
import { ChatComposer, ChatMessageList } from '../../src/lib/ui';
import { useTutorChat } from '../../src/hooks/useTutorChat';
import { getMockUser } from '../../src/lib/auth';

export default function HomePage() {
  const user = useMemo(() => getMockUser(), []);
  const [input, setInput] = useState('');
  const { messages, isLoading, sendPrompt, error } = useTutorChat();

  const handleSend = async () => {
    if (!input.trim()) return;
    const payload = await sendPrompt({ prompt: input });
    if (payload) {
      setInput('');
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
        <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur min-h-[70vh]">
          <ChatMessageList messages={messages} className="flex-1 min-h-0" />
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            <ChatComposer
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              isSending={isLoading}
            />
            {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
