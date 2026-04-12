import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();
    const { page = 1, perPage = 20, search = '' } = req.query;
    const filter = search
      ? `reference ~ "${search}" || caller_name ~ "${search}" || caller_phone ~ "${search}"`
      : '';
    const result = await pb.collection('bookings').getList(Number(page), Number(perPage), {
      filter, sort: '-created', expand: 'call', requestKey: null,
    });
    res.json(result);
  } catch (err) {
    console.error('[bookings] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    const booking = await pb.collection('bookings').getOne(req.params.id, {
      expand: 'call', requestKey: null,
    });
    res.json(booking);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Booking not found' });
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.patch('/:id', async (req, res) => {
  const ALLOWED = ['caller_name', 'caller_phone', 'pickup_datetime', 'pickup_address', 'dropoff_address', 'duration_hours', 'status'];
  try {
    const pb = await getClient();
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => ALLOWED.includes(key))
    );
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields provided' });
    const updated = await pb.collection('bookings').update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Booking not found' });
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

router.post('/cancel', async (req, res) => {
  const { reference, token } = req.body;
  if (!reference || !token) return res.status(400).json({ error: 'Reference and token required.' });
  try {
    const pb = await getClient();
    const results = await pb.collection('bookings').getList(1, 1, {
      filter: `reference = "${reference}"`, requestKey: null,
    });
    if (!results.items.length) return res.status(404).json({ error: 'Booking not found.' });
    const booking = results.items[0];
    if (booking.cancel_token !== token) return res.status(403).json({ error: 'Invalid cancellation token.' });
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: `Booking is already ${booking.status}.` });
    }
    await pb.collection('bookings').update(booking.id, { status: 'cancelled' });
    res.json({ success: true, reference });
  } catch (err) {
    console.error('[bookings] cancel error:', err.message);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

export default router;
