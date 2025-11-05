'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { CourseSummary, CourseDetail, Category, Difficulty, CourseListParams } from '@/lib/shared/course-types';
import type { CreateCourseInput, UpdateCourseInput } from '@/features/courses/backend/service';

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

export function useInstructorCoursesQuery() {
  return useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await axios.get<{ data: { courses: CourseSummary[]; total: number } }>('/api/instructor/courses');
      return response.data.data;
    },
  });
}

export function useInstructorCourseQuery(courseId: number) {
  return useQuery({
    queryKey: ['instructor-course', courseId],
    queryFn: async () => {
      const response = await axios.get<{ data: CourseDetail }>(`/api/instructor/courses/${courseId}`);
      return response.data.data;
    },
    enabled: courseId > 0,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCourseInput) => {
      const response = await axios.post<{ data: CourseDetail }>('/api/instructor/courses', input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, input }: { courseId: number; input: UpdateCourseInput }) => {
      const response = await axios.put<{ data: CourseDetail }>(`/api/instructor/courses/${courseId}`, input);
      return response.data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
    },
  });
}

export function useUpdateCourseStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, status }: { courseId: number; status: 'draft' | 'published' | 'archived' }) => {
      const response = await axios.patch<{ data: { status: string } }>(`/api/instructor/courses/${courseId}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
    },
  });
}
