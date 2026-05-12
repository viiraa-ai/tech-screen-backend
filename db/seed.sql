-- Idempotent seed: wipe and reload.
TRUNCATE messages, conversation_participants, conversations, users RESTART IDENTITY CASCADE;

INSERT INTO users (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice Chen'),
  ('22222222-2222-2222-2222-222222222222', 'Bob Martinez'),
  ('33333333-3333-3333-3333-333333333333', 'Carol Singh');

INSERT INTO conversations (id, title, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Metabolic check-in',  now() - interval '30 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Coaching follow-up',  now() - interval '7 days');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222');

-- 200 messages in conversation A. Single INSERT so now() is constant across rows.
INSERT INTO messages (conversation_id, sender_id, body, created_at)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (ARRAY[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
  ])[1 + (i % 3)],
  'Message #' || i || ' in conversation A',
  now() - make_interval(mins => CASE WHEN i = 101 THEN 100 ELSE i END)
FROM generate_series(1, 200) AS s(i);

-- 20 messages in conversation B.
INSERT INTO messages (conversation_id, sender_id, body, created_at)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  (ARRAY[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  ])[1 + (i % 2)],
  'Message #' || i || ' in conversation B',
  now() - make_interval(hours => i)
FROM generate_series(1, 20) AS s(i);
