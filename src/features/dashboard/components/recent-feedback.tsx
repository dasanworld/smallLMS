'use client';

import Link from 'next/link';
import { MessageSquare, Star } from 'lucide-react';
import type { RecentFeedback } from '@/lib/shared/dashboard-types';

interface RecentFeedbackProps {
  feedback: RecentFeedback[];
}

export function RecentFeedbackComponent({ feedback }: RecentFeedbackProps) {
  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">최근 피드백</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">📝</div>
          <p className="text-slate-500">최근 피드백이 없습니다</p>
          <p className="text-sm text-slate-400 mt-1">과제를 제출하고 피드백을 받아보세요</p>
        </div>
      </div>
    );
  }

  // 점수에 따라 색상 결정
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-600';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">최근 피드백</h2>
        </div>
        <span className="text-sm text-slate-500">{feedback.length}개</span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {feedback.map((item) => (
          <Link
            key={item.submissionId}
            href={`/my/grades/${item.submissionId}`}
            className="block p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{item.assignmentTitle}</h3>
                <p className="text-sm text-slate-600">{item.courseTitle}</p>
              </div>
              {item.score !== null && (
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${getScoreColor(item.score)}`} />
                  <span className={`text-lg font-semibold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </span>
                  <span className="text-sm text-slate-500">/100</span>
                </div>
              )}
            </div>
            {item.feedback && (
              <div className="bg-slate-50 rounded p-3 mb-2">
                <p className="text-sm text-slate-700 line-clamp-2">{item.feedback}</p>
              </div>
            )}
            <p className="text-xs text-slate-500">
              📅 {new Date(item.gradedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
