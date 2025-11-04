import { z } from 'zod';

export const CourseProgressSchema = z.object({
  courseId: z.number(),
  courseTitle: z.string(),
  progressPercentage: z.number(),
  completedAssignments: z.number(),
  totalAssignments: z.number(),
});

export type CourseProgressType = z.infer<typeof CourseProgressSchema>;

export const UpcomingAssignmentSchema = z.object({
  assignmentId: z.number(),
  courseTitle: z.string(),
  title: z.string(),
  dueDate: z.string(),
  daysLeft: z.number(),
});

export type UpcomingAssignmentType = z.infer<typeof UpcomingAssignmentSchema>;

export const RecentFeedbackSchema = z.object({
  submissionId: z.number(),
  assignmentTitle: z.string(),
  courseTitle: z.string(),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  gradedAt: z.string(),
});

export type RecentFeedbackType = z.infer<typeof RecentFeedbackSchema>;

export const DashboardResponseSchema = z.object({
  courses: z.array(CourseProgressSchema),
  upcomingAssignments: z.array(UpcomingAssignmentSchema),
  recentFeedback: z.array(RecentFeedbackSchema),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
