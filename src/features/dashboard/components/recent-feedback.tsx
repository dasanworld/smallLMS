'use client';

import type { RecentFeedback } from '@/lib/shared/dashboard-types';

interface RecentFeedbackProps {
  feedback: RecentFeedback[];
}

export function RecentFeedbackComponent({ feedback }: RecentFeedbackProps) {
  if (feedback.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">최근 피드백</h2>
        <p className="text-center text-slate-500">최근 피드백이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">최근 피드백</h2>
      <div className="space-y-3">
        {feedback.map((item) => (
          <div key={item.submissionId} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-slate-900">{item.assignmentTitle}</h3>
                <p className="text-sm text-slate-600">{item.courseTitle}</p>
              </div>
              {item.score !== null && (
                <span className="text-lg font-semibold text-slate-900">{item.score}/100</span>
              )}
            </div>
            {item.feedback && <p className="text-sm text-slate-600 line-clamp-2">{item.feedback}</p>}
            <p className="text-xs text-slate-500 mt-2">
              {new Date(item.gradedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
