import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const path = process.env.DATABASE_PATH ?? "./data/orders.sqlite";
mkdirSync(dirname(path), { recursive: true });

const sqlite = new Database(path);
export const db = drizzle(sqlite, { schema });
