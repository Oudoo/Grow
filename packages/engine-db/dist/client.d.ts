import mysql from "mysql2/promise";
import * as schema from "./schema/index.js";
declare global {
    var __growengine_pool: mysql.Pool | undefined;
}
/**
 * Single shared MySQL connection pool. Re-used across hot reloads in dev to
 * avoid exhausting connections.
 */
declare const pool: mysql.Pool;
export declare const db: import("drizzle-orm/mysql2").MySql2Database<typeof schema> & {
    $client: mysql.Pool;
};
export { pool };
export type Database = typeof db;
//# sourceMappingURL=client.d.ts.map