const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {paymentApi}=require('./payments/stripe.cjs');
const localEnv=path.join(__dirname,'.env.local');
if(require.main===module&&fs.existsSync(localEnv))process.loadEnvFile(localEnv);

const ROOT = path.join(__dirname, 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function createServer(options={}) {
  const payments=paymentApi(options.payments);
  return http.createServer(async (req, res) => {
    const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
    function reply(status, body, type = 'text/plain; charset=utf-8', extra = {}) {
      res.writeHead(status, { ...headers, 'Content-Type': type, ...extra });
      res.end(req.method === 'HEAD' ? undefined : body);
    }
    let paymentUrl;try{paymentUrl=new URL(req.url,'http://localhost');}catch{return reply(400,'Bad request');}
    if(await payments.handler(req,res,paymentUrl))return;
    if (!['GET', 'HEAD'].includes(req.method)) return reply(405, 'Method not allowed', undefined, { Allow: 'GET, HEAD' });
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return reply(400, 'Bad request'); }
    if (pathname === '/health') return reply(200, 'ok');
    if (pathname.includes('\0') || pathname.includes('\\')) return reply(400, 'Bad request');
    const file = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(ROOT, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return reply(404, 'Not found');
    const extension = path.extname(file).toLowerCase();
    if (!TYPES[extension]) return reply(404, 'Not found');
    try {
      const info = await fs.promises.stat(file);
      if (!info.isFile()) return reply(404, 'Not found');
      const bytes = await fs.promises.readFile(file);
      reply(200, bytes, TYPES[extension], {
        'Content-Length': bytes.byteLength,
        'Cache-Control': ['.html', '.js', '.css'].includes(extension) ? 'no-cache' : 'public, max-age=300'
      });
    } catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) return reply(404, 'Not found');
      console.error('Static file error:', error.code);
      reply(500, 'Internal server error');
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  const server = createServer();
  server.listen(port, host, () => console.log(`SleepThrough: http://${host}:${server.address().port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
module.exports = { createServer };
