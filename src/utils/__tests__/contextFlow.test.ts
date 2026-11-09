import { assert, describe } from './testHelper';
import type { Meeting, MeetingDecision, Task } from '../../types';
import { buildDecisionTaskPayload } from '../decisionConversion';

let tasksStore: Task[] = [];
let meetingsStore: Meeting[] = [];

const mockAddTask = (payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): string => {
  const newId = 'task-conv-' + Date.now();
  const newTask: Task = {
    ...payload,
    id: newId,
    createdAt: '2026-09-15',
    updatedAt: '2026-09-15'
  };
  tasksStore.push(newTask);
  return newId;
};

const mockConvertDecisionToTask = (meetingId: string, decision: MeetingDecision) => {
  const meeting = meetingsStore.find(m => m.id === meetingId);
  if (!meeting) return { error: 'Meeting not found' };

  // Double check in state to prevent race conditions or repeated clicks
  const currentDecision = meeting.decisions.find(d => d.id === decision.id);
  if (currentDecision?.convertedTaskId) {
    return { error: 'تم تحويل هذا القرار مسبقاً إلى مهمة عمل في جدول المهام.' };
  }

  const result = buildDecisionTaskPayload(meeting, decision, 'ذ. هشام التازي');
  if (!result.success || !result.taskPayload) {
    return { error: result.error };
  }

  const taskId = mockAddTask(result.taskPayload);

  // Update meeting state
  meeting.decisions = meeting.decisions.map(d =>
    d.id === decision.id ? { ...d, convertedTaskId: taskId, status: 'قيد التنفيذ' } : d
  );

  return { success: true, taskId };
};

describe('اختبار التدفق الكامل لتحويل القرارات إلى مهام في AppContext', () => {
  const initialDecision: MeetingDecision = {
    id: 'dec-101',
    decisionText: 'صياغة مشروع النظام الداخلي للمؤسسة وعرضه للمصادقة',
    responsible: 'السيد المدير + لجنة الصياغة',
    deadline: '2026-09-20',
    status: 'قيد الانتظار'
  };

  const testMeeting: Meeting = {
    id: 'meet-101',
    title: 'اجتماع مجلس التدبير الافتتاحي',
    type: 'مجلس التدبير',
    date: '2026-09-15',
    time: '15:00 - 17:00',
    location: 'قاعة الاجتماعات',
    attendees: 'أعضاء المجلس',
    agenda: ['النظام الداخلي'],
    discussionPoints: 'مناقشة بنود النظام الداخلي',
    decisions: [initialDecision],
    minutes: 'محضر الدورة العادية لمجلس التدبير',
    academicYear: '2026 - 2027',
    createdAt: '2026-09-15',
    updatedAt: '2026-09-15'
  };

  meetingsStore = [testMeeting];
  tasksStore = [];

  // التحويل الأول
  const first = mockConvertDecisionToTask('meet-101', testMeeting.decisions[0]);
  assert.equal(first.success, true);
  assert.equal(tasksStore.length, 1);
  assert.equal(tasksStore[0].title, initialDecision.decisionText);
  assert.equal(tasksStore[0].meetingId, 'meet-101');
  assert.equal(tasksStore[0].decisionId, 'dec-101');
  assert.equal(testMeeting.decisions[0].convertedTaskId, first.taskId);
  assert.equal(testMeeting.decisions[0].status, 'قيد التنفيذ');

  // محاولة النقر المكرر
  const duplicate = mockConvertDecisionToTask('meet-101', testMeeting.decisions[0]);
  assert.equal(duplicate.success, undefined);
  assert.match(duplicate.error || '', /تم تحويل هذا القرار مسبقاً/);
  assert.equal(tasksStore.length, 1, 'Tasks store count must not increase on duplicate call');
});
