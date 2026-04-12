import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page = 1, perPage = 25, outcome = '' } = req.query;
    const filter = outcome ? `outcome = "${outcome}"` : '';
    const result = await pb.collection('calls').getList(Number(page), Number(perPage), {
      filter, sort: '-created', requestKey: null,
    });
    res.json(result);
  } catch (err) {
    console.error('[calls] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    const call = await pb.collection('calls').getOne(req.params.id, { requestKey: null });
    res.json(call);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Call not found' });
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

export default router;
