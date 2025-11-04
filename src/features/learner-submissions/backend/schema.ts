import { z } from 'zod';
import { SubmissionResponseSchema } from '@/features/submissions/backend/schema';

export const SubmissionRequestSchema = z.object({
  contentText: z.string().min(1, 'Content text is required'),
  contentLink: z.string().url('Invalid URL format').optional(),
});

export type SubmissionRequest = z.infer<typeof SubmissionRequestSchema>;

export const SubmissionResponseFromServiceSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  submission: SubmissionResponseSchema,
});

export type SubmissionResponseFromService = z.infer<typeof SubmissionResponseFromServiceSchema>;

export const LearnerSubmissionResponseSchema = z.object({
  submission: SubmissionResponseSchema.optional(),
  hasSubmission: z.boolean(),
  canSubmit: z.boolean(),
  canResubmit: z.boolean(),
  isLate: z.boolean(),
  deadline: z.string().nullable(),
  message: z.string().optional(),
});

export type LearnerSubmissionResponse = z.infer<typeof LearnerSubmissionResponseSchema>;