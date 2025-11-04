import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { SubmissionFormInput } from '@/lib/shared/submission-validation';
import type { LearnerSubmissionResponse } from '@/features/learner-submissions/backend/schema';

const API_BASE = '/api';

/**
 * Hook for submitting or resubmitting an assignment
 */
export const useSubmitAssignmentMutation = (
  assignmentId: number,
  courseId: number,
  options?: UseMutationOptions<
    { submission: any; message: string; success: boolean },
    Error,
    SubmissionFormInput
  >
) => {
  return useMutation({
    mutationFn: async (data: SubmissionFormInput) => {
      const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submit?courseId=${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentText: data.contentText,
          contentLink: data.contentLink || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          (response.status === 400 ? '유효하지 않은 제출입니다.' : '제출에 실패했습니다.');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    },
    ...options,
  });
};

/**
 * Hook for getting learner's submission status and eligibility
 */
export const useLearnerSubmissionStatusQuery = (
  assignmentId: number,
  courseId: number,
  options?: UseQueryOptions<LearnerSubmissionResponse, Error>
) => {
  return useQuery({
    queryKey: ['learnerSubmissionStatus', assignmentId, courseId],
    queryFn: async (): Promise<LearnerSubmissionResponse> => {
      const response = await fetch(
        `${API_BASE}/assignments/${assignmentId}/my-submission?courseId=${courseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          (response.status === 404 ? '과제를 찾을 수 없습니다.' : '상태를 불러올 수 없습니다.');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    },
    enabled: !!assignmentId && !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
