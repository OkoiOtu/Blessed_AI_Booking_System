import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page = 1, perPage = 25, outcome = '', fromDate = '', toDate = '' } = req.query;
    const filters = [];
    if (outcome)  filters.push(`outcome = "${outcome}"`);
    if (fromDate) filters.push(`created >= "${fromDate} 00:00:00"`);
    if (toDate)   filters.push(`created <= "${toDate} 23:59:59"`);
    const filter = filters.join(' && ');
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
