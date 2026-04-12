import { randomBytes } from 'crypto';

export function generateCancelToken() {
  return randomBytes(32).toString('hex');
}
