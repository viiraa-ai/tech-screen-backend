import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', '..', 'db', 'migrations');
const seedPath = join(here, '..', '..', 'db', 'seed.sql');

export async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL not set — copy .env.example to .env');
  }

  await ensureDatabase(url);

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
    await client.query(readFileSync(join(migrationsDir, file), 'utf8'));
  }
  await client.query(readFileSync(seedPath, 'utf8'));
  await client.end();
}

// Connect to the postgres maintenance DB and create the test database if it
// doesn't exist. This makes the test harness resilient to `docker compose down -v`,
// which wipes the volume and skips the init script that originally created it.
async function ensureDatabase(testUrl: string) {
  const parsed = new URL(testUrl);
  const dbName = decodeURIComponent(parsed.pathname.slice(1));
  parsed.pathname = '/postgres';

  const admin = new pg.Client({ connectionString: parsed.toString() });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
  }
  await admin.end();
}
