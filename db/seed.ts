import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, 'seed.sql');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
console.log('🌱 seeding from db/seed.sql');
await client.query(readFileSync(seedPath, 'utf8'));
await client.end();
console.log('✅ seed complete');
