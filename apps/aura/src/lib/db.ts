import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application strictly requires DATABASE_URL to be set in the environment (.env)
if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set in the environment.");
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
