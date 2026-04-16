import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

/**
 * GET /revenue
 * Returns earnings grouped by period.
 * Query params: period=daily|weekly|monthly (default: monthly)
 */
router.get('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const { period = 'monthly' } = req.query;

    const bookings = await pb.collection('bookings').getFullList({
      filter: 'status != "cancelled" && quoted_price > 0',
      sort: 'pickup_datetime',
      requestKey: null,
    });

    const grouped = {};

    for (const b of bookings) {
      if (!b.pickup_datetime || !b.quoted_price) continue;
      const date = new Date(b.pickup_datetime);
      let key;

      if (period === 'daily') {
        key = date.toISOString().slice(0, 10);
      } else if (period === 'weekly') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 7);
      }

      if (!grouped[key]) grouped[key] = { period: key, revenue: 0, trips: 0, currency: b.quoted_currency || 'NGN' };
      grouped[key].revenue += Number(b.quoted_price);
      grouped[key].trips   += 1;
    }

    const data = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));

    // Totals
    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const totalTrips   = data.reduce((s, d) => s + d.trips, 0);
    const currency     = data[0]?.currency ?? 'NGN';

    res.json({ data, totalRevenue, totalTrips, currency });
  } catch (err) {
    console.error('[revenue] error:', err.message);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;
