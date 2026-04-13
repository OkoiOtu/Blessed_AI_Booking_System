import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

/**
 * GET /pricing
 * Returns all pricing rules.
 */
router.get('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const result = await pb.collection('pricing_rules').getFullList({
      sort: 'created', requestKey: null,
    });
    res.json(result);
  } catch (err) {
    console.error('[pricing] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

/**
 * POST /pricing
 * Create a new pricing rule.
 */
router.post('/', async (req, res) => {
  try {
    const pb   = await getClient();
    const rule = await pb.collection('pricing_rules').create({
      ...req.body,
      active: req.body.active ?? true,
      currency: req.body.currency || 'NGN',
    });
    res.json(rule);
  } catch (err) {
    console.error('[pricing] POST / error:', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to create pricing rule' });
  }
});

/**
 * PATCH /pricing/:id
 * Update a pricing rule.
 */
router.patch('/:id', async (req, res) => {
  try {
    const pb      = await getClient();
    const updated = await pb.collection('pricing_rules').update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Rule not found' });
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

/**
 * DELETE /pricing/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    await pb.collection('pricing_rules').delete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Rule not found' });
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

export default router;
