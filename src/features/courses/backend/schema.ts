import { z } from 'zod';
import { CourseStatus } from '@/lib/shared/course-types';

export const CourseTableRowSchema = z.object({
  id: z.number(),
  instructor_id: z.string().uuid(),
  category_id: z.number().nullable(),
  difficulty_id: z.number().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  curriculum: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived', 'closed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CourseTableRow = z.infer<typeof CourseTableRowSchema>;

export const CategoryTableRowSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type CategoryTableRow = z.infer<typeof CategoryTableRowSchema>;

export const DifficultyTableRowSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type DifficultyTableRow = z.infer<typeof DifficultyTableRowSchema>;

export const CourseSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived', 'closed']),
  instructorId: z.string().uuid(),
  categoryId: z.number().nullable(),
  difficultyId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  difficulty: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
});

export const CourseDetailSchema = CourseSummarySchema.extend({
  curriculum: z.string().nullable(),
});

export const CourseListResponseSchema = z.object({
  courses: z.array(CourseSummarySchema),
  total: z.number(),
});

export type CourseSummaryResponse = z.infer<typeof CourseSummarySchema>;
export type CourseDetailResponse = z.infer<typeof CourseDetailSchema>;
export type CourseListResponse = z.infer<typeof CourseListResponseSchema>;
