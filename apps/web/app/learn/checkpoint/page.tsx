'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useProgressStore } from '@ai-2dor/core';
import { normalizeConceptInput } from '@/src/features/checkpoint/validation.js';

export default function CheckpointPage() {
  const recentCheckpoints = useProgressStore((state) => state.recentCheckpoints);
  const saveCheckpoint = useProgressStore((state) => state.saveCheckpoint);
  const loadRecentCheckpoints = useProgressStore((state) => state.loadRecentCheckpoints);

  const [concept, setConcept] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRecentCheckpoints().catch(() => {
      setErrorMessage('Unable to load checkpoints.');
    });
  }, [loadRecentCheckpoints]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    let normalized: string;
    try {
      normalized = normalizeConceptInput(concept);
    } catch (error) {
      setErrorMessage('Please name the concept before saving.');
      return;
    }

    try {
      setIsSaving(true);
      await saveCheckpoint(normalized);
      setConcept('');
      setStatusMessage(`Saved checkpoint for “${normalized}”.`);
    } catch (error) {
      setErrorMessage('Unable to save checkpoint. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const checkpointsToDisplay = useMemo(
    () =>
      recentCheckpoints.map((item) => ({
        ...item,
        formattedDate: new Date(item.createdAt).toLocaleString()
      })),
    [recentCheckpoints]
  );

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Concept checkpoint</h1>
        <p className="mb-6 text-sm text-neutral-600">
          Save a quick note each time you feel steady with a concept. We&apos;ll keep the last five.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="concept">
            Concept
            <input
              id="concept"
              name="concept"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. fractions"
              aria-describedby="concept-helper"
            />
          </label>
          <span id="concept-helper" className="text-xs text-neutral-500">
            Short and clear works best aloud.
          </span>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save checkpoint'}
          </button>
        </form>
        {statusMessage ? (
          <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {statusMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent checkpoints</h2>
        {checkpointsToDisplay.length === 0 ? (
          <p className="text-sm text-neutral-600">No checkpoints saved yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {checkpointsToDisplay.map((checkpoint) => (
              <li key={checkpoint.id} className="rounded border border-neutral-200 px-3 py-2">
                <p className="text-base font-medium">{checkpoint.concept}</p>
                <p className="text-xs text-neutral-500">Saved {checkpoint.formattedDate}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
