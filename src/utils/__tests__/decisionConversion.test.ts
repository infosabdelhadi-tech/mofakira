import { buildDecisionTaskPayload } from '../decisionConversion';
import type { Meeting, MeetingDecision } from '../../types';

console.log('--- اختبار الوظيفة الحقيقية المشتركة لتحويل قرارات المجالس إلى مهام ---');

const mockMeeting: Meeting = {
  id: 'meet-101',
  title: 'المجلس التربوي - دورة شتنبر',
  type: 'المجلس التربوي',
  date: '2026-09-05',
  time: '16:00 - 18:00',
  location: 'مكتب الإدارة',
  attendees: 'السيد المدير + منسقو المواد',
  agenda: ['تقويم المستلزمات'],
  discussionPoints: 'مناقشة خطة الدعم',
  minutes: 'محضر الاجتماع',
  decisions: [],
  academicYear: '2026 - 2027',
  createdAt: '2026-09-05',
  updatedAt: '2026-09-05'
};

const fixedToday = new Date('2026-09-05T10:00:00Z');

// 1. اختبار استحقاق قريب جداً (خلال يومين) -> أولوية "عاجلة جداً"
const urgentDecision: MeetingDecision = {
  id: 'dec-1',
  decisionText: 'إرسال لوائح المستفيدين من منحة تيسير للإقليم',
  responsible: 'الحارس العام',
  deadline: '2026-09-07', // 2 days diff
  status: 'قيد الانتظار'
};

const res1 = buildDecisionTaskPayload(mockMeeting, urgentDecision, 'ذ. عبد الرحيم', fixedToday);
console.assert(res1.success === true, 'buildDecisionTaskPayload failed for urgent decision');
console.assert(res1.taskPayload?.priority === 'عاجلة جداً', `Expected عاجلة جداً, got ${res1.taskPayload?.priority}`);
console.assert(res1.taskPayload?.meetingId === 'meet-101', 'Meeting ID link missing');
console.assert(res1.taskPayload?.decisionId === 'dec-1', 'Decision ID link missing');
console.assert(res1.taskPayload?.assignedTo === 'الحارس العام', 'Assigned person mismatch');
console.log('✓ تم حساب الأولوية العاجلة جداً والربط المزدوج بنجاح:', res1.taskPayload?.priority);

// 2. اختبار استحقاق مريح (أكثر من 10 أيام) -> أولوية "متوسطة"
const mediumDecision: MeetingDecision = {
  id: 'dec-2',
  decisionText: 'صياغة التقرير التركيبي للتقويم التشخيصي',
  responsible: 'المنسق التربوي',
  deadline: '2026-09-25', // 20 days diff
  status: 'قيد الانتظار'
};

const res2 = buildDecisionTaskPayload(mockMeeting, mediumDecision, 'ذ. عبد الرحيم', fixedToday);
console.assert(res2.success === true);
console.assert(res2.taskPayload?.priority === 'متوسطة', `Expected متوسطة, got ${res2.taskPayload?.priority}`);
console.log('✓ تم حساب الأولوية المتوسطة بنجاح:', res2.taskPayload?.priority);

// 3. اختبار منع تكرار التحويل (Duplicate Prevention)
const alreadyConvertedDecision: MeetingDecision = {
  id: 'dec-3',
  decisionText: 'إعداد جدول الحصص النهائي',
  responsible: 'السيد المدير',
  deadline: '2026-09-08',
  status: 'قيد التنفيذ',
  convertedTaskId: 'task-already-exists-999'
};

const res3 = buildDecisionTaskPayload(mockMeeting, alreadyConvertedDecision, 'ذ. عبد الرحيم', fixedToday);
console.assert(res3.success === false, 'Duplicate conversion should return success: false');
console.assert(Boolean(res3.error), 'Expected error message for duplicate conversion');
console.log('✓ تم رفض ومنع تكرار التحويل بنجاح:', res3.error);
