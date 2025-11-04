import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { LearnerGradesResponse, GradeSummary } from '@/features/grades/backend/schema';

const API_BASE = '/api';

export const useLearnerGradesQuery = (
  options?: UseQueryOptions<LearnerGradesResponse, Error>
) => {
  return useQuery({
    queryKey: ['learnerGrades'],
    queryFn: async (): Promise<LearnerGradesResponse> => {
      const response = await fetch(`${API_BASE}/learner/grades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          (response.status === 404 ? '성적을 찾을 수 없습니다.' : '성적 조회에 실패했습니다.');
        throw new Error(errorMessage);
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useSubmissionFeedbackQuery = (
  submissionId: number,
  options?: UseQueryOptions<GradeSummary, Error>
) => {
  return useQuery({
    queryKey: ['submissionFeedback', submissionId],
    queryFn: async (): Promise<GradeSummary> => {
      const response = await fetch(`${API_BASE}/submissions/${submissionId}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '피드백 조회에 실패했습니다.';
        throw new Error(errorMessage);
      }

      return response.json();
    },
    enabled: !!submissionId,
    ...options,
  });
};
