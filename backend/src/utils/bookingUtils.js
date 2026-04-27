import { randomBytes } from 'crypto';

export function generateBookingRef() {
  return `BK-${randomBytes(4).toString('hex').toUpperCase()}`;
}