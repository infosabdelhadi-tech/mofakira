import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckSquare,
  Workflow,
  Building
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';

export const ReportsManager: React.FC = () => {
  const { schoolProfile, tasks, appointments, operations, dailyNotes } = useApp();

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'tasks' | 'operations'>('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Moroccan educational header variables
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'مكتملة').length;
  const pendingTasks = tasks.filter(t => t.status !== 'مكتملة' && t.status !== 'ملغاة').length;
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'مكتملة' && t.status !== 'ملغاة').length;

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel (xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Tasks sheet
    const tasksData = tasks.map(t => ({
      'عنوان المهمة': t.title,
      'المجال': t.category,
      'الأولوية': t.priority,
      'الحالة': t.status,
      'المسؤول': t.assignedTo,
      'تاريخ البداية': t.startDate,
      'الموعد النهائي': t.dueDate,
      'نسبة الإنجاز': `${t.completionPercentage}%`
    }));
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, wsTasks, 'المهام الإدارية');

    // Operations sheet
    const opsData = operations.map(o => ({
      'اسم العملية': o.title,
      'الهدف': o.objective,
      'المجال': o.category,
      'المرجعية': o.reference,
      'المسؤول': o.responsible,
      'تاريخ الانتهاء': o.dueDate,
      'نسبة الإنجاز': `${o.progress}%`,
      'الحالة': o.status
    }));
    const wsOps = XLSX.utils.json_to_sheet(opsData);
    XLSX.utils.book_append_sheet(wb, wsOps, 'برمجة العمليات');

    // Appointments sheet
    const aptsData = appointments.map(a => ({
      'عنوان الموعد': a.title,
      'النوع': a.type,
      'التاريخ': a.date,
      'التوقيت': `${a.startTime} - ${a.endTime}`,
      'المكان': a.location,
      'المعنيون': a.attendees,
      'تم الإنجاز': a.isCompleted ? 'نعم' : 'لا'
    }));
    const wsApts = XLSX.utils.json_to_sheet(aptsData);
    XLSX.utils.book_append_sheet(wb, wsApts, 'المواعيد واللقاءات');

    XLSX.writeFile(wb, `تقرير_مفكرة_الإدارة_التربوية_${reportDate}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header Controls (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            التقارير والإحصائيات الإدارية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            توليد تقارير رسمية جاهزة للطباعة والتصدير بصيغتي PDF و Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar (No-print) */}
      <div className="no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">نوع التقرير:</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="daily">تقرير النشاط اليومي</option>
              <option value="weekly">تقرير النشاط الأسبوعي</option>
              <option value="monthly">الحصيلة الشهرية العامة</option>
              <option value="tasks">تقرير وضعية المهام الإدارية</option>
              <option value="operations">تقرير تقدم العمليات والمشاريع</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ التقرير:</label>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
        </div>

        <div className="text-xs text-slate-400">
          المؤسسة: <strong className="text-slate-800 dark:text-slate-200">{schoolProfile.schoolName || 'المؤسسة التعليمية'}</strong>
        </div>
      </div>

      {/* Official Moroccan Educational Document View (Screen & Print ready) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-8 font-cairo">

        {/* Moroccan Official Kingdom Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <div>
              <div>المملكة المغربية</div>
              <div>وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-sm">
              <Building className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left font-serif">
              <div>Royaume du Maroc</div>
              <div>Ministère de l&apos;Éducation Nationale</div>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-700">
            {schoolProfile.academy}
          </div>
          <div className="text-xs font-semibold text-slate-700">
            {schoolProfile.directorate}
          </div>
          <div className="text-sm font-black text-slate-900 pt-1">
            {schoolProfile.schoolName || 'مؤسسة تعليمية'}
          </div>
          <div className="text-[11px] text-slate-500">
            الموسم الدراسي: {schoolProfile.academicYear}
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-2">
          <span className="inline-block px-6 py-2 bg-slate-100 border border-slate-300 rounded-full text-base sm:text-lg font-black tracking-wide">
            {reportType === 'daily' && `تقرير النشاط الإداري والتربوي اليومي (${reportDate})`}
            {reportType === 'weekly' && `التقرير التركيبي الأسبوعي لتدبير المؤسسة`}
            {reportType === 'monthly' && `الحصيلة الشهرية الشاملة لعمليات ومهام المؤسسة`}
            {reportType === 'tasks' && `تقرير حصر ومتابعة تنفيذ المهام الإدارية`}
            {reportType === 'operations' && `تقرير تقدم وأجرأة مشاريع وعمليات المؤسسة`}
          </span>
        </div>

        {/* Statistical Summary Box */}
        <div className="grid grid-cols-4 gap-3 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <div className="text-xs text-slate-500">مجموع المهام</div>
            <div className="text-xl font-black text-slate-900">{totalTasks}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">المهام المنجزة</div>
            <div className="text-xl font-black text-emerald-600">{completedTasks}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">المهام الجارية</div>
            <div className="text-xl font-black text-blue-600">{pendingTasks}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">المهام المتأخرة</div>
            <div className="text-xl font-black text-rose-600">{overdueTasks}</div>
          </div>
        </div>

        {/* Section 1: Tasks Status Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-r-4 border-slate-900 pr-2">
            <CheckSquare className="w-4 h-4" />
            <span>أولاً: وضعية تنفيذ المهام والتدابير الإدارية</span>
          </div>

          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-2">#</th>
                <th className="border border-slate-300 p-2">عنوان المهمة</th>
                <th className="border border-slate-300 p-2">المجال</th>
                <th className="border border-slate-300 p-2">الأولوية</th>
                <th className="border border-slate-300 p-2">المسؤول</th>
                <th className="border border-slate-300 p-2">الأجل</th>
                <th className="border border-slate-300 p-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-semibold">{task.title}</td>
                  <td className="border border-slate-300 p-2">{task.category}</td>
                  <td className="border border-slate-300 p-2 text-center">{task.priority}</td>
                  <td className="border border-slate-300 p-2">{task.assignedTo}</td>
                  <td className="border border-slate-300 p-2 text-center">{task.dueDate}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Operations Progress */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-r-4 border-slate-900 pr-2">
            <Workflow className="w-4 h-4" />
            <span>ثانياً: أجرأة العمليات والمشاريع الكبرى</span>
          </div>

          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-2">العملية</th>
                <th className="border border-slate-300 p-2">المرجعية</th>
                <th className="border border-slate-300 p-2">المسؤول</th>
                <th className="border border-slate-300 p-2">تاريخ الانتهاء</th>
                <th className="border border-slate-300 p-2">نسبة الإنجاز</th>
                <th className="border border-slate-300 p-2">الوضعية</th>
              </tr>
            </thead>
            <tbody>
              {operations.map(op => (
                <tr key={op.id}>
                  <td className="border border-slate-300 p-2 font-semibold">{op.title}</td>
                  <td className="border border-slate-300 p-2">{op.reference}</td>
                  <td className="border border-slate-300 p-2">{op.responsible}</td>
                  <td className="border border-slate-300 p-2 text-center">{op.dueDate}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold">{op.progress}%</td>
                  <td className="border border-slate-300 p-2 text-center">{op.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Notes & Daily Highlights */}
        {dailyNotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-r-4 border-slate-900 pr-2">
              <FileText className="w-4 h-4" />
              <span>ثالثاً: تدوينات المفكرة اليومية وأبرز القرارات</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              {dailyNotes.slice(0, 3).map(n => (
                <div key={n.id} className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">• [{n.type}]</span>
                  <span className="font-semibold text-slate-800">{n.title}:</span>
                  <span className="text-slate-600">{n.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formal Signatures and Stamp Block */}
        <div className="pt-10 flex items-center justify-between text-xs text-slate-800">
          <div className="text-center space-y-1">
            <div className="font-bold">حرر بـ: {schoolProfile.address.split('،')[0] || 'الرباط'}</div>
            <div>بتاريخ: {reportDate}</div>
          </div>

          <div className="text-center space-y-16">
            <div className="font-bold">رئيس المؤسسة التعليمية (المدير):</div>
            <div className="font-black text-sm">{schoolProfile.principalName}</div>
            <div className="text-[10px] text-slate-400">(التوقيع وخاتم المؤسسة)</div>
          </div>
        </div>

      </div>

    </div>
  );
};
