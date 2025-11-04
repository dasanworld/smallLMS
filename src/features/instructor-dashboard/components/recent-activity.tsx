'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { RecentSubmission } from '@/features/instructor-dashboard/backend/schema';
import { AlertCircle } from 'lucide-react';

interface RecentActivityProps {
  submissions: RecentSubmission[];
}

export function RecentActivity({ submissions }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p', { locale: ko });
    } catch {
      return dateString;
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">최근 활동</h3>
        <div className="flex items-center gap-3 text-slate-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">최근 7일 이내 제출물이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">최근 활동 (7일 이내)</h3>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.submissionId}
            className="flex items-start justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{submission.studentName}</p>
              <p className="text-sm text-slate-600 mt-1">{submission.assignmentTitle}</p>
              <p className="text-xs text-slate-500 mt-1">{submission.courseTitle}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-xs text-slate-600">{formatDate(submission.submittedAt)}</p>
              <p className="text-xs font-medium text-slate-700 mt-1">
                {submission.status === 'submitted' ? '채점 대기' : '채점 완료'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
