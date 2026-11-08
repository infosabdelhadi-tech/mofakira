import React, { useState } from 'react';
import {
  Building,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { SchoolProfile } from '../../types';
import {
  exportAllDataAsJSON,
  validateBackupFile,
  restoreBackupData,
  type ValidationResult
} from '../../utils/storage';
import { getCurrentAcademicYear, getAvailableAcademicYears } from '../../utils/academicYear';

export const SettingsManager: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    resetAllData,
    loadDemoData,
    activityLogs
  } = useApp();

  const availableYears = getAvailableAcademicYears();
  const [form, setForm] = useState<SchoolProfile>({
    ...schoolProfile,
    academicYear: schoolProfile.academicYear || getCurrentAcademicYear()
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [validationModal, setValidationModal] = useState<ValidationResult | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_مفكرة_الإدارة_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateBackupFile(content);
      if (!result.isValid) {
        alert(result.error || 'الملف المختار غير صالح.');
        return;
      }
      setValidationModal(result);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleConfirmRestore = () => {
    if (!validationModal?.data) return;
    restoreBackupData(validationModal.data);
    alert('تمت استعادة البيانات بنجاح! سيتم تحديث الصفحة.');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
          إعدادات المؤسسة والنظام
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          تخصيص هوية المؤسسة التعليمية، تدبير النسخ الاحتياطي، وسجل الأنشطة
        </p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تم حفظ وتحديث بيانات المؤسسة بنجاح! سيتم اعتمادها في كافة التقارير الرسمية.</span>
        </div>
      )}

      {/* School Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              بطاقة وهوية المؤسسة التعليمية
            </h2>
            <p className="text-xs text-slate-400">تستخدم هذه المعطيات في الترويسات الرسمية والوثائق المصدرة</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المؤسسة التعليمية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.schoolName}
                onChange={e => setForm({ ...form, schoolName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم رئيس المؤسسة (المدير) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.principalName}
                onChange={e => setForm({ ...form, principalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الأكاديمية الجهوية للتربية والتكوين
              </label>
              <input
                type="text"
                value={form.academy}
                onChange={e => setForm({ ...form, academy: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المديرية الإقليمية
              </label>
              <input
                type="text"
                value={form.directorate}
                onChange={e => setForm({ ...form, directorate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الموسم الدراسي الحالي
              </label>
              <div className="flex gap-2">
                <select
                  value={form.academicYear}
                  onChange={e => setForm({ ...form, academicYear: e.target.value })}
                  dir="ltr"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 text-right font-mono"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr} dir="ltr">{yr}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={e => setForm({ ...form, academicYear: e.target.value })}
                  dir="ltr"
                  placeholder="2026 - 2027"
                  title="أو أدخل صيغة موسم أخرى يدوياً"
                  className="w-32 px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-center font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف الإداري
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني المؤسساتي
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان المؤسسة
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شعار تربوي للمؤسسة
            </label>
            <input
              type="text"
              value={form.motto || ''}
              onChange={e => setForm({ ...form, motto: e.target.value })}
              placeholder="مثال: من أجل مدرسة عمومية ذات جودة للجميع"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs sm:text-sm active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ بيانات المؤسسة</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              الأمان، النسخ الاحتياطي واستعادة البيانات
            </h2>
            <p className="text-xs text-slate-400">حفظ نسخة احتياطية محلية بصيغة JSON لنقلها أو استرجاعها بأمان</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">تصدير نسخة احتياطية شاملة</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">تتضمن كافة المهام، المواعيد، العمليات، والملاحظات اليومية</p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل ملف النسخة الاحتياطية</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">استعادة نسخة احتياطية</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">استرجاع بيانات سابقة محفوظة مسبقاً من ملف JSON</p>
            </div>
            <label className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-lg cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>فحص واختيار ملف للاستعادة</span>
              <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

        </div>

        {/* Exploratory Demo Data Trigger */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>البيانات النموذجية الاستكشافية (Demo Data)</span>
            </div>
            <div className="text-[11px] text-slate-400">تحميل أمثلة لمهام وعمليات واجتماعات مدرسة ابتدائية نموذجية لتجربة كافة إمكانيات المفكرة</div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('هل تود تحميل البيانات النموذجية الاستكشافية؟')) {
                loadDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-800 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحميل بيانات استكشافية</span>
          </button>
        </div>

        {/* Danger zone: Reset */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-rose-600">إفراغ البيانات والبدء من الصفر</div>
            <div className="text-[11px] text-slate-400">مسح السجلات والمهام للبدء بمفكرة جديدة بيضاء مع الاحتفاظ بملف المؤسسة</div>
          </div>
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط وتفريغ المفكرة</span>
          </button>
        </div>
      </div>

      {/* Activity Logs Audit */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>سجل العمليات والأنشطة الأخيرة (Audit Trail)</span>
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activityLogs.map(log => (
            <div key={log.id} className="text-xs flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-white">{log.action}:</span>
                <span className="text-slate-500">{log.entityTitle}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString('ar-MA')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Restore Validation & Confirmation Modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <FileCheck className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تأكيد استرجاع النسخة الاحتياطية
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              تم فحص بنية الملف بنجاح. فيما يلي ملخص البيانات التي سيتم استرجاعها واستبدال البيانات الحالية بها:
            </p>

            {validationModal.summary && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم المؤسسة في الملف:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{validationModal.summary.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ تصدير النسخة:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{validationModal.summary.exportDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-teal-600">{validationModal.summary.tasksCount}</div>
                    <div className="text-[10px] text-slate-400">مهام</div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-amber-600">{validationModal.summary.appointmentsCount}</div>
                    <div className="text-[10px] text-slate-400">مواعيد</div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-indigo-600">{validationModal.summary.operationsCount}</div>
                    <div className="text-[10px] text-slate-400">عمليات</div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-purple-600">{validationModal.summary.meetingsCount}</div>
                    <div className="text-[10px] text-slate-400">اجتماعات</div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-blue-600">{validationModal.summary.annualCount}</div>
                    <div className="text-[10px] text-slate-400">برنامج سنوي</div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="font-bold text-emerald-600">{validationModal.summary.notesCount}</div>
                    <div className="text-[10px] text-slate-400">تدوينات</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>تحذير: سيتم استبدال البيانات الحالية على هذا المتصفح ببيانات الملف.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setValidationModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                تأكيد الاسترجاع واستبدال البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تأكيد تفريغ وإعادة تهيئة المفكرة
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من تفريغ كافة السجلات للبدء من جديد؟ لن يتم مسح هوية المؤسسة ولكن ستُحذف المهام والمواعيد والمذكرات.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setResetConfirmOpen(false);
                }}
                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
              >
                تأكيد التفريغ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
