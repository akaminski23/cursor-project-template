import { createRequire } from 'node:module';
import type { PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);

type PrismaClientConstructor = new () => PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & { __prismaClient?: PrismaClient };

let prismaInstance: PrismaClient | undefined = globalForPrisma.__prismaClient;

if (!prismaInstance) {
  let PrismaClientCtor: PrismaClientConstructor | undefined;
  let prismaInitError: unknown;

  try {
    const prismaModule = require('@prisma/client') as { PrismaClient?: PrismaClientConstructor };
    PrismaClientCtor = prismaModule.PrismaClient;
  } catch (error) {
    prismaInitError = error;
  }

  if (PrismaClientCtor) {
    try {
      prismaInstance = new PrismaClientCtor();
    } catch (error) {
      prismaInitError = prismaInitError ?? error;
    }
  }

  if (!prismaInstance) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[prisma] Falling back to a no-op PrismaClient. Run `pnpm --filter @ai-2dor/core prisma generate` to enable database access.',
        prismaInitError
      );
    }
    prismaInstance = createNoopClient();
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prismaClient = prismaInstance;
  }
}

function createNoopClient(): PrismaClient {
  const unavailable = async (...args: unknown[]) => {
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

export function getPrismaClient(): PrismaClient {
  return prismaInstance as PrismaClient;
}
