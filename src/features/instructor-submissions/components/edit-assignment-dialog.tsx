'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAssignmentQuery, useUpdateAssignmentMutation } from '@/features/assignments/hooks/useAssignments';

interface EditAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  courseId: number;
}

type FormState = {
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  scoreWeighting: number;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
};

export function EditAssignmentDialog({ open, onOpenChange, assignmentId, courseId }: EditAssignmentDialogProps) {
  const { data: assignment, isLoading, error } = useAssignmentQuery(assignmentId);
  const { mutate: updateAssignment, isPending } = useUpdateAssignmentMutation(courseId);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    dueDate: '',
    scoreWeighting: 0,
    allowLateSubmission: true,
    allowResubmission: true,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (assignment) {
      setForm({
        title: assignment.title,
        description: assignment.description ?? '',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 10) : '',
        scoreWeighting: assignment.scoreWeighting,
        allowLateSubmission: assignment.allowLateSubmission,
        allowResubmission: assignment.allowResubmission,
      });
    }
  }, [open, assignment]);

  const handleClose = () => {
    onOpenChange(false);
    setSubmitError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.title.trim()) {
      setSubmitError('과제 제목은 필수입니다.');
      return;
    }
    if (form.scoreWeighting < 0 || form.scoreWeighting > 100) {
      setSubmitError('점수 비중은 0~100 사이여야 합니다.');
      return;
    }

    updateAssignment(
      {
        assignmentId,
        input: {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          scoreWeighting: form.scoreWeighting,
          allowLateSubmission: form.allowLateSubmission,
          allowResubmission: form.allowResubmission,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (err: any) => {
          setSubmitError(err?.response?.data?.error?.message || '과제 수정에 실패했습니다.');
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">과제 편집</h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-600 text-sm">
              과제 정보를 불러오는 중입니다...
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              과제 정보를 불러오지 못했습니다.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{submitError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onClick={handleClose}
              className="flex-1 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


