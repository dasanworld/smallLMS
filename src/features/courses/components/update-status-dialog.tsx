'use client';

import { X } from 'lucide-react';
import { useUpdateCourseStatusMutation } from '@/features/courses/hooks/useCourses';
import type { CourseSummary } from '@/lib/shared/course-types';
import { useState } from 'react';

interface UpdateStatusDialogProps {
  course: CourseSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStatusDialog({ course, open, onOpenChange }: UpdateStatusDialogProps) {
  const [error, setError] = useState<string>('');
  const { mutate: updateStatus, isPending } = useUpdateCourseStatusMutation();

  const getNextStatus = (): 'draft' | 'published' | 'archived' | null => {
    switch (course.status) {
      case 'draft':
        return 'published';
      case 'published':
        return 'archived';
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '초안';
      case 'published':
        return '공개';
      case 'archived':
        return '보관';
      default:
        return status;
    }
  };

  const nextStatus = getNextStatus();

  if (!open || !nextStatus) return null;

  const handleConfirm = () => {
    setError('');
    updateStatus(
      { courseId: course.id, status: nextStatus },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || '상태 변경에 실패했습니다.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">상태 변경</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <p className="text-slate-700">
            <span className="font-medium">{course.title}</span>의 상태를{' '}
            <span className="font-medium">{getStatusLabel(course.status)}</span>에서{' '}
            <span className="font-medium">{getStatusLabel(nextStatus)}</span>로 변경하시겠습니까?
          </p>

          {course.status === 'draft' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              코스를 공개하면 학습자가 볼 수 있게 됩니다.
            </div>
          )}

          {course.status === 'published' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              코스를 보관하면 새로운 수강신청이 불가능합니다.
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
            >
              {isPending ? '변경 중...' : '변경'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
