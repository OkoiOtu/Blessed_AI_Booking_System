import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb = await getClient();

    const allBookings = await pb.collection('bookings').getFullList({ sort: '-created', requestKey: null });
    const allLeads    = await pb.collection('leads').getFullList({ sort: '-created', requestKey: null });

    const bookingCounts = { confirmed: 0, on_trip: 0, completed: 0, cancelled: 0 };
    for (const b of allBookings) {
      const s = b.status || 'confirmed';
      if (s in bookingCounts) bookingCounts[s]++;
      else bookingCounts.confirmed++;
    }

    const leadCounts = { new: 0, reviewed: 0, closed: 0 };
    for (const l of allLeads) {
      const s = l.status || 'new';
      if (s in leadCounts) leadCounts[s]++;
    }

    res.json({ bookings: bookingCounts, leads: leadCounts });
  } catch (err) {
    console.error('[stats] error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
