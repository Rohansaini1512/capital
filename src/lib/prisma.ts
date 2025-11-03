/**
 * Prisma Client Singleton
 * 
 * Ensures only one instance of Prisma Client is created per application
 * lifecycle, preventing connection pool exhaustion in development.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance
 * 
 * In development, reuses the same instance to avoid creating
 * multiple connections during hot-reload.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
