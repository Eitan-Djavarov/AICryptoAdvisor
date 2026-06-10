import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (!databaseUrl.startsWith('file:')) {
    return databaseUrl;
  }

  const filePath = databaseUrl.replace(/^file:/, '');
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return `file:${resolvedPath}`;
}

const adapter = new PrismaBetterSqlite3({
  url: resolveDatabaseUrl(),
});

export const prisma = new PrismaClient({ adapter });

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(' SQLite Database via Prisma Connected Successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown database connection error';
    console.error('[DB] Prisma connection failed:', message);
    throw error;
  }
}
