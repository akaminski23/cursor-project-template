import { describe, expect, it, vi } from 'vitest';
import type { CheckpointStatus, PrismaClient } from '@prisma/client';
import { ProgressService } from '../ProgressService';

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User'
};

const baseConcept = {
  id: 'concept-1',
  slug: 'algebra-basics',
  title: 'Algebra Basics',
  description: 'Intro'
};

const now = new Date();
const inProgress: CheckpointStatus = 'IN_PROGRESS';

const prismaMock: Partial<PrismaClient> = {
  user: {
    upsert: vi.fn().mockResolvedValue(baseUser),
    findUnique: vi.fn().mockResolvedValue({
      ...baseUser,
      checkpoints: [
        {
          id: 'checkpoint-1',
          concept: { slug: baseConcept.slug },
          userId: baseUser.id,
          createdAt: now,
          updatedAt: now,
          status: inProgress
        }
      ]
    })
  },
  concept: {
    upsert: vi.fn().mockResolvedValue(baseConcept),
    findUnique: vi.fn().mockResolvedValue(baseConcept)
  },
  checkpoint: {
    create: vi.fn().mockResolvedValue({ id: 'checkpoint-1' })
  },
  session: {
    create: vi.fn().mockResolvedValue({ id: 'session-1', userId: baseUser.id, conceptId: baseConcept.id }),
    update: vi.fn()
  }
};

describe('ProgressService typing', () => {
  it('accepts valid user and concept inputs', async () => {
    const service = new ProgressService(prismaMock as PrismaClient);

    await service.recordCheckpoint({
      userEmail: baseUser.email,
      userName: baseUser.name,
      concept: {
        slug: baseConcept.slug,
        title: baseConcept.title,
        description: baseConcept.description
      },
      status: inProgress
    });

    const summary = await service.getUserSummary(baseUser.email);
    expect(summary.checkpoints[0]?.conceptSlug).toBe(baseConcept.slug);
  });
});
