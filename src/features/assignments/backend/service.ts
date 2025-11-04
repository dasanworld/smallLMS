import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type AssignmentResponse, type AssignmentListResponse } from '@/features/assignments/backend/schema';
import { assignmentsErrorCodes, type AssignmentsServiceError } from '@/features/assignments/backend/error';

const ASSIGNMENTS_TABLE = 'assignments';

export const getAssignmentsByCourses = async (
  client: SupabaseClient,
  courseIds: number[],
  status: string = 'published',
): Promise<HandlerResult<AssignmentListResponse, AssignmentsServiceError, unknown>> => {
  try {
    if (courseIds.length === 0) {
      return success({ assignments: [] });
    }

    let query = client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .in('course_id', courseIds);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) {
      return failure(500, assignmentsErrorCodes.fetchError, error.message);
    }

    const assignments: AssignmentResponse[] = (data || []).map((row) => ({
      id: row.id,
      courseId: row.course_id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      scoreWeighting: row.score_weighting,
      allowLateSubmission: row.allow_late_submission,
      allowResubmission: row.allow_resubmission,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return success({ assignments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.fetchError, errorMessage);
  }
};
