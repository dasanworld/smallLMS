'use client';

import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { BookOpen } from 'lucide-react';
import { useLearnerDashboardQuery } from '@/features/dashboard/hooks/useLearnerDashboard';

type CoursesListPageProps = {
  params: Promise<Record<string, never>>;
};

export default function CoursesListPage({ params }: CoursesListPageProps) {
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
              <BookOpen className="w-10 h-10 text-purple-600" />
              수강 중인 코스
            </h1>
            <p className="text-slate-600 mt-2">내가 수강 중인 모든 코스를 확인하세요</p>
          </div>
          <RoleBadge />
        </div>

        <CoursesListContent />
      </div>
    </div>
  );
}

function CoursesListContent() {
  const { data, isLoading, error, refetch, isFetching } = useLearnerDashboardQuery();
  const courses = data?.courses ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">코스를 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
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

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600 mb-4">수강 중인 코스가 없습니다.</p>
        <a href="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          코스 탐색
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((c) => (
        <div key={c.courseId} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900 line-clamp-2">{c.courseTitle}</h3>
            <span className="text-xs text-slate-500">{c.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${c.progressPercentage}%` }} />
          </div>
          <div className="mt-3 text-sm text-slate-600">
            완료 {c.completedAssignments} / 총 {c.totalAssignments}
          </div>
          <a
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            href={`/courses/${c.courseId}`}
          >
            코스 바로가기 →
          </a>
        </div>
      ))}
    </div>
  );
}

