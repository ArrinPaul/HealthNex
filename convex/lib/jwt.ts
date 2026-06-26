import { v } from "convex/values";

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be defined in production environment');
  }
  console.warn('⚠️ JWT_SECRET is not defined. Using fallback secret for development only.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production-minimum-32-chars';

function base64UrlDecode(str: string) {
  // Add padding if needed
  while (str.length % 4 !== 0) {
    str += "=";
  }
  // Replace - with + and _ with /
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(str);
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export async function verifyJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    if (header.alg !== 'HS256') {
      throw new Error('Unsupported algorithm');
    }

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    // Verify issued-at (reject tokens issued before a reasonable time)
    if (payload.iat && payload.iat > now + 60) {
      throw new Error('Token issued in the future');
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = str2ab(base64UrlDecode(signatureB64));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
