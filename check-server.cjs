const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('./server.cjs');
const server = createServer();
function request(port, requestPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: requestPath, method }, res => {
      const chunks = [];
      res.on('data', b => chunks.push(b));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject); req.end();
  });
}
server.listen(0, '127.0.0.1', async () => {
  try {
    const port = server.address().port;
    for (const file of ['/', '/app.js?v=test', '/lessons.js', '/activities.js', '/activities.css', '/quiz-visual.js', '/quiz-visual.css', '/assets/quiz-room.svg', '/style.css', '/experience.css', '/design-notes.html', '/assets/night-waking.webp', '/health']) {
      const result = await request(port, file);
      assert.equal(result.status, 200, file);
      assert(result.body.length > 0, file);
    }
    const home = await request(port, '/');
    assert(home.body.toString().includes('SleepThrough'));
    assert.equal((await request(port, '/', 'HEAD')).body.length, 0);
    assert.equal((await request(port, '/', 'POST')).status, 405);
    for (const file of ['/missing', '/%2e%2e%2fpackage.json', '/.git/config', '/server.cjs']) assert.equal((await request(port, file)).status, 404, file);
    assert.equal((await request(port, '/%00')).status, 400);
    assert.equal((await request(port, '/style.css')).headers['content-type'], 'text/css; charset=utf-8');
    console.log('PASS: HTTP assets, query strings, health, HEAD, 404, 405 and private-path isolation.');
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); }
});
