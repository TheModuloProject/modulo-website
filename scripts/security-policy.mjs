import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export async function securityHeaders(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attributes, content]) => !attributes.includes('src=') && content.trim())
    .map(([, , content]) => `'sha256-${createHash('sha256').update(content).digest('base64')}'`)
    .join(' ');
  return {
    'Content-Security-Policy': `default-src 'self'; script-src 'self' ${hashes}; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
}
