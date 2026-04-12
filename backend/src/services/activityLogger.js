import { getClient } from './pbService.js';

/**
 * logActivity — write an entry to the activity_logs collection.
 * Never throws — logging failures should not break the main flow.
 *
 * @param {string} action  — e.g. 'booking_confirmed', 'lead_created', 'user_created'
 * @param {string} actor   — email or phone of whoever/whatever triggered it
 * @param {string} detail  — short human-readable description
 */
export async function logActivity(action, actor, detail) {
  try {
    const pb = await getClient();
    await pb.collection('activity_logs').create({ action, actor, detail });
  } catch (err) {
    console.error('[activityLogger] Failed to log:', err.message);
  }
}
