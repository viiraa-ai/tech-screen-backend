import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/conversations/:id/messages', async (req, res) => {
  console.log('📨 GET /conversations/' + req.params.id + '/messages');

  try {
    const conversationId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = page * limit;

    const messagesResult = await pool.query(
      `SELECT id, conversation_id, sender_id, body, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset],
    );

    const messages: any[] = [];
    for (const m of messagesResult.rows) {
      const u = await pool.query('SELECT name FROM users WHERE id = $1', [m.sender_id]);
      messages.push({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        sender_name: u.rows[0]?.name,
        body: m.body,
        created_at: m.created_at,
      });
    }

    console.log('📦 Loaded', messages.length, 'messages');
    res.json({ messages, page, limit });
  } catch (e) {
    console.error('❌ Error:', e);
    res.status(500).send('error');
  }
});

export default router;
