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

// For development, try to import Prisma; for production build, use noop
if (!prismaInstance) {
  try {
    // This will work in Node.js environment but might fail in webpack build
    if (typeof window === 'undefined') {
      // We're in Node.js/server environment
      const { PrismaClient } = eval('require')('@prisma/client');
      prismaInstance = new PrismaClient();
    } else {
      // We're in browser - use noop
      prismaInstance = createNoopClient();
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[prisma] Falling back to a no-op PrismaClient. Run `pnpm --filter @ai-2dor/core prisma generate` to enable database access.',
        error
      );
    }
    prismaInstance = createNoopClient();
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prismaClient = prismaInstance;
  }
}

export function getPrismaClient(): PrismaClient {
  return prismaInstance as PrismaClient;
}
