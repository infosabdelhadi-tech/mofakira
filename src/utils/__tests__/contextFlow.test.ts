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
(globalThis as any).addEventListener = dom.window.addEventListener.bind(dom.window);
(globalThis as any).removeEventListener = dom.window.removeEventListener.bind(dom.window);
(globalThis as any).alert = (_msg: string) => {}; // silence alert in test
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock HTMLCanvasElement.getContext to support canvas-confetti cleanly in JSDOM
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
import type { Meeting, MeetingDecision } from '../../types';

describe('1. Mount and exercise real AppProvider with live component and real Context operations', async () => {
  localStorage.clear();

  // Test Consumer Component that captures real context methods and values
  let contextValue: any = null;

  const TestConsumer: React.FC = () => {
    const app = useApp();
    contextValue = app;
    return React.createElement('div', { id: 'test-node' }, 'Tasks count: ' + app.tasks.length);
  };

  const container = document.getElementById('root')!;
  const root = createRoot(container);

  // Mount real AppProvider
  await act(async () => {
    root.render(
      React.createElement(AppProvider, null, React.createElement(TestConsumer))
    );
  });

  assert.ok(contextValue, 'AppContext value must be captured from real AppProvider');
  assert.equal(contextValue!.tasks.length, 0, 'Clean initial run must have 0 tasks');
  assert.equal(contextValue!.meetings.length, 0, 'Clean initial run must have 0 meetings');

  // Step 2: Add a real Meeting via context
  const targetDecision: MeetingDecision = {
    id: 'dec-real-101',
    decisionText: 'برمجة حصص الدعم التربوي المركز لمستويات التعليم الابتدائي',
    responsible: 'السيد المدير + الفريق التربوي',
    deadline: '2026-09-25',
    status: 'قيد الانتظار'
  };

  const meetingPayload: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'اجتماع المجلس التربوي الافتتاحي',
    type: 'المجلس التربوي',
    date: '2026-09-15',
    time: '16:00 - 18:00',
    location: 'مكتب الإدارة',
    attendees: 'أعضاء المجلس التربوي',
    agenda: ['تقويم المستلزمات وتوزيع الدعم'],
    discussionPoints: 'مناقشة نتائج التقويم التشخيصي',
    decisions: [targetDecision],
    minutes: 'محضر رسمي رقم 1',
    academicYear: '2026 - 2027'
  };

  await act(async () => {
    contextValue!.addMeeting(meetingPayload);
  });

  // Verify Meeting in state and localStorage
  assert.equal(contextValue!.meetings.length, 1);
  const createdMeeting = contextValue!.meetings[0];
  assert.equal(createdMeeting.title, meetingPayload.title);
  assert.equal(createdMeeting.decisions.length, 1);

  const storedMeetings: Meeting[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEETINGS) || '[]');
  assert.equal(storedMeetings.length, 1);
  assert.equal(storedMeetings[0].title, meetingPayload.title);

  // Step 3: Convert Decision to Task via real context convertDecisionToTask
  await act(async () => {
    contextValue!.convertDecisionToTask(createdMeeting.id, createdMeeting.decisions[0]);
  });

  // Verify real Task creation and bidirectional linking
  assert.equal(contextValue!.tasks.length, 1, 'One task should be created from the decision');
  const createdTask = contextValue!.tasks[0];
  assert.equal(createdTask.title, targetDecision.decisionText);
  assert.equal(createdTask.meetingId, createdMeeting.id, 'Task must link back to meetingId');
  assert.equal(createdTask.decisionId, targetDecision.id, 'Task must link back to decisionId');
  assert.equal(createdTask.status, 'قيد التنفيذ', 'Created task should start in progress');

  // Verify Meeting decision status and convertedTaskId updated
  const updatedMeeting = contextValue!.meetings[0];
  assert.equal(updatedMeeting.decisions[0].status, 'قيد التنفيذ', 'Decision status must transition to قيد التنفيذ');
  assert.equal(updatedMeeting.decisions[0].convertedTaskId, createdTask.id, 'Decision must store convertedTaskId');

  // Verify real localStorage persistence
  const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  assert.equal(storedTasks.length, 1);
  assert.equal(storedTasks[0].id, createdTask.id);
  assert.equal(storedTasks[0].decisionId, targetDecision.id);

  const storedMeetingsAfter = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEETINGS) || '[]');
  assert.equal(storedMeetingsAfter[0].decisions[0].convertedTaskId, createdTask.id);
  assert.equal(storedMeetingsAfter[0].decisions[0].status, 'قيد التنفيذ');

  // Step 4: Duplicate click protection test on real AppContext
  await act(async () => {
    contextValue!.convertDecisionToTask(createdMeeting.id, updatedMeeting.decisions[0]);
  });

  // Verify no duplicate tasks created in state or localStorage
  assert.equal(contextValue!.tasks.length, 1, 'Duplicate conversion must not create a second task');
  const storedTasksAfterDuplicate = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  assert.equal(storedTasksAfterDuplicate.length, 1);

  // Clean unmount
  await act(async () => {
    root.unmount();
  });
});
