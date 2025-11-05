import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getAssignmentsByCourse, getAssignmentById, createAssignment, updateAssignment, updateAssignmentStatus, type CreateAssignmentInput, type UpdateAssignmentInput } from '@/features/assignments/backend/service';
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

  app.post('/api/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logger.warn('Unauthorized create assignment - no user');
      return respond(c, failure(401, assignmentsErrorCodes.validationError, 'Unauthorized'));
    }

    const courseId = c.req.param('courseId');
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid course ID'));
    }

    try {
      const body: CreateAssignmentInput = await c.req.json();
      const result = await createAssignment(supabase, parseInt(courseId, 10), user.id, body);

      if (!result.ok) {
        const errorResult = result as ErrorResult<AssignmentsServiceError, unknown>;
        logger.error('Failed to create assignment', { code: errorResult.error.code });
      }

      return respond(c, result);
    } catch (error) {
      logger.error('Invalid request body');
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid request body'));
    }
  });

  app.put('/api/courses/:courseId/assignments/:assignmentId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const courseId = c.req.param('courseId');
    const assignmentId = c.req.param('assignmentId');

    if (!courseId || isNaN(parseInt(courseId, 10)) || !assignmentId || isNaN(parseInt(assignmentId, 10))) {
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid IDs'));
    }

    try {
      const body: UpdateAssignmentInput = await c.req.json();
      const result = await updateAssignment(supabase, parseInt(assignmentId, 10), parseInt(courseId, 10), body);

      if (!result.ok) {
        const errorResult = result as ErrorResult<AssignmentsServiceError, unknown>;
        logger.error('Failed to update assignment', { code: errorResult.error.code });
      }

      return respond(c, result);
    } catch (error) {
      logger.error('Invalid request body');
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid request body'));
    }
  });

  app.patch('/api/courses/:courseId/assignments/:assignmentId/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const courseId = c.req.param('courseId');
    const assignmentId = c.req.param('assignmentId');

    if (!courseId || isNaN(parseInt(courseId, 10)) || !assignmentId || isNaN(parseInt(assignmentId, 10))) {
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid IDs'));
    }

    try {
      const body: { status: 'draft' | 'published' | 'closed' } = await c.req.json();
      if (!['draft', 'published', 'closed'].includes(body.status)) {
        return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid status'));
      }

      const result = await updateAssignmentStatus(supabase, parseInt(assignmentId, 10), parseInt(courseId, 10), body.status);

      if (!result.ok) {
        const errorResult = result as ErrorResult<AssignmentsServiceError, unknown>;
        logger.error('Failed to update assignment status', { code: errorResult.error.code });
      }

      return respond(c, result);
    } catch (error) {
      logger.error('Invalid request body');
      return respond(c, failure(400, assignmentsErrorCodes.validationError, 'Invalid request body'));
    }
  });
};
