import { z } from 'zod';
import { UserRole } from './user-types';

export const roleSchema = z.enum([UserRole.Learner, UserRole.Instructor]).describe('Role selection');

export const profileSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').min(2, '이름은 최소 2자 이상이어야 합니다'),
  phoneNumber: z.string().optional().refine(
    (val) => !val || /^\d{10,}$/.test(val.replace(/[-\s]/g, '')),
    '유효한 휴대폰번호를 입력해주세요'
  ),
});

export const termsAgreementSchema = z.object({
  agreed: z.boolean().refine((val) => val === true, '약관에 동의해야 합니다'),
});

export const onboardingSchema = z.object({
  role: roleSchema,
  name: z.string().min(1, '이름은 필수입니다').min(2, '이름은 최소 2자 이상이어야 합니다'),
  phoneNumber: z.string().optional().refine(
    (val) => !val || /^\d{10,}$/.test(val.replace(/[-\s]/g, '')),
    '유효한 휴대폰번호를 입력해주세요'
  ),
  termsAgreed: z.boolean(),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TermsAgreementInput = z.infer<typeof termsAgreementSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
