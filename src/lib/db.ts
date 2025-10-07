import { Pool, type PoolClient } from "pg";

import { getServerEnv } from "./runtimeEnv";

const CONNECTION_KEYS = [
  "POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_CONNECTION_STRING",
] as const;

const connectionString = CONNECTION_KEYS.map((key) => getServerEnv(key)).find(
  (value): value is string => Boolean(value),
);

let pool: Pool | null = null;

function createPool(): Pool | null {
  if (!connectionString) {
    return null;
  }

  const useSsl = !/localhost|127\.0\.0\.1/i.test(connectionString);

  pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  pool.on("error", (error) => {
    console.error("Postgres pool error", error);
  });

  return pool;
}

export function getPool(): Pool | null {
  if (pool) {
    return pool;
  }

  return createPool();
}

export async function withPgClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const activePool = getPool();

  if (!activePool) {
    throw new Error("Postgres connection string is not configured");
  }

  const client = await activePool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
