'use client';

import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { useLearnerDashboardQuery } from '@/features/dashboard/hooks/useLearnerDashboard';

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { data, isLoading } = useLearnerDashboardQuery();

  if (!data) {
    return <DashboardOverview data={{ courses: [], upcomingAssignments: [], recentFeedback: [] }} isLoading={isLoading} />;
  }

  return <DashboardOverview data={data} isLoading={isLoading} />;
}
