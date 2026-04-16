import express from 'express';
import { getClient } from '../services/pbService.js';

const router = express.Router();

const SETTINGS_KEY = 'notification_settings';

const DEFAULTS = {
  sms_booking_confirmed:   true,
  sms_booking_cancelled:   true,
  sms_reminder_1hr:        true,
  sms_admin_new_booking:   true,
  sms_admin_new_lead:      true,
  admin_phone_override:    '',
};

/**
 * GET /notifications/settings
 */
router.get('/settings', async (req, res) => {
  try {
    const pb = await getClient();
    try {
      const record = await pb.collection('app_settings').getFirstListItem(
        `key = "${SETTINGS_KEY}"`, { requestKey: null }
      );
      res.json({ ...DEFAULTS, ...JSON.parse(record.value) });
    } catch {
      // No settings saved yet — return defaults
      res.json(DEFAULTS);
    }
  } catch (err) {
    console.error('[notifications] GET settings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PATCH /notifications/settings
 */
router.patch('/settings', async (req, res) => {
  try {
    const pb       = await getClient();
    const incoming = req.body;

    // Validate booleans
    const merged = {};
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (k === 'admin_phone_override') {
        merged[k] = typeof incoming[k] === 'string' ? incoming[k] : v;
      } else {
        merged[k] = typeof incoming[k] === 'boolean' ? incoming[k] : v;
      }
    }

    try {
      const existing = await pb.collection('app_settings').getFirstListItem(
        `key = "${SETTINGS_KEY}"`, { requestKey: null }
      );
      await pb.collection('app_settings').update(
        existing.id, { value: JSON.stringify(merged) }, { requestKey: null }
      );
    } catch {
      await pb.collection('app_settings').create(
        { key: SETTINGS_KEY, value: JSON.stringify(merged) }, { requestKey: null }
      );
    }

    res.json(merged);
  } catch (err) {
    console.error('[notifications] PATCH settings error:', err.message);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;
