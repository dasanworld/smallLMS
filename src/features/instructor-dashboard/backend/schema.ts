import { z } from 'zod';

export const InstructorCourseSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  enrollmentCount: z.number(),
  pendingGradesCount: z.number(),
});

export type InstructorCourseSummary = z.infer<typeof InstructorCourseSummarySchema>;

export const RecentSubmissionSchema = z.object({
  submissionId: z.number(),
  assignmentTitle: z.string(),
  courseTitle: z.string(),
  studentName: z.string(),
  submittedAt: z.string(),
  status: z.string(),
});

export type RecentSubmission = z.infer<typeof RecentSubmissionSchema>;

export const CourseStatsSchema = z.object({
  draft: z.number(),
  published: z.number(),
  archived: z.number(),
});

export type CourseStats = z.infer<typeof CourseStatsSchema>;

export const InstructorDashboardResponseSchema = z.object({
  courses: z.array(InstructorCourseSummarySchema),
  totalPendingGrades: z.number(),
  recentSubmissions: z.array(RecentSubmissionSchema),
  courseStats: CourseStatsSchema,
});

export type InstructorDashboardResponse = z.infer<typeof InstructorDashboardResponseSchema>;
