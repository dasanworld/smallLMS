import { z } from 'zod';

export const courseIdSchema = z.object({
  courseId: z.string().regex(/^\d+$/, 'Invalid course ID'),
});

export const courseFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  sortBy: z.enum(['newest', 'popular']).optional().default('newest'),
});

export const enrollmentRequestSchema = z.object({
  courseId: z.number().positive('Invalid course ID'),
});

export type CourseIdInput = z.infer<typeof courseIdSchema>;
export type CourseFiltersInput = z.infer<typeof courseFiltersSchema>;
export type EnrollmentRequestInput = z.infer<typeof enrollmentRequestSchema>;
