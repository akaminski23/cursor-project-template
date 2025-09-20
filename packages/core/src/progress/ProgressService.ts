import { CheckpointStatus, PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../utils/prismaClient.js';
import type { Checkpoint, User } from '../types.js';

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

  private static isUser(value: unknown): value is User {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof (value as { id: unknown }).id === 'string' &&
      (!('email' in value) || typeof (value as { email?: unknown }).email === 'string' || (value as { email?: unknown }).email === undefined) &&
      (!('name' in value) || typeof (value as { name?: unknown }).name === 'string' || (value as { name?: unknown }).name === undefined)
    );
  }

  private static isConcept(value: unknown): value is { id: string; slug: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof (value as { id: unknown }).id === 'string' &&
      'slug' in value &&
      typeof (value as { slug: unknown }).slug === 'string'
    );
  }

  private static isCheckpointWithConcept(
    value: unknown
  ): value is Omit<Checkpoint, 'concept'> & {
    concept: { slug: string };
    status: CheckpointStatus;
    updatedAt: Date;
  } {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const record = value as Record<string, unknown>;
    const concept = record.concept as Record<string, unknown> | undefined;

    return (
      typeof record.id === 'string' &&
      typeof record.userId === 'string' &&
      record.createdAt instanceof Date &&
      record.updatedAt instanceof Date &&
      typeof record.status === 'string' &&
      typeof concept === 'object' &&
      concept !== null &&
      typeof (concept as { slug?: unknown }).slug === 'string'
    );
  }

  private static isUserWithCheckpoints(
    value: unknown
  ): value is User & {
    checkpoints?: Array<
      Omit<Checkpoint, 'concept'> & {
        concept: { slug: string };
        status: CheckpointStatus;
        updatedAt: Date;
      }
    >;
  } {
    if (!ProgressService.isUser(value)) {
      return false;
    }

    const record = value as unknown as Record<string, unknown>;

    if (!('checkpoints' in record)) {
      return true;
    }

    const checkpoints = record.checkpoints;
    return (
      checkpoints === undefined ||
      (Array.isArray(checkpoints) && checkpoints.every(ProgressService.isCheckpointWithConcept))
    );
  }

  /** Ensures a user record exists for the given email. */
  async ensureUser(email: string, name?: string): Promise<User> {
    const result = await this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name }
    });
    if (!ProgressService.isUser(result)) {
      throw new TypeError('Invalid user payload received from Prisma');
    }
    return result;
  }

  /** Ensures a concept record exists and returns it. */
  async ensureConcept(input: EnsureConceptInput): Promise<{ id: string; slug: string }> {
    const concept = await this.prisma.concept.upsert({
      where: { slug: input.slug },
      update: { title: input.title, description: input.description },
      create: { slug: input.slug, title: input.title, description: input.description }
    });
    if (!ProgressService.isConcept(concept)) {
      throw new TypeError('Invalid concept payload received from Prisma');
    }
    return concept;
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

    if (!user || !ProgressService.isUserWithCheckpoints(user)) {
      return { checkpoints: [] };
    }

    const checkpoints = user.checkpoints ?? [];

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
    const conceptRecord = input.conceptSlug
      ? await this.prisma.concept.findUnique({ where: { slug: input.conceptSlug } })
      : null;
    const concept = conceptRecord && ProgressService.isConcept(conceptRecord) ? conceptRecord : null;

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
