import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { assert, describe } from './testHelper';

const PORT = 4173;
const SUBPATH = '/mofakira';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Ensure production dist build exists
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('Building production bundle for subpath verification...');
  execSync('npm run build', { stdio: 'inherit' });
}

// Lightweight HTTP server serving production dist under subpath /mofakira
const server = http.createServer((req, res) => {
  const urlPath = req.url || '/';

  if (!urlPath.startsWith(SUBPATH)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found outside subpath');
    return;
  }

  let relativePath = urlPath.slice(SUBPATH.length);
  if (relativePath === '' || relativePath === '/') {
    relativePath = '/index.html';
  }

  let filePath = path.join(DIST_DIR, relativePath);

  // If path is a route without file extension (SPA routing), fallback to index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err: any) {
    res.writeHead(500);
    res.end('Error loading file: ' + err.message);
  }
});

const fetchSubpath = (subUrl: string): Promise<{ status: number; contentType?: string; body: string }> => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${SUBPATH}${subUrl}`, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          contentType: res.headers['content-type'],
          body
        });
      });
    }).on('error', reject);
  });
};

server.listen(PORT, async () => {
  try {
    describe('1. استجابة المسار الفرعي /mofakira/ وملف index.html والأصول الأساسية', async () => {
      const rootRes = await fetchSubpath('/');
      assert.equal(rootRes.status, 200);
      assert.ok(rootRes.contentType?.includes('text/html'));
      assert.ok(rootRes.body.includes('مفكرة الإدارة التربوية'));
      assert.ok(rootRes.body.includes('./assets/index-'));
    });

    describe('2. استرجاع الأيقونة الرسمية تحت المسار الفرعي /mofakira/mofakkira-icon.svg', async () => {
      const iconRes = await fetchSubpath('/mofakkira-icon.svg');
      assert.equal(iconRes.status, 200);
      assert.ok(iconRes.contentType?.includes('image/svg+xml'));
      assert.ok(iconRes.body.includes('<svg'));
    });

    describe('3. استرجاع ملف PWA manifest والتحقق من start_url و scope تحت /mofakira/', async () => {
      const manifestRes = await fetchSubpath('/manifest.json');
      assert.equal(manifestRes.status, 200);
      assert.ok(manifestRes.contentType?.includes('application/json'));
      const manifestJson = JSON.parse(manifestRes.body);
      assert.equal(manifestJson.start_url, './');
      assert.equal(manifestJson.scope, './');
      assert.ok(manifestJson.icons.length >= 2);
    });

    describe('4. فحص Service Worker وعمل آليات الكاش والعمل دون اتصال (sw.js)', async () => {
      const swRes = await fetchSubpath('/sw.js');
      assert.equal(swRes.status, 200);
      assert.ok(swRes.body.includes('self.registration.scope'));
      assert.ok(swRes.body.includes('mofakira-cache'));
      assert.ok(swRes.body.includes('caches.match'));
    });

    describe('5. فحص إعادة التحميل المباشر للمسارات الداخلية (Direct SPA Refresh & Deep Link) دون 404', async () => {
      const tasksRouteRes = await fetchSubpath('/tasks');
      assert.equal(tasksRouteRes.status, 200);
      assert.ok(tasksRouteRes.contentType?.includes('text/html'));
      assert.ok(tasksRouteRes.body.includes('مفكرة الإدارة التربوية'));

      const operationsRouteRes = await fetchSubpath('/operations');
      assert.equal(operationsRouteRes.status, 200);
      assert.ok(operationsRouteRes.contentType?.includes('text/html'));
    });

    describe('6. فحص جلب حزم JavaScript المبنية تحت assets وتوافق MIME Type', async () => {
      // Find the JS bundle name from dist/assets
      const assetsDir = path.join(DIST_DIR, 'assets');
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.endsWith('.js'));
      assert.ok(jsFile, 'Compiled JS bundle must exist');

      const jsRes = await fetchSubpath(`/assets/${jsFile}`);
      assert.equal(jsRes.status, 200);
      assert.ok(jsRes.contentType?.includes('application/javascript'));
    });

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('فشل في اختبار المسار الفرعي PWA:', err);
    server.close();
    process.exit(1);
  }
});
