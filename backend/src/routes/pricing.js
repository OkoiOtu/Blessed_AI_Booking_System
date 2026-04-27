import express from 'express';
import { getClient } from '../services/pbService.js';
import { buildFilter } from '../middleware/companyScope.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const filter = buildFilter(req.companyId);
    const result = await pb.collection('pricing_rules').getFullList({ filter, sort:'created', requestKey:null });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

const PRICING_CREATE_ALLOWED = ['name','route_from','route_to','vehicle_type','price_per_hour','flat_rate','min_hours','max_hours'];

router.post('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => PRICING_CREATE_ALLOWED.includes(k)));
    const rule   = await pb.collection('pricing_rules').create({
      ...fields,
      company_id: req.companyId || '',
      active:     req.body.active ?? true,
      currency:   req.body.currency || 'NGN',
    });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message ?? 'Failed to create rule' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const pb   = await getClient();
    const rule = await pb.collection('pricing_rules').getOne(req.params.id, { requestKey: null });
    if (req.companyId && rule.company_id !== req.companyId)
      return res.status(403).json({ error: 'Access denied' });
    const updated = await pb.collection('pricing_rules').update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Rule not found' });
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pb   = await getClient();
    const rule = await pb.collection('pricing_rules').getOne(req.params.id, { requestKey: null });
    if (req.companyId && rule.company_id !== req.companyId)
      return res.status(403).json({ error: 'Access denied' });
    await pb.collection('pricing_rules').delete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Rule not found' });
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

export default router;
