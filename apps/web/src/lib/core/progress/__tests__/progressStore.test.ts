import { afterEach, describe, expect, it } from 'vitest';
import { useProgressStore } from '../progressStore';

describe('useProgressStore', () => {
  afterEach(() => {
    useProgressStore.getState().clear();
  });

  it('sets and retrieves checkpoints', () => {
    const checkpoints = [
      { id: '1', conceptSlug: 'loops', status: 'IN_PROGRESS' as const, updatedAt: new Date().toISOString() },
      { id: '2', conceptSlug: 'arrays', status: 'PENDING' as const, updatedAt: new Date().toISOString() }
    ];
    useProgressStore.getState().setCheckpoints(checkpoints);
    expect(useProgressStore.getState().checkpoints).toHaveLength(2);
  });

  it('upserts checkpoints by id', () => {
    const initial = { id: '1', conceptSlug: 'loops', status: 'IN_PROGRESS' as const, updatedAt: new Date().toISOString() };
    useProgressStore.getState().setCheckpoints([initial]);
    useProgressStore.getState().upsertCheckpoint({
      id: '1',
      conceptSlug: 'loops',
      status: 'COMPLETED' as const,
      updatedAt: new Date().toISOString()
    });
    expect(useProgressStore.getState().checkpoints[0].status).toBe('COMPLETED');
  });
});
