import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult, type ErrorResult } from '@/backend/http/response';
import { type DashboardResponse } from '@/features/dashboard/backend/schema';
import { dashboardErrorCodes, type DashboardServiceError } from '@/features/dashboard/backend/error';
import { getCoursesByLearner } from '@/features/courses/backend/service';
import { getAssignmentsByCourses } from '@/features/assignments/backend/service';
import { getSubmissionsByLearner, getRecentFeedbackByLearner } from '@/features/submissions/backend/service';
import {
  calculateProgress,
  isUpcomingAssignment,
  getDaysLeft,
} from '@/lib/shared/progress-calculation';

const ENROLLMENTS_TABLE = 'enrollments';
const COURSES_TABLE = 'courses';
const ASSIGNMENTS_TABLE = 'assignments';
const SUBMISSIONS_TABLE = 'submissions';

export const getLearnerDashboard = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<DashboardResponse, DashboardServiceError, unknown>> => {
  try {
    const enrolledCoursesResult = await getCoursesByLearner(client, userId);
    if (!enrolledCoursesResult.ok) {
      const errorResult = enrolledCoursesResult as unknown as ErrorResult<DashboardServiceError, unknown>;
      return failure(errorResult.status, errorResult.error.code, errorResult.error.message);
    }

    const enrolledCourses = enrolledCoursesResult.data.courses;

    if (enrolledCourses.length === 0) {
      return success({
        courses: [],
        upcomingAssignments: [],
        recentFeedback: [],
      });
    }

    const courseIds = enrolledCourses.map((c) => c.id);

    // 게시(published)와 마감(closed)을 모두 합쳐 진행률/제출 집계에 사용
    const publishedRes = await getAssignmentsByCourses(client, courseIds, 'published');
    const closedRes = await getAssignmentsByCourses(client, courseIds, 'closed');

    if (!publishedRes.ok && !closedRes.ok) {
      const errorResult = (publishedRes.ok ? closedRes : publishedRes) as unknown as ErrorResult<DashboardServiceError, unknown>;
      return failure(errorResult.status, errorResult.error.code, errorResult.error.message);
    }

    const publishedAssignments = publishedRes.ok ? publishedRes.data.assignments : [];
    const closedAssignments = closedRes.ok ? closedRes.data.assignments : [];
    const assignments = [...publishedAssignments, ...closedAssignments];
    const assignmentIds = assignments.map((a) => a.id);

    const submissionsResult = await getSubmissionsByLearner(client, userId, assignmentIds);
    if (!submissionsResult.ok) {
      const errorResult = submissionsResult as unknown as ErrorResult<DashboardServiceError, unknown>;
      return failure(errorResult.status, errorResult.error.code, errorResult.error.message);
    }

    const submissions = submissionsResult.data.submissions;

    const feedbackResult = await getRecentFeedbackByLearner(client, userId);
    if (!feedbackResult.ok) {
      const errorResult = feedbackResult as unknown as ErrorResult<DashboardServiceError, unknown>;
      return failure(errorResult.status, errorResult.error.code, errorResult.error.message);
    }

    const recentFeedback = feedbackResult.data.submissions;

    const courseProgress = enrolledCourses.map((course) => {
      const courseAssignments = assignments.filter((a) => a.courseId === course.id);
      const courseAssignmentIds = new Set(courseAssignments.map((a) => a.id));

      // 제출: 해당 코스 과제에 대해 학습자가 제출한 과제 수(중복 과제ID 제거)
      const submittedAssignmentIdSet = new Set<number>();
      // 완료: 채점 완료(graded)된 제출 수(중복 과제ID 제거)
      const completedAssignmentIdSet = new Set<number>();

      for (const s of submissions) {
        if (!courseAssignmentIds.has(s.assignmentId)) continue;
        submittedAssignmentIdSet.add(s.assignmentId);
        if (s.status === 'graded') {
          completedAssignmentIdSet.add(s.assignmentId);
        }
      }

      const total = courseAssignments.length;
      const submitted = submittedAssignmentIdSet.size;
      const completed = completedAssignmentIdSet.size;
      const percentage = calculateProgress(completed, total);

      return {
        courseId: course.id,
        courseTitle: course.title,
        progressPercentage: percentage,
        submittedAssignments: submitted,
        completedAssignments: completed,
        totalAssignments: total,
      };
    });

    // 예정 과제는 공개(published)만 대상으로 계산
    const upcomingAssignmentsData = publishedAssignments
      .filter((assignment) => assignment.dueDate && isUpcomingAssignment(assignment.dueDate))
      .map((assignment) => {
        const course = enrolledCourses.find((c) => c.id === assignment.courseId);
        return {
          assignmentId: assignment.id,
          courseTitle: course?.title || '',
          title: assignment.title,
          dueDate: assignment.dueDate,
          daysLeft: getDaysLeft(assignment.dueDate),
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const recentFeedbackData = recentFeedback.map((submission) => {
      const assignment = assignments.find((a) => a.id === submission.assignmentId);
      const course = enrolledCourses.find((c) => c.id === assignment?.courseId);
      return {
        submissionId: submission.id,
        assignmentTitle: assignment?.title || '',
        courseTitle: course?.title || '',
        score: submission.score,
        feedback: submission.feedback,
        gradedAt: submission.submittedAt,
      };
    });

    return success({
      courses: courseProgress,
      upcomingAssignments: upcomingAssignmentsData,
      recentFeedback: recentFeedbackData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, dashboardErrorCodes.fetchError, errorMessage);
  }
};
