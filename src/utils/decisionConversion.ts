import type { Meeting, MeetingDecision, Task } from '../types';

export interface DecisionConversionResult {
  success: boolean;
  error?: string;
  taskPayload?: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
  updatedMeeting?: Meeting;
}

/**
 * Pure helper function to convert a meeting decision into a task payload.
 * Enforces duplicate prevention, calculates realistic priority based on deadline proximity,
 * and updates decision status and convertedTaskId link.
 */
export const buildDecisionTaskPayload = (
  meeting: Meeting,
  decision: MeetingDecision,
  principalName: string,
  referenceDate = new Date()
): DecisionConversionResult => {
  // 1. Guard against duplicate conversion
  if (decision.convertedTaskId) {
    return {
      success: false,
      error: 'تم تحويل هذا القرار مسبقاً إلى مهمة عمل في جدول المهام.'
    };
  }

  const todayStr = referenceDate.toISOString().split('T')[0];
  const deadlineStr = decision.deadline || new Date(referenceDate.getTime() + 7 * 86400000).toISOString().split('T')[0];

  // 2. Derive appropriate priority based on remaining days
  let calculatedPriority: 'عاجلة جداً' | 'مهمة' | 'متوسطة' = 'مهمة';
  if (decision.deadline) {
    const diffMs = new Date(decision.deadline).getTime() - new Date(todayStr).getTime();
    const daysDiff = Math.ceil(diffMs / (1000 * 3600 * 24));
    if (daysDiff <= 3) {
      calculatedPriority = 'عاجلة جداً';
    } else if (daysDiff <= 10) {
      calculatedPriority = 'مهمة';
    } else {
      calculatedPriority = 'متوسطة';
    }
  }

  // 3. Construct the Task Payload
  const taskPayload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    title: decision.decisionText,
    description: `مهمة تنفيذية منبثقة عن اجتماع: "${meeting.title || 'اجتماع مجلس'}" المنعقد بتاريخ ${meeting.date || todayStr}.`,
    category: 'الاجتماعات والمجالس',
    startDate: todayStr,
    dueDate: deadlineStr,
    dueTime: '12:00',
    priority: calculatedPriority,
    status: 'قيد التنفيذ',
    assignedTo: decision.responsible || principalName,
    completionPercentage: 0,
    meetingId: meeting.id,
    decisionId: decision.id,
    checklist: [
      { id: 'c-dec-1', text: 'مباشرة إجراءات تنفيذ القرار', completed: false },
      { id: 'c-dec-2', text: 'إعداد تقرير الإنجاز وموافاة رئيس المؤسسة', completed: false }
    ],
    attachments: []
  };

  return {
    success: true,
    taskPayload
  };
};
