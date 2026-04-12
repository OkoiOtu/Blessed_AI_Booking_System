/**
 * phoneUtils.js
 *
 * Twilio requires E.164 format: +[country code][number], no spaces or dashes.
 * Vapi usually provides this already but we normalise defensively.
 */

export function formatE164(phone) {
  if (!phone) return '';
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Already E.164
  if (cleaned.startsWith('+')) return cleaned;
  // Nigerian number without country code (e.g. 0801...)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+234${cleaned.slice(1)}`;
  }
  // Assume international digits with no +
  return `+${cleaned}`;
}

export function isValidPhone(phone) {
  return /^\+\d{7,15}$/.test(phone);
}