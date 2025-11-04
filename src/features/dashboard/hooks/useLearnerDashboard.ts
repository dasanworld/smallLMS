import { useQuery } from '@tanstack/react-query';
import type { LearnerDashboard } from '@/lib/shared/dashboard-types';

export function useLearnerDashboardQuery() {
  return useQuery({
    queryKey: ['learnerDashboard'],
    queryFn: async () => {
      const response = await fetch('/api/learner/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json() as Promise<LearnerDashboard>;
    },
  });
}
