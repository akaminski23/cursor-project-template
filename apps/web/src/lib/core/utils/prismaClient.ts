import type { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & { __prismaClient?: PrismaClient };

function createNoopClient(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unavailable = async (..._args: unknown[]) => {
    throw new Error('Prisma client unavailable');
  };

  return {
    user: {
      upsert: unavailable,
      findUnique: unavailable
    },
    concept: {
      upsert: unavailable,
      findUnique: unavailable
    },
    checkpoint: {
      create: unavailable
    },
    session: {
      create: unavailable,
      update: unavailable
    }
  } as unknown as PrismaClient;
}

let prismaInstance: PrismaClient | undefined = globalForPrisma.__prismaClient;

// Initialize Prisma client with fallback
if (!prismaInstance) {
  prismaInstance = createNoopClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prismaClient = prismaInstance;
  }
}

export function getPrismaClient(): PrismaClient {
  return prismaInstance as PrismaClient;
}
