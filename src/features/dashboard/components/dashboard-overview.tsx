'use client';

import { CourseProgressComponent } from '@/features/dashboard/components/course-progress';
import { UpcomingAssignmentsComponent } from '@/features/dashboard/components/upcoming-assignments';
import { RecentFeedbackComponent } from '@/features/dashboard/components/recent-feedback';
import type { LearnerDashboard } from '@/lib/shared/dashboard-types';

interface DashboardOverviewProps {
  data: LearnerDashboard;
  isLoading: boolean;
}

export function DashboardOverview({ data, isLoading }: DashboardOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourseProgressComponent courses={data.courses} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingAssignmentsComponent assignments={data.upcomingAssignments} />
        <RecentFeedbackComponent feedback={data.recentFeedback} />
      </div>
    </div>
  );
}
