import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import Database from 'better-sqlite3';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const sqlite = new Database(env.DATABASE_URL);
export const db = drizzle(sqlite, {
	schema
});

export type Db = typeof db;
