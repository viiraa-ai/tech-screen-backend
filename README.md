# ViiRaa Backend Take-Home

Welcome, and thanks for taking the time. This take-home is a small Express + Postgres chat service. It works and is in production-shape, but we know it has gaps. **Your task is to bring the messages endpoint to a quality bar we'd be comfortable shipping.**

We expect this to take about **4 hours**. If you hit 4 hours, stop and write down what you'd do next in `NOTES.md` — that's part of the signal we're looking for.

We care more about clear judgment and clean execution than about completing every optional item. Prioritize accordingly.

---

## Setup

You'll need Docker and Node 20+.

```bash
cp .env.example .env
docker compose up -d                     # starts Postgres on :5432
npm install
npm run db:migrate                       # creates schema in viiraa_chat
npm run db:seed                          # loads ~3 users, 2 conversations, ~220 messages
npm run dev                              # starts the server on :3000
```

Quick smoke test:

```bash
curl http://localhost:3000/health
curl 'http://localhost:3000/conversations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/messages?page=1&limit=20'
```

Run tests:

```bash
npm test
```

The test harness uses a sibling database `viiraa_chat_test` that is created automatically when the Postgres container first boots. Each test run resets it from migrations + seed.

---

## What's here

```
src/
  app.ts                    Express app (no listen)
  index.ts                  app.listen entry
  db.ts                     pg Pool
  routes/
    health.ts
    messages.ts             GET /conversations/:id/messages
  tests/
    messages.test.ts        one happy-path test (proves the harness works)
db/
  migrations/001_initial_schema.sql
  seed.sql
  migrate.ts                small home-grown runner — add new migrations as 002_*.sql, etc.
```

The schema has `users`, `conversations`, `conversation_participants`, and `messages`. See [db/migrations/001_initial_schema.sql](db/migrations/001_initial_schema.sql).

Useful seed IDs:

| Resource | ID |
| --- | --- |
| User Alice  | `11111111-1111-1111-1111-111111111111` |
| User Bob    | `22222222-2222-2222-2222-222222222222` |
| User Carol  | `33333333-3333-3333-3333-333333333333` |
| Conversation A (200 messages) | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| Conversation B (20 messages)  | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` |

---

## What we'd like you to do

### Required

1. **Cursor-based pagination** for `GET /conversations/:id/messages` with stable ordering across pages. Document the cursor format briefly in `NOTES.md`.
2. **Validation and error semantics** — distinguish 400 / 404 / 500 cleanly. Cap page size sensibly.
3. **Structured logging** with request IDs (e.g., pino + a request-id middleware). Replace the `console.log` sprinkle.
4. **Integration tests** covering, at minimum: first page, middle page, last page, empty conversation, invalid cursor, malformed conversation ID (expect 400), non-existent conversation ID (expect 404).
5. **Schema review** — add the index(es) the query needs. Justify in `NOTES.md`.
6. **`NOTES.md`** — short PR-style writeup: what you changed, tradeoffs you made, anything you'd do with another 4 hours.

### Optional — pick anything that's interesting to you

- Backward / bidirectional pagination cursors.
- Rate limiting middleware on the endpoint.
- Prometheus metrics endpoint or OpenTelemetry tracing on DB calls.
- Load test script (`autocannon` / `k6`) showing latency before/after the index you added.
- Soft-delete handling for messages.
- Anything else you'd want to do if this were yours to own.

---

## Ground rules

- You can use AI tools (Copilot, Claude, Cursor, etc.) — same as you would on the job. We care about the result and your judgment, not which keys you pressed.
- Commit as you go. We'll read your git history.
- If something is ambiguous, make a call and note it in `NOTES.md`. Don't block on us.
- If you hit a setup issue you can't get past in ~30 minutes, email us — we'd rather hear sooner than later.

---

## Submission

1. Create a **new private repo** under your own GitHub account and push your work there. (Please don't use GitHub's "Fork" — forks of a public repo can't be made private, and we'd like to keep submissions confidential between you and us.)
2. Grant **read access** to all three of:
   - `yun.wu@viiraa.com`
   - `aiden.fang@viiraa.com`
   - `lei.zhao@viiraa.com`
3. Reply to our email with the repo URL.
4. Make sure `NOTES.md` is in the root.

Please keep the repo private and don't share it elsewhere — this keeps the exercise fair for future candidates.
