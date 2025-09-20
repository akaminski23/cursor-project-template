import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __aiTutorPrisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  __aiTutorPrisma?: PrismaClient;
};

let prisma: PrismaClient;

if (globalForPrisma.__aiTutorPrisma) {
  prisma = globalForPrisma.__aiTutorPrisma;
} else {
  try {
    prisma = new PrismaClient();
  } catch (error) {
    console.warn('Unable to initialize PrismaClient. Ensure database is configured.', error);
    prisma = {
      checkpoint: {
        create: async () => Promise.reject(new Error('Database unavailable')), 
        findMany: async () => Promise.reject(new Error('Database unavailable'))
      },
      user: {
        upsert: async () => Promise.reject(new Error('Database unavailable'))
      }
    } as unknown as PrismaClient;
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__aiTutorPrisma = prisma;
  }
}

export function getPrismaClient(): PrismaClient {
  return prisma;
}
