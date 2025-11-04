import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { type SubmissionResponse, type SubmissionListResponse } from '@/features/submissions/backend/schema';
import { submissionsErrorCodes, type SubmissionsServiceError } from '@/features/submissions/backend/error';

const SUBMISSIONS_TABLE = 'submissions';
const ASSIGNMENTS_TABLE = 'assignments';

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

    const submissions: SubmissionResponse[] = (data || []).map((row) => ({
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
    }));

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

    const submissions: SubmissionResponse[] = (data || []).map((row) => ({
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
    }));

    return success({ submissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, submissionsErrorCodes.fetchError, errorMessage);
  }
};
