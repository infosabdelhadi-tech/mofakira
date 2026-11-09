import { assert, describe } from './testHelper';
import type { Meeting, MeetingDecision } from '../../types';
import { buildDecisionTaskPayload } from '../decisionConversion';

const sampleMeeting: Meeting = {
  id: 'meet-1',
  title: 'اجتماع مجلس التدبير الاستثنائي',
  type: 'مجلس التدبير',
  date: '2026-09-10',
  time: '16:00',
  location: 'مكتب الإدارة',
  attendees: 'أعضاء المجلس',
  agenda: ['صيانة القاعات'],
  discussionPoints: 'مناقشة الصيانة',
  decisions: [],
  minutes: 'محضر رسمي',
  academicYear: '2026 - 2027',
  createdAt: '2026-09-10',
  updatedAt: '2026-09-10'
};

describe('1. حساب الأولوية العاجلة جداً عند اقتراب الأجل (3 أيام أو أقل)', () => {
  const decisionUrgent: MeetingDecision = {
    id: 'dec-1',
    decisionText: 'إصلاح عطب كهربائي فوري',
    responsible: 'الحارس العام',
    deadline: '2026-09-12',
    status: 'قيد الانتظار'
  };

  const refDate = new Date('2026-09-10T10:00:00Z');
  const res = buildDecisionTaskPayload(sampleMeeting, decisionUrgent, 'ذ. المدير', refDate);

  assert.equal(res.success, true);
  assert.ok(res.taskPayload);
  assert.equal(res.taskPayload?.priority, 'عاجلة جداً');
  assert.equal(res.taskPayload?.meetingId, 'meet-1');
  assert.equal(res.taskPayload?.decisionId, 'dec-1');
  assert.equal(res.taskPayload?.assignedTo, 'الحارس العام');
});

describe('2. حساب الأولوية المتوسطة عند بعد الأجل (> 10 أيام)', () => {
  const decisionNormal: MeetingDecision = {
    id: 'dec-2',
    decisionText: 'إعداد مجلة الحائط المدرسية',
    responsible: '',
    deadline: '2026-09-30',
    status: 'قيد الانتظار'
  };

  const refDate = new Date('2026-09-10T10:00:00Z');
  const res = buildDecisionTaskPayload(sampleMeeting, decisionNormal, 'ذ. المدير', refDate);

  assert.equal(res.success, true);
  assert.ok(res.taskPayload);
  assert.equal(res.taskPayload?.priority, 'متوسطة');
  assert.equal(res.taskPayload?.assignedTo, 'ذ. المدير');
});

describe('3. منع التحويل المكرر للقرار المحول مسبقاً', () => {
  const decisionConverted: MeetingDecision = {
    id: 'dec-3',
    decisionText: 'تجديد الستائر',
    responsible: 'المدير',
    deadline: '2026-09-25',
    status: 'قيد التنفيذ',
    convertedTaskId: 'task-already-exists-123'
  };

  const res = buildDecisionTaskPayload(sampleMeeting, decisionConverted, 'ذ. المدير');
  assert.equal(res.success, false);
  assert.match(res.error || '', /تم تحويل هذا القرار مسبقاً/);
});
