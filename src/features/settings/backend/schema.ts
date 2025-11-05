import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(100),
  phoneNumber: z.string().optional().refine(
    (val) => !val || /^(\+82|0)[0-9]{9,10}$/.test(val.replace(/-/g, '')),
    '올바른 전화번호 형식이 아닙니다'
  ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  assignmentReminders: z.boolean().default(true),
  gradeNotifications: z.boolean().default(true),
  courseUpdates: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export const getProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  role: z.enum(['learner', 'instructor', 'operator']),
  createdAt: z.string(),
});

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
