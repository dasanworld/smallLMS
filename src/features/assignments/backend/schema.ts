import { z } from 'zod';

export const AssignmentTableRowSchema = z.object({
  id: z.number(),
  course_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  score_weighting: z.number(),
  allow_late_submission: z.boolean(),
  allow_resubmission: z.boolean(),
  status: z.enum(['draft', 'published', 'archived', 'closed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AssignmentTableRow = z.infer<typeof AssignmentTableRowSchema>;

export const AssignmentResponseSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  scoreWeighting: z.number(),
  allowLateSubmission: z.boolean(),
  allowResubmission: z.boolean(),
  status: z.enum(['draft', 'published', 'archived', 'closed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AssignmentResponse = z.infer<typeof AssignmentResponseSchema>;

export const AssignmentListResponseSchema = z.object({
  assignments: z.array(AssignmentResponseSchema),
});

export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;
