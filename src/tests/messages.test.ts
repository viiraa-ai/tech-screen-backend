import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { pool } from '../db.js';

const CONVERSATION_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

afterAll(async () => {
  await pool.end();
});

// Smoke test only — proves the harness is wired up. The real coverage
// is for you to add: first / middle / last page, empty conversation,
// invalid cursor, malformed and non-existent conversation IDs,
// participant vs. non-participant access, missing `X-User-Id`, etc.
describe('GET /conversations/:id/messages', () => {
  it('responds 200 for a known conversation', async () => {
    const res = await request(app).get(`/conversations/${CONVERSATION_A}/messages`);
    expect(res.status).toBe(200);
  });
});
