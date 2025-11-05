'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type LearnerCourseWithProgress = {
  id: number;
  title: string;
  description: string | null;
  instructor: string;
  enrollment_date: string;
  progress: number;
  total_assignments: number;
  completed_assignments: number;
  grade: number | null;
};

export type LearnerCoursesResponse = {
  courses: LearnerCourseWithProgress[];
  stats: {
    total_enrolled: number;
    in_progress: number;
    completed: number;
  };
};

export const useLearnerCoursesQuery = (filter?: 'ongoing' | 'completed' | 'all') => {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ['learnerCourses', filter],
    queryFn: async (): Promise<LearnerCoursesResponse> => {
      const params = filter ? `?filter=${filter}` : '';
      const response = await fetch(`/api/learner/courses${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
};
