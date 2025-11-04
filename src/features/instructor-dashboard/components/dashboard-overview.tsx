'use client';

import { useInstructorDashboardQuery } from '@/features/instructor-dashboard/hooks/useInstructorDashboard';
import { CourseStats } from './course-stats';
import { PendingGrades } from './pending-grades';
import { RecentActivity } from './recent-activity';
import { AlertTriangle } from 'lucide-react';

export function DashboardOverview() {
  const { data: dashboardData, isLoading, error } = useInstructorDashboardQuery();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">오류</h3>
            <p className="text-sm text-red-700 mt-1">대시보드를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourseStats courseStats={dashboardData.courseStats} />
        <PendingGrades 
          totalPendingGrades={dashboardData.totalPendingGrades}
          courses={dashboardData.courses}
        />
      </div>

      <RecentActivity submissions={dashboardData.recentSubmissions} />
    </div>
  );
}
