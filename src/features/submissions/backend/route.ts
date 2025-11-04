import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { 
  getSubmissionById, 
  getSubmissionsByAssignment, 
  updateSubmission 
} from '@/features/submissions/backend/service';
import { submissionsErrorCodes, type SubmissionsServiceError } from '@/features/submissions/backend/error';

export const registerSubmissionsRoutes = (app: Hono<AppEnv>) => {
  // GET /api/submissions/:submissionId - fetch single submission
  app.get('/api/submissions/:submissionId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const submissionId = c.req.param('submissionId');

    if (!submissionId || isNaN(parseInt(submissionId, 10))) {
      return respond(c, failure(400, submissionsErrorCodes.validationError, 'Invalid submission ID'));
    }

    const result = await getSubmissionById(supabase, parseInt(submissionId, 10));

    if (!result.ok) {
      const errorResult = result as ErrorResult<SubmissionsServiceError, unknown>;
      logger.error('Failed to fetch submission', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        submissionId,
      });
    }

    return respond(c, result);
  });

  // GET /api/assignments/:assignmentId/submissions - fetch assignment submissions
  app.get('/api/assignments/:assignmentId/submissions', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const assignmentId = c.req.param('assignmentId');

    if (!assignmentId || isNaN(parseInt(assignmentId, 10))) {
      return respond(c, failure(400, submissionsErrorCodes.validationError, 'Invalid assignment ID'));
    }

    const result = await getSubmissionsByAssignment(supabase, parseInt(assignmentId, 10));

    if (!result.ok) {
      const errorResult = result as ErrorResult<SubmissionsServiceError, unknown>;
      logger.error('Failed to fetch submissions by assignment', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        assignmentId,
      });
    }

    return respond(c, result);
  });

  // PUT /api/submissions/:submissionId - update submission for grading
  app.put('/api/submissions/:submissionId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const submissionId = c.req.param('submissionId');

    if (!submissionId || isNaN(parseInt(submissionId, 10))) {
      return respond(c, failure(400, submissionsErrorCodes.validationError, 'Invalid submission ID'));
    }

    try {
      const body = await c.req.json();
      
      // Validate request body has at least one field to update
      const { contentText, contentLink, status, score, feedback } = body;
      
      if (contentText === undefined && contentLink === undefined && status === undefined && 
          score === undefined && feedback === undefined) {
        return respond(c, failure(400, submissionsErrorCodes.validationError, 'At least one field must be provided for update'));
      }

      // Validate status enum if provided
      if (status !== undefined && !['submitted', 'graded', 'resubmission_required'].includes(status)) {
        return respond(c, failure(400, submissionsErrorCodes.validationError, 'Invalid status value'));
      }

      // Validate score range if provided
      if (score !== undefined && score !== null && (score < 0 || score > 100)) {
        return respond(c, failure(400, submissionsErrorCodes.validationError, 'Score must be between 0 and 100'));
      }

      const result = await updateSubmission(supabase, parseInt(submissionId, 10), {
        contentText,
        contentLink,
        status,
        score,
        feedback,
      });

      if (!result.ok) {
        const errorResult = result as ErrorResult<SubmissionsServiceError, unknown>;
        logger.error('Failed to update submission', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          submissionId,
          updateData: { contentText, contentLink, status, score, feedback },
        });
      }

      return respond(c, result);
    } catch (error) {
      logger.error('Failed to parse request body for submission update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        submissionId,
      });
      return respond(c, failure(400, submissionsErrorCodes.validationError, 'Invalid request body'));
    }
  });
};
