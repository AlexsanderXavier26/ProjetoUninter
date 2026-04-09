import * as crypto from 'crypto';

export function hashEmailIrreversivel(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex');
}
