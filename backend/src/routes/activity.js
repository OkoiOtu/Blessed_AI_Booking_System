import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page = 1, perPage = 30, action = '' } = req.query;
    const filter = action ? `action = "${action}"` : '';
    const result = await pb.collection('activity_logs').getList(
      Number(page), Number(perPage),
      { sort: '-created', filter, requestKey: null }
    );
    res.json(result);
  } catch (err) {
    console.error('[activity] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { action, actor, detail } = req.body;
    if (!action) return res.status(400).json({ error: 'action is required' });
    const entry = await pb.collection('activity_logs').create(
      { action, actor: actor ?? '', detail: detail ?? '' },
      { requestKey: null }
    );
    res.json(entry);
  } catch (err) {
    console.error('[activity] POST / error:', err.message);
    res.status(500).json({ error: 'Failed to write activity log' });
  }
});

export default router;
