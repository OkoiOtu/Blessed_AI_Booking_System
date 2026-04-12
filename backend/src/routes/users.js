import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const result = await pb.collection('users').getList(1, 50, {
      sort: 'created', requestKey: null,
    });
    const safe = result.items.map(u => ({
      id: u.id, email: u.email, full_name: u.full_name ?? '',
      role: u.role ?? 'user', suspended: u.suspended ?? false, created: u.created,
    }));
    res.json({ ...result, items: safe });
  } catch (err) {
    console.error('[users] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const pb = await getClient();
    const count = await pb.collection('users').getList(1, 1, { requestKey: null });
    if (count.totalItems >= 10) return res.status(400).json({ error: 'Maximum of 10 users reached.' });
    const { full_name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await pb.collection('users').create({
      email, password, passwordConfirm: password,
      full_name: full_name ?? '', role: role ?? 'user',
      suspended: false, emailVisibility: true,
    });
    res.json({ id: user.id, email: user.email, full_name: user.full_name, role: user.role });
  } catch (err) {
    console.error('[users] POST / error:', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to create user.' });
  }
});

router.patch('/:id', async (req, res) => {
  const ALLOWED = ['full_name', 'email', 'role', 'suspended'];
  try {
    const pb = await getClient();
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields provided.' });
    const updated = await pb.collection('users').update(req.params.id, updates);
    res.json({ id: updated.id, email: updated.email, full_name: updated.full_name, role: updated.role, suspended: updated.suspended });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'User not found.' });
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    await pb.collection('users').delete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'User not found.' });
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
