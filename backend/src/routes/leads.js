import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page = 1, perPage = 20, status = '', fromDate = '', toDate = '' } = req.query;
    const filters = [];
    if (status)   filters.push(`status = "${status}"`);
    if (fromDate) filters.push(`created >= "${fromDate} 00:00:00"`);
    if (toDate)   filters.push(`created <= "${toDate} 23:59:59"`);
    const filter = filters.join(' && ');
    const result = await pb.collection('leads').getList(Number(page), Number(perPage), {
      filter, sort: '-created', expand: 'call', requestKey: null,
    });
    res.json(result);
  } catch (err) {
    console.error('[leads] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    const lead = await pb.collection('leads').getOne(req.params.id, {
      expand: 'call', requestKey: null,
    });
    res.json(lead);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Lead not found' });
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.patch('/:id', async (req, res) => {
  const VALID_STATUSES = ['new', 'reviewed', 'closed'];
  try {
    const pb = await getClient();
    const { status, notes } = req.body;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields provided' });
    const updated = await pb.collection('leads').update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Lead not found' });
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

export default router;
