import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { preview } from 'vite';
import { assert, describe } from './testHelper';

const PORT = 4173;
const BASE = '/mofakira/';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Ensure production dist build exists
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('Building production bundle for subpath verification...');
  execSync('npm run build', { stdio: 'inherit' });
}

const fetchUrl = (fullPath: string): Promise<{ status: number; contentType?: string; body: string }> => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${fullPath}`, (res) => {
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

(async () => {
  // Launch the real Vite production preview server with base /mofakira/
  const previewServer = await preview({
    root: process.cwd(),
    base: BASE,
    preview: {
      port: PORT,
      host: 'localhost',
      strictPort: true
    }
  });

  try {
    await describe('1. استجابة خادم الإنتاج الحقيقي (Vite Preview) للمسار /mofakira/ وملف index.html والأصول الأساسية', async () => {
      const rootRes = await fetchUrl(BASE);
      assert.equal(rootRes.status, 200);
      assert.ok(rootRes.contentType?.includes('text/html'));
      assert.ok(rootRes.body.includes('مفكرة الإدارة التربوية'));
      assert.ok(rootRes.body.includes('./assets/index-'));
    });

    await describe('2. استرجاع الأيقونة الرسمية والأصول تحت المسار الفرعي /mofakira/mofakkira-icon.svg عبر Vite Preview', async () => {
      const iconRes = await fetchUrl(`${BASE}mofakkira-icon.svg`);
      assert.equal(iconRes.status, 200);
      assert.ok(iconRes.contentType?.includes('image/svg+xml'));
      assert.ok(iconRes.body.includes('<svg'));
    });

    await describe('3. استرجاع ملف PWA manifest والتحقق من start_url و scope عبر Vite Preview', async () => {
      const manifestRes = await fetchUrl(`${BASE}manifest.json`);
      assert.equal(manifestRes.status, 200);
      assert.ok(manifestRes.contentType?.includes('application/json'));
      const manifestJson = JSON.parse(manifestRes.body);
      assert.equal(manifestJson.start_url, './');
      assert.equal(manifestJson.scope, './');
      assert.ok(manifestJson.icons.length >= 2);
    });

    await describe('4. فحص استجابة Service Worker وعمل آليات الكاش والعمل دون اتصال (sw.js) عبر Vite Preview', async () => {
      const swRes = await fetchUrl(`${BASE}sw.js`);
      assert.equal(swRes.status, 200);
      assert.ok(swRes.body.includes('self.registration.scope'));
      assert.ok(swRes.body.includes('mofakira-cache'));
      assert.ok(swRes.body.includes('caches.match'));
    });

    await describe('5. فحص إعادة التحميل المباشر للمسارات الداخلية (Direct SPA Refresh & Deep Link) دون 404 في Vite Preview', async () => {
      const tasksRouteRes = await fetchUrl(`${BASE}tasks`);
      assert.equal(tasksRouteRes.status, 200);
      assert.ok(tasksRouteRes.contentType?.includes('text/html'));
      assert.ok(tasksRouteRes.body.includes('مفكرة الإدارة التربوية'));

      const operationsRouteRes = await fetchUrl(`${BASE}operations`);
      assert.equal(operationsRouteRes.status, 200);
      assert.ok(operationsRouteRes.contentType?.includes('text/html'));
    });

    await describe('6. فحص جلب حزم JavaScript المبنية تحت assets وتوافق MIME Type عبر Vite Preview', async () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.endsWith('.js'));
      assert.ok(jsFile, 'Compiled JS bundle must exist');

      const jsRes = await fetchUrl(`${BASE}assets/${jsFile}`);
      assert.equal(jsRes.status, 200);
      assert.ok(
        jsRes.contentType?.includes('javascript'),
        `Expected JavaScript MIME type, received: ${jsRes.contentType}`
      );
    });

    await previewServer.close();
    process.exit(0);
  } catch (err) {
    console.error('فشل في اختبار خادم Vite Preview للمسار الفرعي:', err);
    await previewServer.close();
    process.exit(1);
  }
})();
