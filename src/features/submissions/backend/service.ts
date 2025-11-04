import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type SubmissionResponse, type SubmissionListResponse } from '@/features/submissions/backend/schema';
import { submissionsErrorCodes, type SubmissionsServiceError } from '@/features/submissions/backend/error';

const SUBMISSIONS_TABLE = 'submissions';
const ASSIGNMENTS_TABLE = 'assignments';

const mapRowToSubmissionResponse = (row: any): SubmissionResponse => ({
  id: row.id,
  assignmentId: row.assignment_id,
  userId: row.user_id,
  contentText: row.content_text,
  contentLink: row.content_link,
  submittedAt: row.submitted_at,
  isLate: row.is_late,
  status: row.status,
  score: row.score,
  feedback: row.feedback,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getSubmissionsByLearner = async (
  client: SupabaseClient,
  userId: string,
  assignmentIds: number[],
): Promise<HandlerResult<SubmissionListResponse, SubmissionsServiceError, unknown>> => {
  try {
    if (assignmentIds.length === 0) {
      return success({ submissions: [] });
    }

    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .in('assignment_id', assignmentIds);

    if (error) {
      return failure(500, submissionsErrorCodes.fetchError, error.message);
    }

    const submissions: SubmissionResponse[] = (data || []).map(mapRowToSubmissionResponse);

    return success({ submissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const getRecentFeedbackByLearner = async (
  client: SupabaseClient,
  userId: string,
  daysSince: number = 7,
): Promise<HandlerResult<SubmissionListResponse, SubmissionsServiceError, unknown>> => {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysSince);

    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'graded')
      .gte('updated_at', sinceDate.toISOString())
      .order('updated_at', { ascending: false });

    if (error) {
      return failure(500, submissionsErrorCodes.fetchError, error.message);
    }

    const submissions: SubmissionResponse[] = (data || []).map(mapRowToSubmissionResponse);

    return success({ submissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const getSubmissionById = async (
  client: SupabaseClient,
  submissionId: number,
): Promise<HandlerResult<SubmissionResponse, SubmissionsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('id', submissionId)
      .single();

    if (error || !data) {
      return failure(404, submissionsErrorCodes.notFound, 'Submission not found');
    }

    const submission: SubmissionResponse = mapRowToSubmissionResponse(data);

    return success(submission);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const getSubmissionsByAssignment = async (
  client: SupabaseClient,
  assignmentId: number,
): Promise<HandlerResult<SubmissionListResponse, SubmissionsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      return failure(500, submissionsErrorCodes.fetchError, error.message);
    }

    const submissions: SubmissionResponse[] = (data || []).map(mapRowToSubmissionResponse);

    return success({ submissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const getSubmissionByAssignmentAndUser = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
): Promise<HandlerResult<SubmissionResponse, SubmissionsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return failure(404, submissionsErrorCodes.notFound, 'Submission not found');
    }

    const submission: SubmissionResponse = mapRowToSubmissionResponse(data);

    return success(submission);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const createSubmission = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
  contentText: string,
  contentLink: string | null,
  isLate: boolean,
): Promise<HandlerResult<SubmissionResponse, SubmissionsServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .insert({
        assignment_id: assignmentId,
        user_id: userId,
        content_text: contentText,
        content_link: contentLink,
        is_late: isLate,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return failure(409, submissionsErrorCodes.conflictError, 'Submission already exists for this assignment');
      }
      return failure(500, submissionsErrorCodes.fetchError, error.message);
    }

    if (!data) {
      return failure(500, submissionsErrorCodes.fetchError, 'Failed to create submission');
    }

    const submission: SubmissionResponse = mapRowToSubmissionResponse(data);

    return success(submission);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};

export const updateSubmission = async (
  client: SupabaseClient,
  submissionId: number,
  data: {
    contentText?: string;
    contentLink?: string | null;
    status?: 'submitted' | 'graded' | 'resubmission_required';
    score?: number | null;
    feedback?: string | null;
  },
): Promise<HandlerResult<SubmissionResponse, SubmissionsServiceError, unknown>> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.contentText !== undefined) updateData.content_text = data.contentText;
    if (data.contentLink !== undefined) updateData.content_link = data.contentLink;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.score !== undefined) updateData.score = data.score;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;

    const { data: result, error } = await client
      .from(SUBMISSIONS_TABLE)
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (error || !result) {
      return failure(404, submissionsErrorCodes.notFound, 'Submission not found');
    }

    const submission: SubmissionResponse = mapRowToSubmissionResponse(result);

    return success(submission);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};
