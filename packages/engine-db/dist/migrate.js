import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import "dotenv/config";
const connectionString = process.env.DATABASE_URL ??
    "mysql://growengine:growengine_dev@localhost:3306/growengine";
async function main() {
    const connection = await mysql.createConnection({ uri: connectionString, multipleStatements: true });
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully");
    await connection.end();
}
main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map