import fs from 'fs';
import path from 'path';

console.log('--- اختبار سلامة روابط PWA والمسار الفرعي (Subpath & PWA Integrity) ---');

const projectRoot = process.cwd();

// 1. فحص index.html والتأكد من عدم وجود مسارات جذرية مطلقة تبدأ بـ /
const indexHtmlContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
console.assert(!indexHtmlContent.includes('href="/mofakkira-icon.svg"'), 'index.html must not contain absolute icon path /mofakkira-icon.svg');
console.assert(!indexHtmlContent.includes('src="/src/main.tsx"'), 'index.html must not contain absolute src /src/main.tsx');
console.assert(indexHtmlContent.includes('href="./mofakkira-icon.svg"'), 'index.html must contain relative icon path ./mofakkira-icon.svg');
console.assert(indexHtmlContent.includes('src="./src/main.tsx"'), 'index.html must contain relative script path ./src/main.tsx');
console.assert(indexHtmlContent.includes('href="./manifest.json"'), 'index.html must contain relative manifest link ./manifest.json');
console.log('✓ index.html يستخدم مسارات نسبية متوافقة تماماً مع المسارات الفرعية والجذرية.');

// 2. فحص manifest.json
const manifestContent = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/manifest.json'), 'utf-8'));
console.assert(manifestContent.start_url === './', 'manifest.json start_url must be relative "./"');
console.assert(manifestContent.scope === './', 'manifest.json scope must be relative "./"');
manifestContent.icons.forEach((icon: any) => {
  console.assert(icon.src.startsWith('./'), `manifest icon src must be relative: ${icon.src}`);
});
console.log('✓ manifest.json مهيأ بروابط نسبية (start_url, scope, icons) ليعمل بسلاسة تحت /mofakira/.');

// 3. فحص public/sw.js
const swContent = fs.readFileSync(path.join(projectRoot, 'public/sw.js'), 'utf-8');
console.assert(swContent.includes('self.registration.scope'), 'Service worker must use self.registration.scope to handle subpaths');
console.assert(swContent.includes('offline'), 'Service worker must handle offline fallback');
console.log('✓ Service Worker مهيأ لاستخدام نطاق التسجيل الديناميكي self.registration.scope.');
