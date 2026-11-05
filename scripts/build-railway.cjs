const fs = require('node:fs');
const zlib = require('node:zlib');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const assets = {};
for (const [name, type] of [
  ['index.html', 'text/html; charset=utf-8'],
  ['app.js', 'text/javascript; charset=utf-8'],
  ['auth.js', 'text/javascript; charset=utf-8'],
  ['account.js', 'text/javascript; charset=utf-8'],
  ['config.js', 'text/javascript; charset=utf-8'],
  ['account.css', 'text/css; charset=utf-8'],
  ['lessons.js', 'text/javascript; charset=utf-8'],
  ['style.css', 'text/css; charset=utf-8'],
  ['experience.css', 'text/css; charset=utf-8'],
  ['landing.js', 'text/javascript; charset=utf-8'],
  ['landing.css', 'text/css; charset=utf-8'],
  ['design-notes.html', 'text/html; charset=utf-8']
]) assets['/' + name] = { type, text: fs.readFileSync('dist/' + name, 'utf8') };
for(const name of ['night-v5.webp','morning-v5.webp'])assets['/assets/'+name]={type:'image/webp',base64:fs.readFileSync('dist/assets/'+name).toString('base64')};
assets['/favicon.ico'] = { type: 'image/svg+xml', text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#0b1b2b"/><path d="M45 39A23 23 0 0 1 27 12a22 22 0 1 0 18 27" fill="#d3c1fa"/></svg>' };
const packed = zlib.brotliCompressSync(JSON.stringify(assets), { params: {[zlib.constants.BROTLI_PARAM_QUALITY]:11} }).toString('base64');
const code = `// Generated from dist by scripts/build-railway.cjs. Do not edit encoded data.
const assets = JSON.parse(require('node:zlib').brotliDecompressSync(Buffer.from('${packed}', 'base64')).toString('utf8'));
const server = Bun.serve({
  hostname: '0.0.0.0',
  port: Number(Bun.env.PORT || 8080),
  fetch(req) {
    if (!['GET','HEAD'].includes(req.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    let path;
    try { path = decodeURIComponent(new URL(req.url).pathname); } catch { return new Response('Bad request',{status:400}); }
    if (path === '/health') return new Response(req.method === 'HEAD' ? null : 'ok');
    const key = path === '/' ? '/index.html' : path;
    if (!Object.hasOwn(assets,key)) return new Response('Not found',{status:404});
    const asset = assets[key];
    const body = asset.base64 ? Buffer.from(asset.base64,'base64') : asset.text;
    return new Response(req.method === 'HEAD' ? null : body,{headers:{'Content-Type':asset.type,'Cache-Control':asset.type.startsWith('text/')?'no-cache':'public, max-age=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
  }
});
console.log('SleepThrough ready on port ' + server.port);
`;
assert(Buffer.byteLength(code) < 96 * 1024, 'Railway Function exceeds 96 KB');
let handler;
vm.runInNewContext(code, { require:id=>{assert.equal(id,'node:zlib');return zlib;},Bun: { env: { PORT: '8080' }, serve: s => { handler = s.fetch; return { port: s.port }; } }, Buffer, TextDecoder, URL, Response, console });
(async () => {
  for (const route of ['/', ...Object.keys(assets), '/health']) {
    const result = handler(new Request('http://localhost' + route));
    assert.equal(result.status, 200, route);
    assert((await result.arrayBuffer()).byteLength > 0, route);
  }
  assert.equal(handler(new Request('http://localhost/missing')).status, 404);
  assert.equal(handler(new Request('http://localhost/', { method: 'POST' })).status, 405);
  assert.equal((await handler(new Request('http://localhost/', { method: 'HEAD' })).text()).length, 0);
  fs.mkdirSync('build', { recursive: true });
  fs.writeFileSync('build/railway-function.ts', code);
  console.log('PASS: generated Function routes and methods. Bytes:', Buffer.byteLength(code));
})();
