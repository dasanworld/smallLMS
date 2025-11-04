import { z } from 'zod';

export const submissionFormSchema = z.object({
  contentText: z.string().min(1, 'Content text is required').max(5000, 'Content text must not exceed 5000 characters'),
  contentLink: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export const submissionIdSchema = z.number().int().positive('Submission ID must be a positive integer');

export const submissionUpdateSchema = z.object({
  contentText: z.string().min(1, 'Content text is required').max(5000, 'Content text must not exceed 5000 characters').optional(),
  contentLink: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export const submissionStatusSchema = z.enum(['submitted', 'graded', 'resubmission_required']);

export type SubmissionFormInput = z.infer<typeof submissionFormSchema>;
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;