import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma v7 reads datasource URL from prisma.config.ts at runtime
export const prisma =
  globalForPrisma.prisma ??
  (new (PrismaClient as unknown as new () => PrismaClient)() as PrismaClient);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
