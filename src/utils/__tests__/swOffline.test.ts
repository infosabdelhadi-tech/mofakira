import { describe, assert } from './testHelper';
import fs from 'node:fs';
import path from 'node:path';

const runTests = async () => {
  const swPath = path.resolve(process.cwd(), 'public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');

  await describe('1. التحقق من إصدار الكاش 3.0 للانتقال النظيف', () => {
    assert.match(swContent, /mofakira-cache-v3\.0/);
  });

  await describe('2. التحقق من التمييز الدقيق لطلبات navigate حصراً لتقديم index.html', () => {
    assert.match(swContent, /event\.request\.mode\s*===\s*'navigate'/);
  });

  await describe('3. ضمان عدم إرجاع index.html لطلبات ملفات JS/CSS لتفادي الشاشة البيضاء', () => {
    // In the asset fetch catch block (or static asset respondWith), verify it returns 404 rather than index.html
    const assetSection = swContent.slice(swContent.indexOf('// 2. Static Assets'));
    const catchIndex = assetSection.indexOf('.catch((fetchErr)');
    const catchCode = assetSection.slice(catchIndex).replace(/\/\/.*$/gm, ''); // strip comments
    assert.ok(!catchCode.includes('index.html'), 'Static asset catch handler must not return index.html on failure');
    assert.ok(catchCode.includes('404'), 'Static asset handler should return 404 on network failure');
  });

  await describe('4. حذف الإصدارات القديمة من الكاش عند التفعيل', () => {
    assert.match(swContent, /caches\.delete\(key\)/);
  });

  await describe('5. استلام العملاء فورياً self.clients.claim() لتسهيل إعادة التشغيل', () => {
    assert.match(swContent, /self\.clients\.claim\(\)/);
  });
};

runTests();
