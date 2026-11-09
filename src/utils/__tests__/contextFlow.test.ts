import type { Meeting, MeetingDecision, Task } from '../../types';
import { buildDecisionTaskPayload } from '../decisionConversion';

console.log('--- اختبار التدفق الكامل لتحويل القرارات إلى مهام (AppContext Flow Simulation) ---');

// Mock state and store simulating AppContext methods
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

// 1. إعداد اجتماع وقرار تجريبي
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

// 2. تجربة التحويل للمرة الأولى
const firstConversion = mockConvertDecisionToTask('meet-101', testMeeting.decisions[0]);
console.assert(firstConversion.success === true, 'First conversion must succeed');
console.assert(tasksStore.length === 1, 'Task should be created in tasksStore');
console.assert(tasksStore[0].title === initialDecision.decisionText, 'Task title should match decision text');
console.assert(tasksStore[0].meetingId === 'meet-101', 'Task must link to meetingId');
console.assert(tasksStore[0].decisionId === 'dec-101', 'Task must link to decisionId');
console.assert(testMeeting.decisions[0].convertedTaskId === firstConversion.taskId, 'Decision convertedTaskId must be updated');
console.assert(testMeeting.decisions[0].status === 'قيد التنفيذ', 'Decision status must transition to "قيد التنفيذ"');
console.log('✓ التحويل الأول نجح: تم إنشاء المهمة، وتوثيق الربط التبادلي، وتحديث حالة القرار إلى قيد التنفيذ.');

// 3. تجربة النقر المكرر أو إعادة المحاولة على نفس القرار (Duplicate Attempt)
const duplicateConversion = mockConvertDecisionToTask('meet-101', testMeeting.decisions[0]);
console.assert(duplicateConversion.success === undefined && duplicateConversion.error !== undefined, 'Duplicate conversion must be rejected');
console.assert(tasksStore.length === 1, 'No duplicate tasks should be created');
console.log('✓ تم منع التحويل المكرر بنجاح وحماية جدول المهام من التكرار:', duplicateConversion.error);
