import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type AssignmentResponse, type AssignmentListResponse } from '@/features/assignments/backend/schema';
import { assignmentsErrorCodes, type AssignmentsServiceError } from '@/features/assignments/backend/error';

const ASSIGNMENTS_TABLE = 'assignments';

const mapRowToAssignmentResponse = (row: any): AssignmentResponse => ({
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
});

export const getAssignmentsByCourse = async (
  client: SupabaseClient,
  courseId: number,
  status?: string,
): Promise<HandlerResult<AssignmentListResponse, AssignmentsServiceError, unknown>> => {
  try {
    let query = client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('course_id', courseId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) {
      return failure(500, assignmentsErrorCodes.fetchError, error.message);
    }

    const assignments: AssignmentResponse[] = (data || []).map(mapRowToAssignmentResponse);

    return success({ assignments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.fetchError, errorMessage);
  }
};

export const getAssignmentById = async (
  client: SupabaseClient,
  assignmentId: number,
): Promise<HandlerResult<AssignmentResponse, AssignmentsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error || !data) {
      return failure(404, assignmentsErrorCodes.notFound, 'Assignment not found');
    }

    const assignment: AssignmentResponse = mapRowToAssignmentResponse(data);

    return success(assignment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.fetchError, errorMessage);
  }
};

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

    const assignments: AssignmentResponse[] = (data || []).map(mapRowToAssignmentResponse);

    return success({ assignments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.fetchError, errorMessage);
  }
};

export interface CreateAssignmentInput {
  title: string;
  description?: string;
  dueDate: string;
  scoreWeighting: number;
  allowLateSubmission?: boolean;
  allowResubmission?: boolean;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  dueDate?: string;
  scoreWeighting?: number;
  allowLateSubmission?: boolean;
  allowResubmission?: boolean;
}

export const createAssignment = async (
  client: SupabaseClient,
  courseId: number,
  userId: string,
  input: CreateAssignmentInput,
): Promise<HandlerResult<AssignmentResponse, AssignmentsServiceError, unknown>> => {
  try {
    // 새 과제는 기본적으로 'draft' 상태로 생성됩니다. 이후 상태 변경 API를 통해 게시/마감이 가능합니다.

    if (!input.title?.trim()) {
      return failure(400, assignmentsErrorCodes.validationError, 'Assignment title is required');
    }

    if (input.scoreWeighting < 0 || input.scoreWeighting > 100) {
      return failure(400, assignmentsErrorCodes.validationError, 'Score weighting must be between 0 and 100');
    }

    const { data, error } = await client
      .from(ASSIGNMENTS_TABLE)
      .insert({
        course_id: courseId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        due_date: input.dueDate,
        score_weighting: input.scoreWeighting,
        allow_late_submission: input.allowLateSubmission ?? true,
        allow_resubmission: input.allowResubmission ?? true,
        status: 'draft',
      })
      .select('*')
      .single();

    if (error) {
      return failure(500, assignmentsErrorCodes.createError, error.message);
    }

    if (!data) {
      return failure(500, assignmentsErrorCodes.createError, 'Failed to create assignment');
    }

    return success(mapRowToAssignmentResponse(data));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.createError, errorMessage);
  }
};

export const updateAssignment = async (
  client: SupabaseClient,
  assignmentId: number,
  courseId: number,
  input: UpdateAssignmentInput,
): Promise<HandlerResult<AssignmentResponse, AssignmentsServiceError, unknown>> => {
  try {
    // 전달된 필드만 부분 업데이트합니다. 빈 문자열은 허용하지 않으며 필요 시 null로 정규화합니다.

    if (input.title !== undefined && !input.title.trim()) {
      return failure(400, assignmentsErrorCodes.validationError, 'Assignment title cannot be empty');
    }

    if (input.scoreWeighting !== undefined && (input.scoreWeighting < 0 || input.scoreWeighting > 100)) {
      return failure(400, assignmentsErrorCodes.validationError, 'Score weighting must be between 0 and 100');
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description.trim() || null;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.scoreWeighting !== undefined) updateData.score_weighting = input.scoreWeighting;
    if (input.allowLateSubmission !== undefined) updateData.allow_late_submission = input.allowLateSubmission;
    if (input.allowResubmission !== undefined) updateData.allow_resubmission = input.allowResubmission;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from(ASSIGNMENTS_TABLE)
      .update(updateData)
      .eq('id', assignmentId)
      .eq('course_id', courseId)
      .select('*')
      .single();

    if (error || !data) {
      return failure(404, assignmentsErrorCodes.notFound, 'Assignment not found');
    }

    return success(mapRowToAssignmentResponse(data));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.updateError, errorMessage);
  }
};

export const updateAssignmentStatus = async (
  client: SupabaseClient,
  assignmentId: number,
  courseId: number,
  status: 'draft' | 'published' | 'closed',
): Promise<HandlerResult<AssignmentResponse, AssignmentsServiceError, unknown>> => {
  try {
    // 상태 변경은 'closed'로 전환된 이후에는 다시 변경할 수 없도록 제한합니다.

    const { data: existing } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('status')
      .eq('id', assignmentId)
      .eq('course_id', courseId)
      .single();

    if (!existing) {
      return failure(404, assignmentsErrorCodes.notFound, 'Assignment not found');
    }

    if (existing.status === 'closed') {
      return failure(400, assignmentsErrorCodes.validationError, 'Cannot change closed assignment status');
    }

    const { data, error } = await client
      .from(ASSIGNMENTS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select('*')
      .single();

    if (error || !data) {
      return failure(500, assignmentsErrorCodes.updateError, 'Failed to update assignment status');
    }

    return success(mapRowToAssignmentResponse(data));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, assignmentsErrorCodes.updateError, errorMessage);
  }
};
