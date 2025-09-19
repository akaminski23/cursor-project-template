import { create } from 'zustand';
import type { CheckpointStatus } from '@prisma/client';

export interface CheckpointState {
  id: string;
  conceptSlug: string;
  status: CheckpointStatus;
  updatedAt: string;
}

export interface ProgressStoreState {
  checkpoints: CheckpointState[];
  setCheckpoints: (items: CheckpointState[]) => void;
  upsertCheckpoint: (item: CheckpointState) => void;
  clear: () => void;
}

/**
 * Simple Zustand store for local progress snapshotting.
 */
export const useProgressStore = create<ProgressStoreState>((set) => ({
  checkpoints: [],
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
  clear: () => set({ checkpoints: [] })
}));
