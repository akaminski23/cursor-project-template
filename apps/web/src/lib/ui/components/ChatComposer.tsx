'use client';

import { FormEvent } from 'react';
import clsx from 'clsx';

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending?: boolean;
  placeholder?: string;
}

/**
 * Simple chat composer for text input only.
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending = false,
  placeholder = 'Ask the AI tutor about your code...'
}: ChatComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || isSending) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur"
    >
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[140px] w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSending}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:bg-blue-800"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
