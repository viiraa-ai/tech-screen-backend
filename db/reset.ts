import 'dotenv/config';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
console.log('🧹 dropping and recreating public schema');
await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await client.end();
console.log('✅ reset complete');
