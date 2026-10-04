import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { securityHeaders } from './security-policy.mjs';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const headers = await securityHeaders(resolve(root, 'index.html'));
const routes = new Set(JSON.parse(await readFile(resolve(root, 'scripts/site/routes.json'), 'utf8')));
const documentHeaders = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const cache = new Map();
const allowed = /^(?:index\.html|404\.html|styles\.css|pages\.css|script\.js|robots\.txt|sitemap\.xml|assets\/[a-zA-Z0-9/_-]+\.(?:woff2|svg|png|jpg|webp|avif|txt)|components\/(?:navigation|motion|modulo|contact|examples)\/[a-zA-Z0-9_-]+\.js)$/;

async function notFound(req, res) {
  const path = resolve(root, '404.html');
  for (const [key, value] of Object.entries(await securityHeaders(path))) res.setHeader(key, value);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.writeHead(404).end(req.method === 'HEAD' ? undefined : await readFile(path));
}

createServer(async (req, res) => {
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const route = pathname.endsWith('/') || pathname === '/404.html' ? pathname : `${pathname}/`;
    const isPage = routes.has(route);
    const relative = isPage ? route === '/' ? 'index.html' : route === '/404.html' ? '404.html' : `${route.slice(1)}index.html` : pathname.replace(/^\//, '');
    if ((!isPage && !allowed.test(relative)) || relative.split('/').includes('..')) { await notFound(req, res); return; }
    const path = await realpath(resolve(root, relative));
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { await notFound(req, res); return; }
    const info = await stat(path);
    if (!info.isFile()) { await notFound(req, res); return; }
    if (extname(path) === '.html') {
      let entry = documentHeaders.get(path);
      if (!entry || entry.modified !== info.mtimeMs) { entry = { modified: info.mtimeMs, headers: await securityHeaders(path) }; documentHeaders.set(path, entry); }
      for (const [key, value] of Object.entries(entry.headers)) res.setHeader(key, value);
    }
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    let content = cache.get(path);
    if (!content || content.modified !== info.mtimeMs) {
      const raw = await readFile(path);
      const text = ['.html', '.css', '.js', '.svg', '.txt', '.xml'].includes(extname(path));
      content = { modified: info.mtimeMs, raw, br: text ? brotliCompressSync(raw) : null, gzip: text ? gzipSync(raw) : null };
      cache.set(path, content);
    }
    const accepts = req.headers['accept-encoding'] || '';
    const encoding = /\bbr\b/.test(accepts) && content.br ? 'br' : /\bgzip\b/.test(accepts) && content.gzip ? 'gzip' : null;
    const body = encoding ? content[encoding] : content.raw;
    if (content.br) res.setHeader('Vary', 'Accept-Encoding');
    if (encoding) res.setHeader('Content-Encoding', encoding);
    res.setHeader('Content-Length', body.byteLength);
    res.writeHead(200);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { await notFound(req, res); }
}).listen(port, host, () => console.log(`Modulo preview: http://${host}:${port}`));
