import { describe, assert } from './testHelper';

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, val: string) => { storageMock[key] = val; },
  removeItem: (key: string) => { delete storageMock[key]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

import {
  loadFromStorage,
  getInitialTasks,
  getInitialProfile,
  getInitialAppointments,
  STORAGE_KEYS
} from '../storage';

const runTests = async () => {
  await describe('1. معالجة JSON معطوب دون انهيار وإرجاع القيمة الافتراضية', () => {
    localStorage.setItem('test_corrupt', '{ corrupted json content ... ');
    const result = loadFromStorage('test_corrupt', ['safe_fallback']);
    assert.deepEqual(result, ['safe_fallback']);
  });

  await describe('2. معالجة القيمة "null" المحفوظة في localStorage بأمان', () => {
    localStorage.setItem('test_null', 'null');
    const result = loadFromStorage('test_null', { status: 'default' });
    assert.deepEqual(result, { status: 'default' });
  });

  await describe('3. معالجة القيمة "undefined" المحفوظة في localStorage بأمان', () => {
    localStorage.setItem('test_undef', 'undefined');
    const result = loadFromStorage('test_undef', []);
    assert.deepEqual(result, []);
  });

  await describe('4. استعادة المهام عند وجود كائن غير مصفوفة دون فقدان الأمان', () => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify({ notAnArray: true }));
    const tasks = getInitialTasks();
    assert.equal(Array.isArray(tasks), true);
    assert.equal(tasks.length, 0);
  });

  await describe('5. استعادة المواعيد عند تخزين قيمة نصية مشوهة', () => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, '"corrupted_string_value"');
    const appointments = getInitialAppointments();
    assert.equal(Array.isArray(appointments), true);
    assert.equal(appointments.length, 0);
  });

  await describe('6. استعادة بطاقة المؤسسة عند تخزين مصفوفة بدلاً من كائن', () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify([1, 2, 3]));
    const profile = getInitialProfile();
    assert.equal(typeof profile, 'object');
    assert.equal(typeof profile.schoolName, 'string');
    assert.equal(typeof profile.principalName, 'string');
  });

  await describe('7. الحفاظ الكامل على مهام المستخدم الحقيقية دون أي تشويه', () => {
    const customTasks = [
      {
        id: 't-123',
        title: 'مهمة فعلية للمدير',
        description: 'وصف المهمة',
        category: 'الإدارة والتدبير' as const,
        priority: 'عاجلة جداً' as const,
        status: 'قيد التنفيذ' as const,
        dueDate: '2025-06-15',
        completionPercentage: 50
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(customTasks));
    const loaded = getInitialTasks();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].title, 'مهمة فعلية للمدير');
  });
};

runTests();
