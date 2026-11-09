import http from 'http';
import fs from 'fs';
import path from 'path';
import { assert, describe } from './testHelper';

const PORT = 4173;
const SUBPATH = '/mofakira';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Create lightweight server serving dist files under /mofakira
import { execSync } from 'child_process';

// Ensure dist directory exists before running server test
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('dist directory not found; building production bundle for subpath testing...');
  execSync('npm run build', { stdio: 'inherit' });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url || '/';

  if (!urlPath.startsWith(SUBPATH)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found outside subpath');
    return;
  }

  // Remove SUBPATH prefix to get relative dist path
  let relativePath = urlPath.slice(SUBPATH.length);
  if (relativePath === '' || relativePath === '/') {
    relativePath = '/index.html';
  }

  // Direct SPA fallback: if not a file with extension, serve index.html
  let filePath = path.join(DIST_DIR, relativePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // Content type mapping
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
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
    describe('1. فحص استجابة الخادم للمسار الفرعي /mofakira/ وجلب index.html', async () => {
      const rootRes = await fetchSubpath('/');
      assert.equal(rootRes.status, 200);
      assert.ok(rootRes.contentType?.includes('text/html'));
      assert.ok(rootRes.body.includes('مفكرة الإدارة التربوية'));
      assert.ok(rootRes.body.includes('./assets/index-'));
    });

    describe('2. فحص استجابة واسترجاع الأيقونة الرسمية تحت المسار الفرعي /mofakira/mofakkira-icon.svg', async () => {
      const iconRes = await fetchSubpath('/mofakkira-icon.svg');
      assert.equal(iconRes.status, 200);
      assert.ok(iconRes.contentType?.includes('image/svg+xml'));
      assert.ok(iconRes.body.includes('<svg'));
    });

    describe('3. فحص استجابة واسترجاع ملف PWA manifest تحت المسار الفرعي /mofakira/manifest.json', async () => {
      const manifestRes = await fetchSubpath('/manifest.json');
      assert.equal(manifestRes.status, 200);
      assert.ok(manifestRes.contentType?.includes('application/json'));
      const manifestJson = JSON.parse(manifestRes.body);
      assert.equal(manifestJson.start_url, './');
      assert.equal(manifestJson.scope, './');
    });

    describe('4. فحص استجابة ملف Service Worker تحت المسار الفرعي /mofakira/sw.js', async () => {
      const swRes = await fetchSubpath('/sw.js');
      assert.equal(swRes.status, 200);
      assert.ok(swRes.body.includes('self.registration.scope'));
      assert.ok(swRes.body.includes('mofakira-cache'));
    });

    describe('5. فحص إعادة التحميل المباشر للمسارات الداخلية (Direct SPA Refresh / Deep Link)', async () => {
      const deepLinkRes = await fetchSubpath('/tasks');
      assert.equal(deepLinkRes.status, 200);
      assert.ok(deepLinkRes.contentType?.includes('text/html'));
      assert.ok(deepLinkRes.body.includes('مفكرة الإدارة التربوية'));
    });

    console.log('\n✓ جميع اختبارات المسار الفرعي PWA /mofakira/ نجحت بامتياز على خادم حقيقي!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('فشل في اختبار الاستضافة تحت المسار الفرعي:', err);
    server.close();
    process.exit(1);
  }
});
