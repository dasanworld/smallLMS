'use client';

import { DashboardOverview } from '@/features/instructor-dashboard/components/dashboard-overview';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';

type InstructorDashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function InstructorDashboardPage({ params }: InstructorDashboardPageProps) {
  void params;
  
  const { isLoading } = useAuthenticatedRole('instructor');

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
              📊 강사 대시보드
            </h1>
            <p className="text-slate-600 mt-2">코스 통계와 채점 현황을 한눈에 확인하세요</p>
          </div>
          <RoleBadge />
        </div>

        <DashboardOverview />
      </div>
    </div>
  );
}
