'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { useLearnerDashboardQuery } from '@/features/dashboard/hooks/useLearnerDashboard';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { QuickActions } from '@/features/learner-dashboard/components/quick-actions';
import { RotateCw } from 'lucide-react';

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const { role, isLoading: roleLoading } = useUserRole();
  const { isLoading: learnerRoleLoading } = useAuthenticatedRole('learner');
  const { data, isLoading: dashboardLoading, error, refetch, isFetching } = useLearnerDashboardQuery();

  useEffect(() => {
    if (!roleLoading && role) {
      if (role === 'instructor') {
        router.replace('/instructor/dashboard');
        return;
      }
      if (role === 'operator') {
        router.replace('/admin');
        return;
      }
    }
  }, [role, roleLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (learnerRoleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">데이터를 불러올 수 없습니다</div>
          <p className="text-slate-600">잠시 후 다시 시도해주세요.</p>
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
              📚 학습 대시보드
            </h1>
            <p className="text-slate-600 mt-2">
              수강 중인 코스와 과제 현황을 확인하세요
              <span className="ml-2 text-xs text-slate-500">(새로고침후 기다려주세요)</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              title="새로고침"
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="text-sm">{isFetching ? '새로고침 중...' : '새로고침'}</span>
            </button>
            <RoleBadge />
          </div>
        </div>

        {/* Quick Actions Section */}
        <QuickActions />

        {/* Dashboard Overview */}
        <DashboardOverview data={data || { courses: [], upcomingAssignments: [], recentFeedback: [] }} isLoading={dashboardLoading} />
      </div>
    </div>
  );
}
