'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

type CourseOption = { id: number; title: string };

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: CourseOption[];
}

type FormState = {
  courseId: number | '';
  title: string;
  description: string;
  dueDate: string; // ISO local date string (YYYY-MM-DD)
  scoreWeighting: number;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
};

export function CreateAssignmentDialog({ open, onOpenChange, courses }: CreateAssignmentDialogProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    scoreWeighting: 0,
    allowLateSubmission: true,
    allowResubmission: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm({
      courseId: '',
      title: '',
      description: '',
      dueDate: '',
      scoreWeighting: 0,
      allowLateSubmission: true,
      allowResubmission: true,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.courseId) {
      setError('코스를 선택하세요.');
      return;
    }
    if (!form.title.trim()) {
      setError('과제 제목은 필수입니다.');
      return;
    }
    if (form.scoreWeighting < 0 || form.scoreWeighting > 100) {
      setError('점수 비중은 0~100 사이여야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${form.courseId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(),
          scoreWeighting: form.scoreWeighting,
          allowLateSubmission: form.allowLateSubmission,
          allowResubmission: form.allowResubmission,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || '과제 생성에 실패했습니다.');
      }

      // 목록 데이터 무효화 및 닫기
      await queryClient.invalidateQueries({ queryKey: ['instructorAssignments'] });
      onOpenChange(false);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '과제 생성 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">새 과제 만들기</h2>
          <button
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">코스 *</label>
            <select
              value={form.courseId}
              onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value ? parseInt(e.target.value) : '' }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">선택하세요</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 1주차 과제"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">마감일</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">점수 비중 (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.scoreWeighting}
                onChange={(e) => setForm((prev) => ({ ...prev, scoreWeighting: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allowLateSubmission}
                  onChange={(e) => setForm((prev) => ({ ...prev, allowLateSubmission: e.target.checked }))}
                />
                지각 제출 허용
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allowResubmission}
                  onChange={(e) => setForm((prev) => ({ ...prev, allowResubmission: e.target.checked }))}
                />
                재제출 허용
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              className="flex-1 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {submitting ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


