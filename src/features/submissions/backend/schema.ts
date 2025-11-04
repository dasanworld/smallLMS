import { z } from 'zod';

export const SubmissionTableRowSchema = z.object({
  id: z.number(),
  assignment_id: z.number(),
  user_id: z.string().uuid(),
  content_text: z.string(),
  content_link: z.string().nullable(),
  submitted_at: z.string(),
  is_late: z.boolean(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
});

export type SubmissionTableRow = z.infer<typeof SubmissionTableRowSchema>;

export const SubmissionResponseSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  userId: z.string().uuid(),
  contentText: z.string(),
  contentLink: z.string().nullable(),
  submittedAt: z.string(),
  isLate: z.boolean(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
});

export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export const SubmissionListResponseSchema = z.object({
  submissions: z.array(SubmissionResponseSchema),
});

export type SubmissionListResponse = z.infer<typeof SubmissionListResponseSchema>;
