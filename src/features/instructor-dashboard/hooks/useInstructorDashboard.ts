import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { InstructorDashboardResponse } from '@/features/instructor-dashboard/backend/schema';

const API_BASE = '/api';

export const useInstructorDashboardQuery = (
  options?: UseQueryOptions<InstructorDashboardResponse, Error>
) => {
  return useQuery({
    queryKey: ['instructorDashboard'],
    queryFn: async (): Promise<InstructorDashboardResponse> => {
      const response = await fetch(`${API_BASE}/instructor/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '대시보드를 불러올 수 없습니다.';
        throw new Error(errorMessage);
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
