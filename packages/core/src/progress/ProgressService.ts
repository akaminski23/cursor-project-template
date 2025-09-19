import { CheckpointStatus, PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../utils/prismaClient.js';

const DEFAULT_STATUS: CheckpointStatus = 'IN_PROGRESS';

export interface EnsureConceptInput {
  slug: string;
  title: string;
  description?: string;
}

export interface RecordCheckpointInput {
  userEmail: string;
  userName?: string;
  concept: EnsureConceptInput;
  status?: CheckpointStatus;
  notes?: string;
}

export interface StartSessionInput {
  userEmail: string;
  conceptSlug?: string;
}

export interface EndSessionInput {
  sessionId: string;
  transcript?: unknown;
}

export interface ProgressSummary {
  checkpoints: Array<{
    id: string;
    conceptSlug: string;
    status: CheckpointStatus;
    updatedAt: Date;
  }>;
}

/**
 * Thin service wrapping common Prisma interactions for the tutor progress tracking domain.
 */
export class ProgressService {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = getPrismaClient()) {
    this.prisma = prismaClient;
  }

  /** Ensures a user record exists for the given email. */
  async ensureUser(email: string, name?: string) {
    return this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name }
    });
  }

  /** Ensures a concept record exists and returns it. */
  async ensureConcept(input: EnsureConceptInput) {
    return this.prisma.concept.upsert({
      where: { slug: input.slug },
      update: { title: input.title, description: input.description },
      create: { slug: input.slug, title: input.title, description: input.description }
    });
  }

  /** Records a checkpoint update for a user and concept. */
  async recordCheckpoint(input: RecordCheckpointInput) {
    const user = await this.ensureUser(input.userEmail, input.userName);
    const concept = await this.ensureConcept(input.concept);
    return this.prisma.checkpoint.create({
      data: {
        userId: user.id,
        conceptId: concept.id,
        status: input.status ?? DEFAULT_STATUS,
        notes: input.notes
      }
    });
  }

  /** Returns a lightweight summary of the latest checkpoint states for a user. */
  async getUserSummary(email: string): Promise<ProgressSummary> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        checkpoints: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: { concept: { select: { slug: true } } }
        }
      }
    });

    if (!user) {
      return { checkpoints: [] };
    }

    const checkpoints = (user.checkpoints as Array<{
      id: string;
      concept: { slug: string };
      status: CheckpointStatus;
      updatedAt: Date;
    }> | undefined) ?? [];

    return {
      checkpoints: checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        conceptSlug: checkpoint.concept.slug,
        status: checkpoint.status,
        updatedAt: checkpoint.updatedAt
      }))
    };
  }

  /** Starts a tutoring session and returns its ID. */
  async startSession(input: StartSessionInput) {
    const user = await this.ensureUser(input.userEmail);
    const concept = input.conceptSlug
      ? await this.prisma.concept.findUnique({ where: { slug: input.conceptSlug } })
      : null;

    return this.prisma.session.create({
      data: {
        userId: user.id,
        conceptId: concept?.id
      }
    });
  }

  /** Marks a session as completed. */
  async endSession(input: EndSessionInput) {
    return this.prisma.session.update({
      where: { id: input.sessionId },
      data: {
        endedAt: new Date(),
        transcript: input.transcript
      }
    });
  }
}
