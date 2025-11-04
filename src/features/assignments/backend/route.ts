import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getAssignmentsByCourse, getAssignmentById } from '@/features/assignments/backend/service';
import { assignmentsErrorCodes, type AssignmentsServiceError } from '@/features/assignments/backend/error';

export const registerAssignmentsRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const courseId = c.req.param('courseId');
    const status = c.req.query('status');

    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid course ID'));
    }

    const result = await getAssignmentsByCourse(supabase, parseInt(courseId, 10), status);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentsServiceError, unknown>;
      logger.error('Failed to fetch assignments by course', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        courseId,
      });
    }

    return respond(c, result);
  });

  app.get('/api/assignments/:assignmentId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const assignmentId = c.req.param('assignmentId');

    if (!assignmentId || isNaN(parseInt(assignmentId, 10))) {
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid assignment ID'));
    }

    const result = await getAssignmentById(supabase, parseInt(assignmentId, 10));

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentsServiceError, unknown>;
      logger.error('Failed to fetch assignment', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        assignmentId,
      });
    }

    return respond(c, result);
  });
};
