'use client';

import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { MessageSquare } from 'lucide-react';
import { useLearnerDashboardQuery } from '@/features/dashboard/hooks/useLearnerDashboard';

type FeedbackPageProps = {
  params: Promise<Record<string, never>>;
};

export default function FeedbackPage({ params }: FeedbackPageProps) {
  void params;

  const { isLoading } = useAuthenticatedRole('learner');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LearnerNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-10 h-10 text-green-600" />
              피드백
            </h1>
            <p className="text-slate-600 mt-2">강사님의 피드백을 확인하세요</p>
          </div>
          <RoleBadge />
        </div>

        <FeedbackListContent />
      </div>
    </div>
  );
}

function FeedbackListContent() {
  const { data, isLoading, error, refetch, isFetching } = useLearnerDashboardQuery();
  const feedback = data?.recentFeedback ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">피드백을 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-4 px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isFetching ? '새로고침 중...' : '새로고침'}
        </button>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">최근 피드백이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((f) => (
        <div key={f.submissionId} className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">{f.courseTitle}</div>
            <div className="text-xs text-slate-500">{new Date(f.gradedAt).toLocaleDateString('ko-KR')}</div>
          </div>
          <div className="mt-1 font-semibold text-slate-900">{f.assignmentTitle}</div>
          <div className="mt-1 text-sm text-slate-700">점수: {f.score ?? '-'} / 100</div>
          {f.feedback && (
            <div className="mt-2 text-sm text-slate-600 line-clamp-2">{f.feedback}</div>
          )}
        </div>
      ))}
    </div>
  );
}

