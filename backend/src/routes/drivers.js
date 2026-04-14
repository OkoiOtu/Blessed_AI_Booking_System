import express from 'express';
import { getClient } from '../services/pbService.js';
import { assignDriver, unassignDriver, checkDriverConflict } from '../services/driverService.js';

const router = express.Router();

/**
 * GET /drivers
 * Returns all active drivers with their current booking if on trip or assigned.
 */
router.get('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const { status = '' } = req.query;
    const filter = status ? `active = true && status = "${status}"` : 'active = true';

    const drivers = await pb.collection('drivers').getFullList({
      filter, sort: 'full_name', requestKey: null,
    });

    // Attach current booking to each driver
    const enriched = await Promise.all(drivers.map(async (driver) => {
      try {
        const current = await pb.collection('bookings').getList(1, 1, {
          filter: `driver = "${driver.id}" && (status = "on_trip" || status = "assigned" || status = "confirmed")`,
          sort: 'pickup_datetime',
          requestKey: null,
        });
        return { ...driver, current_booking: current.items[0] ?? null };
      } catch {
        return { ...driver, current_booking: null };
      }
    }));

    res.json(enriched);
  } catch (err) {
    console.error('[drivers] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

/**
 * POST /drivers
 * Create a new driver (admin only).
 */
router.post('/', async (req, res) => {
  try {
    const pb     = await getClient();
    const driver = await pb.collection('drivers').create({
      ...req.body,
      status:      'available',
      active:      true,
      total_trips: 0,
      total_hours: 0,
    });
    res.json(driver);
  } catch (err) {
    console.error('[drivers] POST / error:', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to create driver' });
  }
});

/**
 * PATCH /drivers/:id
 * Update driver details.
 */
router.patch('/:id', async (req, res) => {
  const ALLOWED = ['full_name','phone','email','vehicle_type','vehicle_make',
                   'vehicle_model','plate_number','status','available_from',
                   'available_until','notes','active'];
  try {
    const pb      = await getClient();
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    const updated = await pb.collection('drivers').update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Driver not found' });
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

/**
 * DELETE /drivers/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const pb = await getClient();
    // Soft delete — set active = false
    await pb.collection('drivers').update(req.params.id, { active: false });
    res.json({ deleted: true });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Driver not found' });
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

/**
 * POST /drivers/assign
 * Assign a driver to a booking.
 * Body: { bookingId, driverId, actorName }
 */
router.post('/assign', async (req, res) => {
  const { bookingId, driverId, actorName } = req.body;
  if (!bookingId || !driverId) {
    return res.status(400).json({ error: 'bookingId and driverId are required' });
  }
  try {
    const result = await assignDriver(bookingId, driverId, actorName);
    if (!result.success) {
      return res.status(409).json({ error: 'Driver has a conflicting booking', conflict: result.conflict });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[drivers] assign error:', err.message);
    res.status(500).json({ error: 'Failed to assign driver' });
  }
});

/**
 * POST /drivers/unassign
 * Remove driver from a booking.
 * Body: { bookingId, actorName }
 */
router.post('/unassign', async (req, res) => {
  const { bookingId, actorName } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });
  try {
    await unassignDriver(bookingId, actorName);
    res.json({ success: true });
  } catch (err) {
    console.error('[drivers] unassign error:', err.message);
    res.status(500).json({ error: 'Failed to unassign driver' });
  }
});

/**
 * GET /drivers/check-conflict
 * Check if a driver is available for a given time window.
 */
router.get('/check-conflict', async (req, res) => {
  const { driverId, pickupDatetime, durationHours, excludeBookingId } = req.query;
  if (!driverId || !pickupDatetime || !durationHours) {
    return res.status(400).json({ error: 'driverId, pickupDatetime and durationHours are required' });
  }
  try {
    const conflict = await checkDriverConflict(driverId, pickupDatetime, Number(durationHours), excludeBookingId);
    res.json({ hasConflict: !!conflict, conflict: conflict ?? null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check conflict' });
  }
});

export default router;
