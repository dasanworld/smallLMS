import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type AssignmentResponse, type AssignmentListResponse } from '@/features/assignments/backend/schema';
import { learnerAssignmentsErrorCodes, type LearnerAssignmentsServiceError } from '@/features/learner-assignments/backend/error';
import { getAssignmentById, getAssignmentsByCourse } from '@/features/assignments/backend/service';

const ENROLLMENTS_TABLE = 'enrollments';

export const verifyLearnerEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<boolean, LearnerAssignmentsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error || !data) {
      return success(false);
    }

    return success(true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, learnerAssignmentsErrorCodes.fetchError, errorMessage);
  }
};

export const getLearnerAssignmentsByCourse = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<AssignmentListResponse, LearnerAssignmentsServiceError, unknown>> => {
  try {
    const enrollmentResult = await verifyLearnerEnrollment(client, userId, courseId);

    if (!enrollmentResult.ok) {
      return enrollmentResult as any;
    }

    if (!enrollmentResult.data) {
      return failure(403, learnerAssignmentsErrorCodes.notEnrolled, 'User is not enrolled in this course');
    }

    const assignmentsResult = await getAssignmentsByCourse(client, courseId, 'published');

    if (!assignmentsResult.ok) {
      return assignmentsResult as any;
    }

    return assignmentsResult as HandlerResult<AssignmentListResponse, LearnerAssignmentsServiceError, unknown>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, learnerAssignmentsErrorCodes.fetchError, errorMessage);
  }
};

export const getLearnerAssignmentDetail = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
): Promise<HandlerResult<AssignmentResponse, LearnerAssignmentsServiceError, unknown>> => {
  try {
    const enrollmentResult = await verifyLearnerEnrollment(client, userId, courseId);

    if (!enrollmentResult.ok) {
      return enrollmentResult as any;
    }

    if (!enrollmentResult.data) {
      return failure(403, learnerAssignmentsErrorCodes.notEnrolled, 'User is not enrolled in this course');
    }

    const assignmentResult = await getAssignmentById(client, assignmentId);

    if (!assignmentResult.ok) {
      return assignmentResult as any;
    }

    const assignment = assignmentResult.data;

    if (assignment.courseId !== courseId) {
      return failure(404, learnerAssignmentsErrorCodes.notFound, 'Assignment not found in this course');
    }

    if (assignment.status !== 'published' && assignment.status !== 'closed') {
      return failure(404, learnerAssignmentsErrorCodes.notFound, 'Assignment not available');
    }

    return assignmentResult as HandlerResult<AssignmentResponse, LearnerAssignmentsServiceError, unknown>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, learnerAssignmentsErrorCodes.fetchError, errorMessage);
  }
};
