import { describe, assert } from './testHelper';
import fs from 'node:fs';
import path from 'node:path';

const runTests = async () => {
  const cssPath = path.resolve(process.cwd(), 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  const headerPath = path.resolve(process.cwd(), 'src/components/layout/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');

  const settingsPath = path.resolve(process.cwd(), 'src/components/settings/SettingsManager.tsx');
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');

  await describe('1. التحقق من تكوين الوضع الداكن في Tailwind v4 عبر @custom-variant dark', () => {
    assert.match(cssContent, /@custom-variant\s+dark\s+\(&:where\(\.dark,\s*\.dark\s*\*\)\);/, 'يجب تعريف dark variant بدقة للوضع الداكن');
  });

  await describe('2. إزالة قيود العرض max-w-7xl من الحاوية الرئيسية في App.tsx واستغلال 100% من الشاشة', () => {
    assert.ok(!appContent.includes('max-w-7xl'), 'App.tsx يجب ألا يحتوي على max-w-7xl');
    assert.match(appContent, /w-full\s+max-w-none/, 'الحاوية الرئيسية يجب أن تكون w-full max-w-none');
  });

  await describe('3. إزالة قيود العرض max-w-7xl من شريط الرأس Header.tsx', () => {
    assert.ok(!headerContent.includes('max-w-7xl'), 'Header.tsx يجب ألا يحتوي على max-w-7xl');
    assert.match(headerContent, /w-full\s+max-w-none/, 'شريط الرأس يجب أن يكون w-full max-w-none');
  });

  await describe('4. استغلال كامل المساحة في شاشة الإعدادات دون حصر في max-w-4xl', () => {
    assert.ok(!settingsContent.includes('max-w-4xl mx-auto'), 'SettingsManager يجب أن يستغل كامل العرض المتاح');
  });
};

runTests();
