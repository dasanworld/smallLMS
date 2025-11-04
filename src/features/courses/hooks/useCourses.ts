'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { CourseSummary, CourseDetail, Category, Difficulty, CourseListParams } from '@/lib/shared/course-types';

export function useCoursesQuery(params: CourseListParams) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category.toString());
      if (params.difficulty) queryParams.append('difficulty', params.difficulty.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);

      const response = await axios.get<{
        data: { courses: CourseSummary[]; total: number };
      }>(`/api/courses?${queryParams}`);

      return response.data.data;
    },
  });
}

export function useCourseQuery(courseId: number) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await axios.get<{ data: CourseDetail }>(`/api/courses/${courseId}`);
      return response.data.data;
    },
    enabled: courseId > 0,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get<{ data: Category[] }>('/api/categories');
      return response.data.data;
    },
  });
}

export function useDifficultiesQuery() {
  return useQuery({
    queryKey: ['difficulties'],
    queryFn: async () => {
      const response = await axios.get<{ data: Difficulty[] }>('/api/difficulties');
      return response.data.data;
    },
  });
}
