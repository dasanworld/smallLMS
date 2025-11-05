'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type CourseProgress = {
  courseId: number;
  courseTitle: string;
  completionPercent: number;
  assignmentProgress: number;
  estimatedHours: number;
  lastActivity: string;
};

export type ProgressStats = {
  overallProgress: number;
  coursesEnrolled: number;
  assignmentsCompleted: number;
  totalLearningHours: number;
  streakDays: number;
};

export type LearnerProgressResponse = {
  stats: ProgressStats;
  courseProgress: CourseProgress[];
};

export const useLearnerProgressQuery = () => {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ['learnerProgress'],
    queryFn: async (): Promise<LearnerProgressResponse> => {
      const response = await fetch('/api/learner/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
};
