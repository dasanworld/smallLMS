'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { GradeSummary } from '@/features/grades/backend/schema';
import { AlertCircle } from 'lucide-react';

interface AssignmentFeedbackProps {
  submission: GradeSummary;
}

export function AssignmentFeedback({ submission }: AssignmentFeedbackProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p', { locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-semibold text-slate-900">{submission.assignmentTitle}</h4>
          <p className="text-sm text-slate-600 mt-1">{submission.courseTitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">점수</p>
            <p className="text-lg font-bold text-slate-900">{submission.score}점</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">제출 일시</p>
            <p className="text-sm text-slate-900">{formatDate(submission.submittedAt)}</p>
          </div>
        </div>

        {submission.isLate && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded p-3">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-700">지각 제출</span>
          </div>
        )}

        {submission.feedback && (
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-2">피드백</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {submission.status === 'resubmission_required' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-700">강사님이 재제출을 요청했습니다. 과제 페이지에서 재제출할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
