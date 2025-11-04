import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { gradesErrorCodes, type GradesServiceError } from '@/features/grades/backend/error';
import type { LearnerGradesResponse, GradeSummary } from '@/features/grades/backend/schema';
import { calculateCourseGradeTotals } from '@/lib/shared/grade-calculations';

const SUBMISSIONS_TABLE = 'submissions';
const ASSIGNMENTS_TABLE = 'assignments';
const COURSES_TABLE = 'courses';

export const getLearnerGrades = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<LearnerGradesResponse, GradesServiceError, unknown>> => {
  try {
    console.log(`[getLearnerGrades] Fetching grades for user ${userId}`);

    const { data: submissions, error: submissionsError } = await client
      .from(SUBMISSIONS_TABLE)
      .select(
        `
        id,
        assignment_id,
        score,
        status,
        is_late,
        feedback,
        submitted_at,
        ${ASSIGNMENTS_TABLE}:assignment_id(
          id,
          title,
          score_weighting,
          course_id,
          ${COURSES_TABLE}:course_id(
            id,
            title
          )
        )
      `
      )
      .eq('user_id', userId);

    if (submissionsError) {
      console.error('[getLearnerGrades] Error fetching submissions:', submissionsError);
      return failure(500, gradesErrorCodes.fetchError, submissionsError.message);
    }

    if (!submissions || submissions.length === 0) {
      console.log('[getLearnerGrades] No submissions found');
      return success({
        submissions: [],
        courseTotals: [],
        message: '아직 제출한 과제가 없습니다',
      });
    }

    const gradeSummaries: GradeSummary[] = (submissions as any[]).map((sub) => {
      const summary: GradeSummary = {
        submissionId: sub.id,
        assignmentId: sub.assignment_id,
        assignmentTitle: sub.assignments?.title || 'Unknown',
        courseId: sub.assignments?.course_id,
        courseTitle: sub.assignments?.courses?.title || 'Unknown',
        score: sub.score,
        status: sub.status,
        isLate: sub.is_late,
        feedback: sub.feedback,
        submittedAt: sub.submitted_at,
        scoreWeighting: sub.assignments?.score_weighting || 0,
      };
      return summary;
    });

    const courseTotals = calculateCourseGradeTotals(gradeSummaries as any);

    console.log(`[getLearnerGrades] Retrieved ${gradeSummaries.length} submissions, ${courseTotals.length} courses`);

    return success({
      submissions: gradeSummaries,
      courseTotals,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getLearnerGrades] Error:', errorMessage);
    return failure(500, gradesErrorCodes.fetchError, errorMessage);
  }
};

export const getSubmissionFeedback = async (
  client: SupabaseClient,
  submissionId: number,
  userId: string
): Promise<HandlerResult<GradeSummary, GradesServiceError, unknown>> => {
  try {
    console.log(`[getSubmissionFeedback] Fetching feedback for submission ${submissionId}`);

    const { data: submission, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select(
        `
        id,
        assignment_id,
        user_id,
        score,
        status,
        is_late,
        feedback,
        submitted_at,
        ${ASSIGNMENTS_TABLE}:assignment_id(
          id,
          title,
          score_weighting,
          course_id,
          ${COURSES_TABLE}:course_id(
            id,
            title
          )
        )
      `
      )
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      console.log('[getSubmissionFeedback] Submission not found');
      return failure(404, gradesErrorCodes.notFound, 'Submission not found');
    }

    if ((submission as any).user_id !== userId) {
      console.log('[getSubmissionFeedback] User not authorized');
      return failure(403, gradesErrorCodes.unauthorized, 'Not authorized to view this submission');
    }

    const gradeSummary: GradeSummary = {
      submissionId: submission.id,
      assignmentId: submission.assignment_id,
      assignmentTitle: (submission as any).assignments?.title || 'Unknown',
      courseId: (submission as any).assignments?.course_id,
      courseTitle: (submission as any).assignments?.courses?.title || 'Unknown',
      score: submission.score,
      status: submission.status,
      isLate: submission.is_late,
      feedback: submission.feedback,
      submittedAt: submission.submitted_at,
      scoreWeighting: (submission as any).assignments?.score_weighting || 0,
    };

    return success(gradeSummary);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getSubmissionFeedback] Error:', errorMessage);
    return failure(500, gradesErrorCodes.fetchError, errorMessage);
  }
};
