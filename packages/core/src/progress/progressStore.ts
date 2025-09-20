import { create } from 'zustand';
import type { CheckpointStatus } from '@prisma/client';

export interface CheckpointState {
  id: string;
  conceptSlug: string;
  status: CheckpointStatus;
  updatedAt: string;
}

export interface RecentCheckpointState {
  id: string;
  concept: string;
  createdAt: string;
}

export interface ProgressStoreState {
  checkpoints: CheckpointState[];
  recentCheckpoints: RecentCheckpointState[];
  setCheckpoints: (items: CheckpointState[]) => void;
  upsertCheckpoint: (item: CheckpointState) => void;
  setRecentCheckpoints: (items: RecentCheckpointState[]) => void;
  saveCheckpoint: (concept: string) => Promise<void>;
  loadRecentCheckpoints: (limit?: number) => Promise<void>;
  clear: () => void;
}

/**
 * Simple Zustand store for local progress snapshotting.
 */
export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  checkpoints: [],
  recentCheckpoints: [],
  setCheckpoints: (items) => set({ checkpoints: items }),
  upsertCheckpoint: (item) =>
    set((state) => {
      const existingIndex = state.checkpoints.findIndex((checkpoint) => checkpoint.id === item.id);
      if (existingIndex >= 0) {
        const next = [...state.checkpoints];
        next[existingIndex] = item;
        return { checkpoints: next };
      }
      return { checkpoints: [item, ...state.checkpoints] };
    }),
  setRecentCheckpoints: (items) => set({ recentCheckpoints: items }),
  saveCheckpoint: async (concept: string) => {
    const response = await fetch('/api/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    });

    if (!response.ok) {
      throw new Error('Failed to save checkpoint');
    }

    const saved: RecentCheckpointState = await response.json();
    const current = get().recentCheckpoints;
    set({ recentCheckpoints: [saved, ...current].slice(0, 5) });
  },
  loadRecentCheckpoints: async (limit = 5) => {
    const response = await fetch(`/api/checkpoint?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to load checkpoints');
    }
    const recent: RecentCheckpointState[] = await response.json();
    set({ recentCheckpoints: recent });
  },
  clear: () => set({ checkpoints: [], recentCheckpoints: [] })
}));
