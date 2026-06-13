import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not defined. Set it to your PostgreSQL connection string.'
    );
  }

  return databaseUrl;
}

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });

export const prisma = new PrismaClient({ adapter });

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database via Prisma connected successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown database connection error';
    console.error('[DB] Prisma connection failed:', message);
    throw error;
  }
}
