import express from 'express';
import { getClient } from '../services/pbService.js';
import { buildFilter } from '../middleware/companyScope.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const { period='monthly' } = req.query;
    const filter = buildFilter(req.companyId, ['status != "cancelled"', 'quoted_price > 0']);
    const bookings = await pb.collection('bookings').getFullList({ filter, sort:'pickup_datetime', requestKey:null });

    const grouped = {};
    for (const b of bookings) {
      if (!b.pickup_datetime || !b.quoted_price) continue;
      const date = new Date(b.pickup_datetime);
      let key;
      if (period === 'daily')        key = date.toISOString().slice(0,10);
      else if (period === 'weekly') { const s = new Date(date); s.setDate(date.getDate()-date.getDay()); key = s.toISOString().slice(0,10); }
      else                           key = date.toISOString().slice(0,7);
      if (!grouped[key]) grouped[key] = { period:key, revenue:0, trips:0, currency: b.quoted_currency||'NGN' };
      grouped[key].revenue += Number(b.quoted_price);
      grouped[key].trips   += 1;
    }

    const data          = Object.values(grouped).sort((a,b) => a.period.localeCompare(b.period));
    const totalRevenue  = data.reduce((s,d) => s+d.revenue, 0);
    const totalTrips    = data.reduce((s,d) => s+d.trips,   0);
    res.json({ data, totalRevenue, totalTrips, currency: data[0]?.currency ?? 'NGN' });
  } catch (err) {
    console.error('[revenue] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

export default router;
