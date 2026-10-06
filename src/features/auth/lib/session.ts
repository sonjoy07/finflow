import { env } from '@/lib/env';
import type { SessionPayload, UserRole } from '../types/auth.types';

export const SESSION_COOKIE_NAME = 'finflow_session';
export const SESSION_LIFESPAN_MS = 8 * 60 * 60 * 1000; // 8 hours

// Base64URL encoding/decoding compatible across Edge and Node
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let binary = '';
  const bytes =
    typeof buffer === 'string'
      ? new TextEncoder().encode(buffer)
      : new Uint8Array(buffer as ArrayBuffer);

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }

  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function base64UrlToUint8Array(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a signed session token: payload.signature
 */
export async function signSession(
  data: { userId: string; name: string; email: string; role: UserRole },
  lifespanMs: number = SESSION_LIFESPAN_MS,
  secret: string = env.AUTH_SECRET
): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    ...data,
    issuedAt: now,
    expiresAt: now + lifespanMs,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadJson);

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64)
  );
  const signatureB64 = base64UrlEncode(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a signed session token. Throws on tamper or expiration.
 */
export async function verifySession(
  token: string,
  secret: string = env.AUTH_SECRET
): Promise<SessionPayload> {
  if (!token || typeof token !== 'string') {
    throw new Error('MISSING_TOKEN');
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('INVALID_TOKEN_FORMAT');
  }

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) {
    throw new Error('INVALID_TOKEN_FORMAT');
  }

  // 1. Verify cryptographic signature
  const key = await getHmacKey(secret);
  const signatureBytes = base64UrlToUint8Array(signatureB64);
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes as unknown as BufferSource,
    new TextEncoder().encode(payloadB64)
  );

  if (!isValid) {
    throw new Error('INVALID_SIGNATURE');
  }

  // 2. Parse payload
  let payload: SessionPayload;
  try {
    const json = base64UrlDecode(payloadB64);
    payload = JSON.parse(json);
  } catch {
    throw new Error('CORRUPTED_PAYLOAD');
  }

  // 3. Verify expiration
  if (Date.now() > payload.expiresAt) {
    throw new Error('EXPIRED_SESSION');
  }

  return payload;
}

/**
 * Standard secure cookie options for session management
 */
export function getSessionCookieOptions(expiresAt: number) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  };
}
