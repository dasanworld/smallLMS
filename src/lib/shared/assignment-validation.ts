import { z } from 'zod';

export const assignmentIdSchema = z.number().int().positive('Assignment ID must be a positive integer');

export const assignmentStatusSchema = z.enum(['draft', 'published', 'archived', 'closed']);

export const assignmentQuerySchema = z.object({
  courseId: z.number().int().positive().optional(),
  status: assignmentStatusSchema.optional(),
});

export type AssignmentQueryParams = z.infer<typeof assignmentQuerySchema>;
