import { describe, it, expect } from 'vitest';
import { signSession, verifySession } from './session';

describe('Cryptographic Session Tokens', () => {
  const mockUser = {
    userId: 'usr_test_123',
    name: 'Elena Vance',
    email: 'operations@finflow.io',
    role: 'operations_lead' as const,
  };

  it('generates a valid signed session token', async () => {
    const token = await signSession(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(2);

    const verified = await verifySession(token);
    expect(verified.userId).toBe(mockUser.userId);
    expect(verified.name).toBe(mockUser.name);
    expect(verified.role).toBe(mockUser.role);
    expect(verified.expiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects tampered token payloads with INVALID_SIGNATURE', async () => {
    const token = await signSession(mockUser);
    const [payloadB64, signature] = token.split('.');

    // Tamper with payload (e.g. escalate role to admin)
    const tamperedPayload = btoa(JSON.stringify({ ...mockUser, role: 'admin', expiresAt: Date.now() + 10000 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const tamperedToken = `${tamperedPayload}.${signature}`;

    await expect(verifySession(tamperedToken)).rejects.toThrow('INVALID_SIGNATURE');
  });

  it('rejects expired sessions with EXPIRED_SESSION', async () => {
    // Generate token with negative lifespan (-1000ms)
    const expiredToken = await signSession(mockUser, -1000);

    await expect(verifySession(expiredToken)).rejects.toThrow('EXPIRED_SESSION');
  });

  it('rejects malformed tokens', async () => {
    await expect(verifySession('not-a-token')).rejects.toThrow('INVALID_TOKEN_FORMAT');
    await expect(verifySession('')).rejects.toThrow('MISSING_TOKEN');
  });
});
