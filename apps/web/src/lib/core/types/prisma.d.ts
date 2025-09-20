declare module '@prisma/client' {
  export type CheckpointStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

  export interface UserDelegate {
    upsert(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<unknown>;
  }

  export interface ConceptDelegate {
    upsert(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<unknown>;
  }

  export interface CheckpointDelegate {
    create(args: unknown): Promise<unknown>;
  }

  export interface SessionDelegate {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  }

  export class PrismaClient {
    user: UserDelegate;
    concept: ConceptDelegate;
    checkpoint: CheckpointDelegate;
    session: SessionDelegate;
  }
}
