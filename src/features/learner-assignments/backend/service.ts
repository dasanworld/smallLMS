import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type AssignmentResponse, type AssignmentListResponse } from '@/features/assignments/backend/schema';
import { learnerAssignmentsErrorCodes, type LearnerAssignmentsServiceError } from '@/features/learner-assignments/backend/error';
import { getAssignmentById, getAssignmentsByCourse, getAssignmentsByCourses } from '@/features/assignments/backend/service';
import { getCoursesByLearner } from '@/features/courses/backend/service';
import type { CourseListResponse } from '@/features/courses/backend/schema';

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

export const getLearnerAssignmentsAll = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<{ assignments: Array<{ id: number; courseId: number; courseTitle: string; title: string; dueDate: string | null; status: 'draft' | 'published' | 'closed' }> }, LearnerAssignmentsServiceError, unknown>> => {
  try {
    // 수강 중인 코스를 조회한 뒤, 각 코스의 공개(published) 및 마감(closed) 상태 과제를 합쳐 학습자용 목록을 구성합니다.
    // 주의: 디버깅용 콘솔 출력은 제거하고, 핵심 처리 단계는 주석으로 설명합니다.
    const coursesResult = await getCoursesByLearner(client, userId);
    if (!coursesResult.ok) {
      return coursesResult as any;
    }
    const courses = coursesResult.data.courses;
    if (courses.length === 0) {
      return success({ assignments: [] });
    }
    const courseIds = courses.map((c) => c.id);

    // 코스들의 공개 과제 조회 ('published' + 'closed' 병합)
    const publishedRes = await getAssignmentsByCourses(client, courseIds, 'published');
    const closedRes = await getAssignmentsByCourses(client, courseIds, 'closed');

    if (!publishedRes.ok && !closedRes.ok) {
      return (publishedRes as any);
    }

    const titleMap = new Map<number, string>();
    courses.forEach((c) => titleMap.set(c.id, c.title));

    const merged = [
      ...(publishedRes.ok ? publishedRes.data.assignments : []),
      ...(closedRes.ok ? closedRes.data.assignments : []),
    ];
    // 과제 ID로 중복 제거
    const seen = new Set<number>();
    const assignments = merged
      .filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .map((a) => ({
        id: a.id,
        courseId: a.courseId,
        courseTitle: titleMap.get(a.courseId) || '',
        title: a.title,
        dueDate: a.dueDate ?? null,
        status: a.status,
      }));
    return success({ assignments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, learnerAssignmentsErrorCodes.fetchError, errorMessage);
  }
};
