import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return prisma;
}

// Test database connection
export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

