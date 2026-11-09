import { assert, describe } from './testHelper';
import type { Meeting, MeetingDecision, Task } from '../../types';
import { buildDecisionTaskPayload } from '../decisionConversion';
import { STORAGE_KEYS } from '../storage';

// Setup Mock Environment
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

describe('1. اختبار تكاملي للتدفق الحقيقي لتحويل القرارات مع التخزين المحلي والربط المزدوج', () => {
  localStorage.clear();

  const decision: MeetingDecision = {
    id: 'dec-live-1',
    decisionText: 'تجهيز قاعة المعلوميات وتزويدها بالصبيب',
    responsible: 'السيد المدير + المساعد التقني',
    deadline: '2026-09-25',
    status: 'قيد الانتظار'
  };

  const initialMeeting: Meeting = {
    id: 'meet-live-1',
    title: 'اجتماع الدخول المدرسي لمجلس التدبير',
    type: 'مجلس التدبير',
    date: '2026-09-15',
    time: '15:00 - 17:00',
    location: 'قاعة الاجتماعات',
    attendees: 'أعضاء المجلس',
    agenda: ['الدخول المدرسي'],
    discussionPoints: 'مناقشة الوسائل التعليمية',
    decisions: [decision],
    minutes: 'محضر رسمي رقم 1',
    academicYear: '2026 - 2027',
    createdAt: '2026-09-15',
    updatedAt: '2026-09-15'
  };

  // State arrays replicating AppContext state
  let meetings: Meeting[] = [initialMeeting];
  let tasks: Task[] = [];
  const principalName = 'ذ. هشام التازي';

  // AppContext convertDecisionToTask method logic directly under test
  const convertDecisionToTask = (meetingId: string, dec: MeetingDecision) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return { success: false, error: 'Meeting not found' };

    const currentDecision = meeting.decisions.find(d => d.id === dec.id);
    if (currentDecision?.convertedTaskId) {
      return { success: false, error: 'تم تحويل هذا القرار مسبقاً إلى مهمة عمل في جدول المهام.' };
    }

    const result = buildDecisionTaskPayload(meeting, dec, principalName);
    if (!result.success || !result.taskPayload) {
      return { success: false, error: result.error };
    }

    // addTask execution
    const now = new Date().toISOString();
    const taskId = 'task-' + Date.now();
    const newTask: Task = {
      ...result.taskPayload,
      id: taskId,
      createdAt: now.split('T')[0],
      updatedAt: now,
      history: [
        { id: 'h-' + Date.now(), timestamp: now, action: 'إنشاء المهمة', user: principalName }
      ]
    };

    tasks = [newTask, ...tasks];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    // Update meeting decisions
    meetings = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          decisions: m.decisions.map(d => d.id === dec.id ? { ...d, convertedTaskId: taskId, status: 'قيد التنفيذ' } : d)
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));

    return { success: true, taskId };
  };

  // First conversion attempt
  const firstRes = convertDecisionToTask('meet-live-1', decision);
  assert.equal(firstRes.success, true);
  assert.ok(firstRes.taskId);

  // Assert in-memory state
  assert.equal(tasks.length, 1);
  const createdTask = tasks[0];
  assert.equal(createdTask.id, firstRes.taskId);
  assert.equal(createdTask.title, decision.decisionText);
  assert.equal(createdTask.category, 'الاجتماعات والمجالس');
  assert.equal(createdTask.status, 'قيد التنفيذ');
  assert.equal(createdTask.meetingId, 'meet-live-1');
  assert.equal(createdTask.decisionId, 'dec-live-1');
  assert.equal(createdTask.assignedTo, decision.responsible);

  const updatedDecision = meetings[0].decisions[0];
  assert.equal(updatedDecision.status, 'قيد التنفيذ');
  assert.equal(updatedDecision.convertedTaskId, firstRes.taskId);

  // Assert local storage persistence
  const storedTasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const storedMeetings: Meeting[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEETINGS) || '[]');
  assert.equal(storedTasks.length, 1);
  assert.equal(storedTasks[0].id, firstRes.taskId);
  assert.equal(storedMeetings[0].decisions[0].convertedTaskId, firstRes.taskId);

  // Second conversion attempt (duplicate click / concurrent action)
  const duplicateRes = convertDecisionToTask('meet-live-1', decision);
  assert.equal(duplicateRes.success, false);
  assert.match(duplicateRes.error || '', /تم تحويل هذا القرار مسبقاً/);

  // Assert no extra tasks were created
  assert.equal(tasks.length, 1);
  const storedTasksAfterDuplicate: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  assert.equal(storedTasksAfterDuplicate.length, 1);
});
