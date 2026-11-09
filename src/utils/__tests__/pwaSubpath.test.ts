import fs from 'fs';
import path from 'path';
import { assert, describe } from './testHelper';

describe('1. فحص index.html والتأكد من خلوه من أي مسارات جذرية مطلقة', () => {
  const projectRoot = process.cwd();
  const indexHtmlContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');

  assert.equal(indexHtmlContent.includes('href="/mofakkira-icon.svg"'), false);
  assert.equal(indexHtmlContent.includes('src="/src/main.tsx"'), false);
  assert.equal(indexHtmlContent.includes('href="./mofakkira-icon.svg"'), true);
  assert.equal(indexHtmlContent.includes('src="./src/main.tsx"'), true);
  assert.equal(indexHtmlContent.includes('href="./manifest.json"'), true);
});

describe('2. فحص manifest.json والروابط النسبية', () => {
  const projectRoot = process.cwd();
  const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/manifest.json'), 'utf-8'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  for (const icon of manifest.icons) {
    assert.equal(icon.src.startsWith('./'), true, `Icon src must be relative: ${icon.src}`);
  }
});

describe('3. فحص public/sw.js والنطاق الديناميكي للخدمة', () => {
  const projectRoot = process.cwd();
  const swContent = fs.readFileSync(path.join(projectRoot, 'public/sw.js'), 'utf-8');
  assert.equal(swContent.includes('self.registration.scope'), true);
  assert.equal(swContent.includes('offline'), true);
});
