/**
 * bookingUtils.js
 */

let counter = 1;

/**
 * Generates a human-readable booking reference: BK-00142
 * In production you'd derive this from the DB record ID or a sequence.
 */
export function generateBookingRef() {
  const pad = String(counter++).padStart(5, '0');
  return `BK-${pad}`;
}