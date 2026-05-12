import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, 'migrations');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

await client.connect();
await client.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name        TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await client.query<{ name: string }>('SELECT name FROM _migrations')).rows.map((r) => r.name),
);

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`↩️  skip ${file} (already applied)`);
    continue;
  }
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  console.log(`▶️  applying ${file}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log(`✅ applied ${file}`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`❌ failed ${file}:`, e);
    process.exit(1);
  }
}

await client.end();
console.log('🏁 migrations complete');
