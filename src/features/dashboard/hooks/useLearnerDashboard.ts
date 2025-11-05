import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import type { LearnerDashboard } from '@/lib/shared/dashboard-types';

export function useLearnerDashboardQuery() {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ['learnerDashboard'],
    queryFn: async () => {
      const response = await fetch('/api/learner/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json() as Promise<LearnerDashboard>;
    },
    enabled: isAuthenticated, // 인증된 사용자만 API 호출
  });
}
