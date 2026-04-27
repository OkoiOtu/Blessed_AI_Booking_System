import express from 'express';
import { getClient } from '../services/pbService.js';
import { buildFilter } from '../middleware/companyScope.js';

const router = express.Router();

const esc = v => String(v ?? '').replace(/"/g, '');

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page=1, perPage=20, status='', fromDate='', toDate='' } = req.query;
    const extra = [];
    if (status)   extra.push(`status = "${esc(status)}"`);
    if (fromDate) extra.push(`created >= "${esc(fromDate)} 00:00:00"`);
    if (toDate)   extra.push(`created <= "${esc(toDate)} 23:59:59"`);
    const filter = buildFilter(req.companyId, extra);
    const result = await pb.collection('leads').getList(Number(page), Number(perPage), {
      filter, sort:'-created', expand:'call', requestKey:null,
    });
    res.json(result);
  } catch (err) {
    console.error('[leads] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pb   = await getClient();
    const lead = await pb.collection('leads').getOne(req.params.id, { expand:'call', requestKey:null });
    if (req.companyId && lead.company_id !== req.companyId)
      return res.status(403).json({ error: 'Access denied' });
    res.json(lead);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Lead not found' });
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const pb   = await getClient();
    const lead = await pb.collection('leads').getOne(req.params.id, { requestKey:null });
    if (req.companyId && lead.company_id !== req.companyId)
      return res.status(403).json({ error: 'Access denied' });
    const { status, notes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    const updated = await pb.collection('leads').update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Lead not found' });
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

export default router;
