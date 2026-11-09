import { JSDOM } from 'jsdom';

// Initialize DOM environment for React 19 execution
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/'
});

(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true
});
(globalThis as any).alert = (_msg: string) => {};
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};
dom.window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
  get: () => noop
}) as any;

// Mock localStorage backed by Map
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size; },
  key: (i: number) => Array.from(storageMap.keys())[i] || null
};

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { assert, describe } from './testHelper';
import { AppProvider, useApp } from '../../context/AppContext';
import { STORAGE_KEYS } from '../storage';

(async () => {
  await describe('1. اختبار حفظ واستعادة إعدادات الوضع الليلي والنهاري في LocalStorage', async () => {
    localStorage.clear();

    let contextValue: any = null;

    const TestConsumer: React.FC = () => {
      const app = useApp();
      contextValue = app;
      return React.createElement('div', null, 'theme: ' + (app.isDarkMode ? 'dark' : 'light'));
    };

    const container1 = document.createElement('div');
    document.body.appendChild(container1);
    const root1 = createRoot(container1);

    await act(async () => {
      root1.render(
        React.createElement(AppProvider, null, React.createElement(TestConsumer))
      );
    });

    // Default is light if storage empty
    assert.equal(contextValue.isDarkMode, false);
    assert.equal(document.documentElement.classList.contains('dark'), false);

    // Toggle to dark mode
    await act(async () => {
      contextValue.toggleDarkMode();
    });

    assert.equal(contextValue.isDarkMode, true);
    assert.equal(localStorage.getItem(STORAGE_KEYS.THEME), 'dark');
    assert.equal(document.documentElement.classList.contains('dark'), true);

    // Toggle back to light mode
    await act(async () => {
      contextValue.toggleDarkMode();
    });

    assert.equal(contextValue.isDarkMode, false);
    assert.equal(localStorage.getItem(STORAGE_KEYS.THEME), 'light');
    assert.equal(document.documentElement.classList.contains('dark'), false);

    await act(async () => {
      root1.unmount();
    });
    container1.remove();
  });

  await describe('2. اختبار تخصيص هوية المؤسسة التعليمية وحفظها في التخزين المحلي', async () => {
    localStorage.clear();

    let contextValue: any = null;

    const TestConsumer: React.FC = () => {
      const app = useApp();
      contextValue = app;
      return React.createElement('div', null, app.schoolProfile.schoolName);
    };

    const container2 = document.createElement('div');
    document.body.appendChild(container2);
    const root2 = createRoot(container2);

    await act(async () => {
      root2.render(
        React.createElement(AppProvider, null, React.createElement(TestConsumer))
      );
    });

    const updatedProfile = {
      ...contextValue.schoolProfile,
      schoolName: 'مؤسسة النور التعليمية',
      principalName: 'ذ. محمد العلمي',
      academy: 'أكاديمية فاس مكناس',
      directorate: 'مديرية فاس'
    };

    await act(async () => {
      contextValue.updateSchoolProfile(updatedProfile);
    });

    assert.equal(contextValue.schoolProfile.schoolName, 'مؤسسة النور التعليمية');
    assert.equal(contextValue.schoolProfile.principalName, 'ذ. محمد العلمي');

    const storedProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{}');
    assert.equal(storedProfile.schoolName, 'مؤسسة النور التعليمية');
    assert.equal(storedProfile.principalName, 'ذ. محمد العلمي');

    await act(async () => {
      root2.unmount();
    });
    container2.remove();
  });
})();
