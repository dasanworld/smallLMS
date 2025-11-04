import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getLearnerGrades, getSubmissionFeedback } from '@/features/grades/backend/service';
import { gradesErrorCodes, type GradesServiceError } from '@/features/grades/backend/error';

export const registerGradesRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/learner/grades', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized grades request');
        return respond(c, failure(401, gradesErrorCodes.unauthorized, 'Not authenticated'));
      }

      logger.info('Fetching grades for user', { userId: user.id });
      const result = await getLearnerGrades(supabase, user.id);

      if (!result.ok) {
        const errorResult = result as ErrorResult<GradesServiceError, unknown>;
        logger.error('Failed to fetch grades', {
          code: errorResult.error.code,
          message: errorResult.error.message,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Unexpected error in grades route', { error: errorMessage });
      return respond(c, failure(500, gradesErrorCodes.fetchError, 'Failed to fetch grades'));
    }
  });

  app.get('/api/submissions/:submissionId/feedback', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized feedback request');
        return respond(c, failure(401, gradesErrorCodes.unauthorized, 'Not authenticated'));
      }

      const submissionId = c.req.param('submissionId');
      if (!submissionId || isNaN(parseInt(submissionId, 10))) {
        return respond(c, failure(400, gradesErrorCodes.validationError, 'Invalid submission ID'));
      }

      logger.info('Fetching feedback', { submissionId, userId: user.id });
      const result = await getSubmissionFeedback(supabase, parseInt(submissionId, 10), user.id);

      if (!result.ok) {
        const errorResult = result as ErrorResult<GradesServiceError, unknown>;
        logger.error('Failed to fetch feedback', {
          code: errorResult.error.code,
          message: errorResult.error.message,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Unexpected error in feedback route', { error: errorMessage });
      return respond(c, failure(500, gradesErrorCodes.fetchError, 'Failed to fetch feedback'));
    }
  });
};
