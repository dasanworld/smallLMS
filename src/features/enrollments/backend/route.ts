import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { createEnrollment, cancelEnrollment, checkEnrollmentStatus } from '@/features/enrollments/backend/service';
import { EnrollmentRequestSchema } from '@/features/enrollments/backend/schema';
import { enrollmentsErrorCodes, type EnrollmentsServiceError } from '@/features/enrollments/backend/error';

export const registerEnrollmentsRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/enrollments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const body = (await c.req.json()) as Record<string, unknown>;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(c, failure(401, enrollmentsErrorCodes.unauthorized, 'User not authenticated'));
      }

      const parsedRequest = EnrollmentRequestSchema.safeParse(body);

      if (!parsedRequest.success) {
        return respond(c, failure(400, enrollmentsErrorCodes.validationError, 'Invalid enrollment request', parsedRequest.error.format()));
      }

      const result = await createEnrollment(supabase, authUser.id, parsedRequest.data.courseId);

      if (!result.ok) {
        const errorResult = result as ErrorResult<EnrollmentsServiceError, unknown>;
        logger.info('Enrollment creation attempt', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          userId: authUser.id,
          courseId: parsedRequest.data.courseId,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Enrollment route error', errorMessage);
      return respond(c, failure(500, enrollmentsErrorCodes.creationError, errorMessage));
    }
  });

  app.delete('/api/enrollments/:courseId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const courseId = c.req.param('courseId');

      if (!courseId || isNaN(parseInt(courseId, 10))) {
        return respond(c, failure(400, enrollmentsErrorCodes.validationError, 'Invalid course ID'));
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(c, failure(401, enrollmentsErrorCodes.unauthorized, 'User not authenticated'));
      }

      const result = await cancelEnrollment(supabase, authUser.id, parseInt(courseId, 10));

      if (!result.ok) {
        const errorResult = result as ErrorResult<EnrollmentsServiceError, unknown>;
        logger.info('Enrollment cancellation attempt', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          userId: authUser.id,
          courseId: parseInt(courseId, 10),
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Enrollment cancellation route error', errorMessage);
      return respond(c, failure(500, enrollmentsErrorCodes.cancellationError, errorMessage));
    }
  });

  app.get('/api/enrollments/:courseId/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const courseId = c.req.param('courseId');

      if (!courseId || isNaN(parseInt(courseId, 10))) {
        return respond(c, failure(400, enrollmentsErrorCodes.validationError, 'Invalid course ID'));
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(c, failure(401, enrollmentsErrorCodes.unauthorized, 'User not authenticated'));
      }

      const result = await checkEnrollmentStatus(supabase, authUser.id, parseInt(courseId, 10));

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Enrollment status check route error', errorMessage);
      return respond(c, failure(500, enrollmentsErrorCodes.validationError, errorMessage));
    }
  });
};
