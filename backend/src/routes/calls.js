import express from 'express';
import { getClient } from '../services/pbService.js';
import { buildFilter } from '../middleware/companyScope.js';

const router = express.Router();

const esc = v => String(v ?? '').replace(/"/g, '');

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page=1, perPage=25, outcome='', fromDate='', toDate='' } = req.query;
    const extra = [];
    if (outcome)  extra.push(`outcome = "${esc(outcome)}"`);
    if (fromDate) extra.push(`created >= "${esc(fromDate)} 00:00:00"`);
    if (toDate)   extra.push(`created <= "${esc(toDate)} 23:59:59"`);
    const filter = buildFilter(req.companyId, extra);
    const result = await pb.collection('calls').getList(Number(page), Number(perPage), {
      filter, sort:'-created', requestKey:null,
    });
    res.json(result);
  } catch (err) {
    console.error('[calls] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pb   = await getClient();
    const call = await pb.collection('calls').getOne(req.params.id, { requestKey:null });
    if (req.companyId && call.company_id !== req.companyId)
      return res.status(403).json({ error: 'Access denied' });
    res.json(call);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Call not found' });
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

export default router;
