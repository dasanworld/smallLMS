import { z } from 'zod';

export const GradeSummarySchema = z.object({
  submissionId: z.number(),
  assignmentId: z.number(),
  assignmentTitle: z.string(),
  courseId: z.number(),
  courseTitle: z.string(),
  score: z.number().nullable(),
  status: z.enum(['not_submitted', 'submitted', 'graded', 'resubmission_required']),
  isLate: z.boolean(),
  feedback: z.string().nullable(),
  submittedAt: z.string(),
  scoreWeighting: z.number(),
});

export type GradeSummary = z.infer<typeof GradeSummarySchema>;

export const CourseTotalSchema = z.object({
  courseId: z.number(),
  courseTitle: z.string(),
  totalScore: z.number().nullable(),
  assignmentCount: z.number(),
  completedCount: z.number(),
});

export type CourseTotal = z.infer<typeof CourseTotalSchema>;

export const LearnerGradesResponseSchema = z.object({
  submissions: z.array(GradeSummarySchema),
  courseTotals: z.array(CourseTotalSchema),
  message: z.string().optional(),
});

export type LearnerGradesResponse = z.infer<typeof LearnerGradesResponseSchema>;
