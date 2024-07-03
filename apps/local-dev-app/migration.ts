import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

let sqlite = new Database("sqlite.db");
let db = drizzle(sqlite);
await migrate(db, { migrationsFolder: "./drizzle" });
