import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & { __prismaClient?: PrismaClient };

let prismaInstance: PrismaClient | undefined = globalForPrisma.__prismaClient;

if (!prismaInstance) {
  try {
    prismaInstance = new PrismaClient();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[prisma] Falling back to a no-op PrismaClient. Run `pnpm --filter @ai-2dor/core prisma generate` to enable database access.',
        error
      );
    }
    prismaInstance = {
      user: {
        upsert: async () => Promise.reject(new Error('Prisma client unavailable')),
        findUnique: async () => Promise.reject(new Error('Prisma client unavailable'))
      },
      concept: {
        upsert: async () => Promise.reject(new Error('Prisma client unavailable')),
        findUnique: async () => Promise.reject(new Error('Prisma client unavailable'))
      },
      checkpoint: {
        create: async () => Promise.reject(new Error('Prisma client unavailable')),
        findMany: async () => Promise.reject(new Error('Prisma client unavailable'))
      },
      session: {
        create: async () => Promise.reject(new Error('Prisma client unavailable')),
        update: async () => Promise.reject(new Error('Prisma client unavailable'))
      }
    } as unknown as PrismaClient;
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prismaClient = prismaInstance;
  }
}

export function getPrismaClient(): PrismaClient {
  return prismaInstance as PrismaClient;
}
