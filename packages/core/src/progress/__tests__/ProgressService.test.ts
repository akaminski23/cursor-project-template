import { describe, expect, it, vi } from 'vitest';
import type { CheckpointStatus, PrismaClient } from '@prisma/client';
import { ProgressService } from '../ProgressService.js';

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

type CheckpointWithConcept = {
  id: string;
  concept: { slug: string };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: CheckpointStatus;
};

type UserWithCheckpoints = typeof baseUser & { checkpoints: CheckpointWithConcept[] };

type UpsertUserArgs = {
  where: { email: string };
  update: { name?: string | null };
  create: { email: string; name?: string | null };
};

type FindUserArgs = {
  where: { email: string };
  include?: {
    checkpoints?: {
      orderBy?: { updatedAt?: 'asc' | 'desc' };
      take?: number;
      include?: { concept?: { select?: { slug?: boolean } } };
    };
  };
};

type UpsertConceptArgs = {
  where: { slug: string };
  update: { title: string; description?: string | null };
  create: { slug: string; title: string; description?: string | null };
};

type FindConceptArgs = { where: { slug: string } };

type CreateCheckpointArgs = {
  data?: {
    userId?: string;
    conceptId?: string;
    status?: CheckpointStatus;
    notes?: string | null;
  };
};

type CreateSessionArgs = {
  data: {
    userId: string;
    conceptId?: string | null;
  };
};

type UpdateSessionArgs = {
  where: { id: string };
  data: { endedAt: Date; transcript?: unknown };
};

interface PrismaClientMock {
  user: {
    upsert: (args: UpsertUserArgs) => Promise<typeof baseUser>;
    findUnique: (args: FindUserArgs) => Promise<UserWithCheckpoints | null>;
  };
  concept: {
    upsert: (args: UpsertConceptArgs) => Promise<typeof baseConcept>;
    findUnique: (args: FindConceptArgs) => Promise<typeof baseConcept | null>;
  };
  checkpoint: {
    create: (args: CreateCheckpointArgs) => Promise<{ id: string; userId?: string; conceptId?: string; status?: CheckpointStatus; notes?: string | null }>;
  };
  session: {
    create: (args: CreateSessionArgs) => Promise<{ id: string; userId: string; conceptId?: string | null }>;
    update: (args: UpdateSessionArgs) => Promise<{
      id: string;
      userId: string;
      conceptId: string;
      endedAt: Date;
      transcript?: unknown;
    }>;
  };
}

const now = new Date();
const inProgress: CheckpointStatus = 'IN_PROGRESS';

const checkpointRecord: CheckpointWithConcept = {
  id: 'checkpoint-1',
  concept: { slug: baseConcept.slug },
  userId: baseUser.id,
  createdAt: now,
  updatedAt: now,
  status: inProgress
};

const userWithCheckpoints: UserWithCheckpoints = {
  ...baseUser,
  checkpoints: [checkpointRecord]
};

const prismaMock = {
  user: {
    upsert: vi.fn(async (args: UpsertUserArgs) => {
      return {
        id: baseUser.id,
        email: args.where.email,
        name: args.update.name ?? args.create.name ?? baseUser.name
      };
    }),
    findUnique: vi.fn(async (args: FindUserArgs) => {
      return args.where.email === baseUser.email ? userWithCheckpoints : null;
    })
  },
  concept: {
    upsert: vi.fn(async (args: UpsertConceptArgs) => ({
      id: baseConcept.id,
      slug: args.where.slug,
      title: args.update.title ?? args.create.title,
      description: args.update.description ?? args.create.description ?? baseConcept.description
    })),
    findUnique: vi.fn(async (args: FindConceptArgs) => {
      return args.where.slug === baseConcept.slug ? baseConcept : null;
    })
  },
  checkpoint: {
    create: vi.fn(async (args: CreateCheckpointArgs) => ({
      id: 'checkpoint-1',
      ...args.data
    }))
  },
  session: {
    create: vi.fn(async (args: CreateSessionArgs) => ({
      id: 'session-1',
      userId: args.data.userId,
      conceptId: args.data.conceptId ?? null
    })),
    update: vi.fn(async (args: UpdateSessionArgs) => ({
      id: args.where.id,
      userId: baseUser.id,
      conceptId: baseConcept.id,
      endedAt: args.data.endedAt,
      transcript: args.data.transcript
    }))
  }
} satisfies PrismaClientMock;

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
