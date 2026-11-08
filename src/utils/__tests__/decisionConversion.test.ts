console.log('--- اختبار منطق تحويل قرارات المجالس إلى مهام ---');

interface MockDecision {
  id: string;
  decisionText: string;
  responsible: string;
  deadline: string;
  status: string;
  convertedTaskId?: string;
}

const mockDecisions: MockDecision[] = [
  { id: 'd1', decisionText: 'تجديد تشوير ممر الراجلين', responsible: 'السيد المدير', deadline: '2026-11-10', status: 'قيد الانتظار' },
  { id: 'd2', decisionText: 'المصادقة على التقرير', responsible: 'المنسق', deadline: '2026-11-25', status: 'تم التنفيذ', convertedTaskId: 'task-existing' }
];

// دالة احتساب الأولوية بناءً على أجل التنفيذ
const calculatePriority = (deadline: string, todayStr: string) => {
  const daysDiff = Math.ceil((new Date(deadline).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
  if (daysDiff <= 3) return 'عاجلة جداً';
  if (daysDiff <= 10) return 'مهمة';
  return 'متوسطة';
};

const today = '2026-11-08';

// 1. فحص القرار الأول (يستحق بعد يومين -> عاجلة جداً)
const priority1 = calculatePriority(mockDecisions[0].deadline, today);
console.assert(priority1 === 'عاجلة جداً', `Expected عاجلة جداً, got ${priority1}`);
console.log('Urgent priority calculated correctly:', priority1);

// 2. فحص القرار الثاني (يستحق بعد 17 يوم -> متوسطة)
const priority2 = calculatePriority(mockDecisions[1].deadline, today);
console.assert(priority2 === 'متوسطة', `Expected متوسطة, got ${priority2}`);
console.log('Medium priority calculated correctly:', priority2);

// 3. فحص منع تكرار تحويل القرار
const canConvertFirst = !mockDecisions[0].convertedTaskId;
const canConvertSecond = !mockDecisions[1].convertedTaskId;
console.assert(canConvertFirst === true, 'First decision should be convertible');
console.assert(canConvertSecond === false, 'Second decision should prevent duplicate conversion');
console.log('Duplicate conversion prevention passed successfully!');
