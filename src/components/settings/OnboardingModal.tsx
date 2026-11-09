import React, { useState } from 'react';
import { School, User, Award, Calendar, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCurrentAcademicYear, getAvailableAcademicYears } from '../../utils/academicYear';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { updateSchoolProfile, schoolProfile } = useApp();
  const availableYears = getAvailableAcademicYears();

  const [formData, setFormData] = useState({
    schoolName: schoolProfile.schoolName || '',
    directorate: schoolProfile.directorate || '',
    academy: schoolProfile.academy || '',
    academicYear: schoolProfile.academicYear || getCurrentAcademicYear(),
    principalName: schoolProfile.principalName || '',
    phone: schoolProfile.phone || '',
    email: schoolProfile.email || '',
    address: schoolProfile.address || ''
  });

  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName.trim() || !formData.principalName.trim()) {
      alert('يرجى كتابة اسم المؤسسة واسم المدير لمتابعة التهيئة.');
      return;
    }

    updateSchoolProfile({
      ...schoolProfile,
      ...formData
    });

    localStorage.setItem('mofakkira_onboarding_completed', 'true');
    confetti({ particleCount: 100, spread: 80 });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">

        {/* Welcome Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/20">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-cairo">
            مرحباً بك في مفكرة الإدارة التربوية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            تهيئة وتخصيص بيئة عمل إدارتك المدرسية للموسم الدراسي الجديد
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المؤسسة التعليمية <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: مدرسة الإمام البخاري الابتدائية"
                    value={formData.schoolName}
                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم السيد(ة) مدير(ة) المؤسسة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="الاسم الكامل لرئيس المؤسسة"
                    value={formData.principalName}
                    onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الموسم الدراسي
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <select
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      dir="ltr"
                      className="w-full pl-2 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 text-right"
                    >
                      {availableYears.map(yr => (
                        <option key={yr} value={yr} dir="ltr">{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الهاتف الإداري
                  </label>
                  <input
                    type="text"
                    placeholder="06XXXXXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.schoolName.trim() || !formData.principalName.trim()) {
                      alert('يرجى ملء اسم المؤسسة واسم المدير للمتابعة.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98"
                >
                  المتابعة: الجهة والمديرية
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الأكاديمية الجهوية للتربية والتكوين
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="مثال: جهة الرباط - سلا - القنيطرة"
                    value={formData.academy}
                    onChange={e => setFormData({ ...formData, academy: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المديرية الإقليمية
                </label>
                <input
                  type="text"
                  placeholder="مثال: مديرية تمارة - الصخيرات"
                  value={formData.directorate}
                  onChange={e => setFormData({ ...formData, directorate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني المؤسساتي
                </label>
                <input
                  type="email"
                  placeholder="ecole@men.gov.ma"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  رجوع
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>بدء استخدام المفكرة</span>
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            يمكنك تعديل كافة هذه المعطيات في أي وقت من خلال قائمة &quot;إعدادات المؤسسة&quot;.
          </p>
        </div>

      </div>
    </div>
  );
};
