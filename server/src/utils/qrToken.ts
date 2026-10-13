import crypto from 'crypto';

const SECRET_SALT = process.env.QR_SECRET || 'campuspulse-synesis26-secure-secret-salt-forest-ivory';

export function generateRegistrationCode(eventId: string, userId: string): string {
  const hash = crypto.createHash('sha256').update(`${eventId}-${userId}-${Date.now()}`).digest('hex').substring(0, 8).toUpperCase();
  return `REG-CP-2026-${hash}`;
}

export function generateTicketToken(registrationId: string, eventId: string, userId: string): string {
  const payload = `${registrationId}:${eventId}:${userId}`;
  const signature = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex').substring(0, 24);
  return `CPTKT_${Buffer.from(payload).toString('base64url')}_${signature}`;
}

export function verifyTicketToken(token: string): { valid: boolean; registrationId?: string; eventId?: string; userId?: string } {
  try {
    if (!token.startsWith('CPTKT_')) {
      return { valid: false };
    }
    const parts = token.slice(6).split('_');
    if (parts.length !== 2) {
      return { valid: false };
    }
    const [payloadB64, signature] = parts;
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex').substring(0, 24);

    if (signature !== expectedSig) {
      return { valid: false };
    }

    const [registrationId, eventId, userId] = payload.split(':');
    return { valid: true, registrationId, eventId, userId };
  } catch (err) {
    return { valid: false };
  }
}
