import { PrismaClient } from '@/prisma/prisma-client';

// 環境変数からDATABASE_URLを構築
const buildDatabaseUrl = () => {
  const user = process.env.TIDB_USER;
  const password = process.env.TIDB_PASSWORD;
  const host = process.env.TIDB_HOST;
  const port = process.env.TIDB_PORT;
  const dbName = process.env.TIDB_DB_NAME;
  return `mysql://${user}:${password}@${host}:${port}/${dbName}?sslaccept=strict&connection_limit=3`;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    log: ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
