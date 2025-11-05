import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getLearnerAssignmentsByCourse, getLearnerAssignmentDetail, getLearnerAssignmentsAll } from '@/features/learner-assignments/backend/service';
import { learnerAssignmentsErrorCodes, type LearnerAssignmentsServiceError } from '@/features/learner-assignments/backend/error';

export const registerLearnerAssignmentsRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/learner/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return respond(c, failure(401, learnerAssignmentsErrorCodes.unauthorized, 'User not authenticated'));
    }

    logger.info('[LearnerAssignments] Fetch all assignments start', { userId: user.id });
    const result = await getLearnerAssignmentsAll(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<LearnerAssignmentsServiceError, unknown>;
      logger.error('[LearnerAssignments] Failed to fetch', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        userId: user.id,
      });
    }
    if (result.ok) {
      logger.info('[LearnerAssignments] Success', {
        count: result.data.assignments.length,
        sample: result.data.assignments.slice(0, 2),
      });
    }
    return respond(c, result);
  });
  app.get('/api/learner/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(c, failure(401, learnerAssignmentsErrorCodes.unauthorized, 'User not authenticated'));
    }

    const courseId = c.req.param('courseId');

    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return respond(c, failure(400, learnerAssignmentsErrorCodes.validationError, 'Invalid course ID'));
    }

    const result = await getLearnerAssignmentsByCourse(supabase, user.id, parseInt(courseId, 10));

    if (!result.ok) {
      const errorResult = result as ErrorResult<LearnerAssignmentsServiceError, unknown>;
      logger.error('Failed to fetch learner assignments by course', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        courseId,
        userId: user.id,
      });
    }

    return respond(c, result);
  });

  app.get('/api/learner/courses/:courseId/assignments/:assignmentId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(c, failure(401, learnerAssignmentsErrorCodes.unauthorized, 'User not authenticated'));
    }

    const courseId = c.req.param('courseId');
    const assignmentId = c.req.param('assignmentId');

    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return respond(c, failure(400, learnerAssignmentsErrorCodes.validationError, 'Invalid course ID'));
    }

    if (!assignmentId || isNaN(parseInt(assignmentId, 10))) {
      return respond(c, failure(400, learnerAssignmentsErrorCodes.validationError, 'Invalid assignment ID'));
    }

    const result = await getLearnerAssignmentDetail(
      supabase,
      user.id,
      parseInt(assignmentId, 10),
      parseInt(courseId, 10),
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<LearnerAssignmentsServiceError, unknown>;
      logger.error('Failed to fetch learner assignment detail', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        courseId,
        assignmentId,
        userId: user.id,
      });
    }

    return respond(c, result);
  });
};
