import { PrismaClient } from "@prisma/client";

// Prisma client initialized at module load time (runtime, not build time)
// This is safe as it only creates the client instance, not executing queries
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
