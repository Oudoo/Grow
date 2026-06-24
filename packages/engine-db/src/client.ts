import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema/index.js";

declare global {
  // eslint-disable-next-line no-var
  var __growengine_pool: mysql.Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ??
  "mysql://growengine:growengine_dev@localhost:3306/growengine";

/**
 * Single shared MySQL connection pool. Re-used across hot reloads in dev to
 * avoid exhausting connections.
 */
const pool =
  globalThis.__growengine_pool ??
  mysql.createPool({
    uri: connectionString,
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__growengine_pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };
export type Database = typeof db;
