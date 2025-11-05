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
    // 수강 중인 코스 조회
    console.log('[getLearnerAssignmentsAll] user:', userId);
    const coursesResult = await getCoursesByLearner(client, userId);
    if (!coursesResult.ok) {
      console.error('[getLearnerAssignmentsAll] courses error', coursesResult);
      return coursesResult as any;
    }
    const courses = coursesResult.data.courses;
    console.log('[getLearnerAssignmentsAll] enrolled courses:', courses.length);
    if (courses.length === 0) {
      return success({ assignments: [] });
    }
    const courseIds = courses.map((c) => c.id);
    console.log('[getLearnerAssignmentsAll] courseIds:', courseIds);

    // 코스들의 공개 과제 조회 ('published' + 'closed' 병합)
    const publishedRes = await getAssignmentsByCourses(client, courseIds, 'published');
    const closedRes = await getAssignmentsByCourses(client, courseIds, 'closed');

    if (!publishedRes.ok && !closedRes.ok) {
      console.error('[getLearnerAssignmentsAll] assignments error', { publishedRes, closedRes });
      return (publishedRes as any);
    }

    const titleMap = new Map<number, string>();
    courses.forEach((c) => titleMap.set(c.id, c.title));

    const merged = [
      ...(publishedRes.ok ? publishedRes.data.assignments : []),
      ...(closedRes.ok ? closedRes.data.assignments : []),
    ];
    if (publishedRes.ok) {
      console.log('[getLearnerAssignmentsAll] published count:', publishedRes.data.assignments.length);
    } else {
      console.error('[getLearnerAssignmentsAll] published error');
    }
    if (closedRes.ok) {
      console.log('[getLearnerAssignmentsAll] closed count:', closedRes.data.assignments.length);
    } else {
      console.error('[getLearnerAssignmentsAll] closed error');
    }
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

    console.log('[getLearnerAssignmentsAll] assignments count:', assignments.length);
    if (assignments.length === 0) {
      // 추가 디버그: draft 상태 과제 유무 확인 (출력만, 응답에는 포함하지 않음)
      const draftRes = await getAssignmentsByCourses(client, courseIds, 'draft');
      if (draftRes.ok) {
        console.log('[getLearnerAssignmentsAll][debug] draft assignments count:', draftRes.data.assignments.length);
      } else {
        console.error('[getLearnerAssignmentsAll][debug] draft query error', draftRes);
      }
    }
    return success({ assignments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getLearnerAssignmentsAll] exception', errorMessage);
    return failure(500, learnerAssignmentsErrorCodes.fetchError, errorMessage);
  }
};
