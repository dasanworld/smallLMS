import { z } from 'zod';
import { onboardingSchema } from '@/lib/shared/form-validation';

export const OnboardingRequestSchema = onboardingSchema;

export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;

export const OnboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().uuid(),
  role: z.enum(['learner', 'instructor', 'operator']),
});

export type OnboardingResponse = z.infer<typeof OnboardingResponseSchema>;

export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['learner', 'instructor', 'operator']),
  name: z.string(),
  phone_number: z.string().nullable(),
  created_at: z.string(),
});

export type ProfileTableRow = z.infer<typeof ProfileTableRowSchema>;

export const TermsAgreementTableRowSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid(),
  agreed_at: z.string(),
});

export type TermsAgreementTableRow = z.infer<typeof TermsAgreementTableRowSchema>;
