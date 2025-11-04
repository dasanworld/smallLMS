import { z } from 'zod';

export const EnrollmentTableRowSchema = z.object({
  id: z.number(),
  user_id: z.string().uuid(),
  course_id: z.number(),
  enrolled_at: z.string(),
});

export type EnrollmentTableRow = z.infer<typeof EnrollmentTableRowSchema>;

export const EnrollmentRequestSchema = z.object({
  courseId: z.number().positive('Invalid course ID'),
});

export const EnrollmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  enrollment: z.object({
    id: z.number(),
    userId: z.string().uuid(),
    courseId: z.number(),
    enrolledAt: z.string(),
  }).optional(),
});

export const EnrollmentStatusResponseSchema = z.object({
  isEnrolled: z.boolean(),
  enrollment: z.object({
    id: z.number(),
    userId: z.string().uuid(),
    courseId: z.number(),
    enrolledAt: z.string(),
  }).optional(),
});

export type EnrollmentRequest = z.infer<typeof EnrollmentRequestSchema>;
export type EnrollmentResponse = z.infer<typeof EnrollmentResponseSchema>;
export type EnrollmentStatusResponse = z.infer<typeof EnrollmentStatusResponseSchema>;
