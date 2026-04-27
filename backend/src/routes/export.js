import express from 'express';
import { getClient } from '../services/pbService.js';
import { buildFilter } from '../middleware/companyScope.js';

const router = express.Router();

function toCSV(rows, headers) {
  const escape = v => {
    if (v == null) return '';
    const str = String(v).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

/**
 * GET /export/bookings
 */
router.get('/bookings', async (req, res) => {
  try {
    const pb     = await getClient();
    const filter = buildFilter(req.companyId);
    const items  = await pb.collection('bookings').getFullList({ filter, sort: '-created', requestKey: null });

    const headers = ['reference','caller_name','caller_phone','pickup_datetime','pickup_address','dropoff_address','duration_hours','status','quoted_price','quoted_currency','sms_sent','created'];
    const csv = toCSV(items, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bookings_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('[export] bookings error:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * GET /export/leads
 */
router.get('/leads', async (req, res) => {
  try {
    const pb     = await getClient();
    const filter = buildFilter(req.companyId);
    const items  = await pb.collection('leads').getFullList({ filter, sort: '-created', requestKey: null });

    const headers = ['caller_phone','summary','status','created'];
    const csv = toCSV(items, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('[export] leads error:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * GET /export/customers
 * One row per unique phone number with aggregated stats.
 */
router.get('/customers', async (req, res) => {
  try {
    const pb     = await getClient();
    const filter = buildFilter(req.companyId);
    const items  = await pb.collection('bookings').getFullList({ filter, sort: '-created', requestKey: null });

    const byPhone = {};
    for (const b of items) {
      const phone = b.caller_phone || 'unknown';
      if (!byPhone[phone]) {
        byPhone[phone] = {
          caller_name: b.caller_name || '',
          caller_phone: phone,
          total_bookings: 0,
          completed: 0,
          cancelled: 0,
          total_hours: 0,
          total_spent: 0,
          currency: b.quoted_currency || 'NGN',
          first_booking: b.created,
          last_booking: b.created,
        };
      }
      const c = byPhone[phone];
      c.total_bookings++;
      if (b.status === 'completed') c.completed++;
      if (b.status === 'cancelled') c.cancelled++;
      c.total_hours += Number(b.duration_hours) || 0;
      c.total_spent += Number(b.quoted_price)    || 0;
      if (b.created < c.first_booking) c.first_booking = b.created;
      if (b.created > c.last_booking)  c.last_booking  = b.created;
    }

    const headers = ['caller_name','caller_phone','total_bookings','completed','cancelled','total_hours','total_spent','currency','first_booking','last_booking'];
    const csv = toCSV(Object.values(byPhone), headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('[export] customers error:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
