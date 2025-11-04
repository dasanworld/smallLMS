import { Hono } from 'hono';
import { failure, respond, success, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { submitAssignment, getLearnerSubmissionStatus } from '@/features/learner-submissions/backend/service';
import { learnerSubmissionsErrorCodes, type LearnerSubmissionsServiceError } from '@/features/learner-submissions/backend/error';
import { SubmissionRequestSchema } from '@/features/learner-submissions/backend/schema';

export const registerLearnerSubmissionsRoutes = (app: Hono<AppEnv>) => {
  // POST /api/assignments/:assignmentId/submit - Submit or resubmit assignment
  app.post('/api/assignments/:assignmentId/submit', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized submission attempt - no user');
        return respond(c, failure(401, learnerSubmissionsErrorCodes.unauthorized, 'User not authenticated'));
      }

      // Get and validate assignment ID
      const assignmentIdParam = c.req.param('assignmentId');
      if (!assignmentIdParam || isNaN(parseInt(assignmentIdParam, 10))) {
        logger.warn('Invalid assignment ID in submission request', { assignmentId: assignmentIdParam });
        return respond(c, failure(400, learnerSubmissionsErrorCodes.validationError, 'Invalid assignment ID'));
      }

      const assignmentId = parseInt(assignmentIdParam, 10);

      // Get course ID from query params or request body
      const courseIdFromQuery = c.req.query('courseId');
      const requestBody = await c.req.json().catch(() => ({}));
      const courseIdFromBody = requestBody.courseId;
      
      const courseIdParam = courseIdFromQuery || courseIdFromBody;
      if (!courseIdParam || isNaN(parseInt(courseIdParam, 10))) {
        logger.warn('Invalid or missing course ID in submission request', { 
          courseIdFromQuery, 
          courseIdFromBody,
          assignmentId 
        });
        return respond(c, failure(400, learnerSubmissionsErrorCodes.validationError, 'Valid course ID is required'));
      }

      const courseId = parseInt(courseIdParam, 10);

      // Parse and validate request body
      const validationResult = SubmissionRequestSchema.safeParse(requestBody);
      if (!validationResult.success) {
        logger.warn('Invalid submission request body', { 
          errors: validationResult.error.errors,
          assignmentId,
          userId: user.id 
        });
        return respond(c, failure(400, learnerSubmissionsErrorCodes.validationError, 'Invalid submission data'));
      }

      const { contentText, contentLink } = validationResult.data;

      logger.info('Processing assignment submission', {
        userId: user.id,
        assignmentId,
        courseId,
        hasContentLink: !!contentLink,
      });

      // Submit assignment
      const result = await submitAssignment(
        supabase,
        user.id,
        assignmentId,
        courseId,
        contentText,
        contentLink
      );

      if (!result.ok) {
        const errorResult = result as ErrorResult<LearnerSubmissionsServiceError, unknown>;
        logger.error('Assignment submission failed', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          assignmentId,
          courseId,
          userId: user.id,
        });

        // Map specific errors to appropriate HTTP status codes
        switch (errorResult.error.code) {
          case learnerSubmissionsErrorCodes.unauthorized:
          case learnerSubmissionsErrorCodes.notEnrolled:
            return respond(c, failure(403, errorResult.error.code, errorResult.error.message));
          case learnerSubmissionsErrorCodes.notFound:
            return respond(c, failure(404, errorResult.error.code, errorResult.error.message));
          case learnerSubmissionsErrorCodes.validationError:
          case learnerSubmissionsErrorCodes.validationFailed:
          case learnerSubmissionsErrorCodes.deadlineExceeded:
          case learnerSubmissionsErrorCodes.resubmissionNotAllowed:
          case learnerSubmissionsErrorCodes.assignmentClosed:
            return respond(c, failure(400, errorResult.error.code, errorResult.error.message));
          default:
            return respond(c, failure(500, errorResult.error.code, errorResult.error.message));
        }
      }

      logger.info('Assignment submission completed successfully', {
        userId: user.id,
        assignmentId,
        courseId,
        submissionId: result.data.submission.id,
      });

      // Return 201 Created for successful submission
      return c.json(result.data, 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Unexpected error in assignment submission', { 
        error: errorMessage,
        assignmentId: c.req.param('assignmentId'),
      });
      return respond(c, failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to process submission'));
    }
  });

  // GET /api/assignments/:assignmentId/my-submission - Get user's submission for assignment
  app.get('/api/assignments/:assignmentId/my-submission', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized my-submission request - no user');
        return respond(c, failure(401, learnerSubmissionsErrorCodes.unauthorized, 'User not authenticated'));
      }

      // Get and validate assignment ID
      const assignmentIdParam = c.req.param('assignmentId');
      if (!assignmentIdParam || isNaN(parseInt(assignmentIdParam, 10))) {
        logger.warn('Invalid assignment ID in my-submission request', { assignmentId: assignmentIdParam });
        return respond(c, failure(400, learnerSubmissionsErrorCodes.validationError, 'Invalid assignment ID'));
      }

      const assignmentId = parseInt(assignmentIdParam, 10);

      // Get course ID from query params
      const courseIdParam = c.req.query('courseId');
      if (!courseIdParam || isNaN(parseInt(courseIdParam, 10))) {
        logger.warn('Invalid or missing course ID in my-submission request', { 
          courseId: courseIdParam,
          assignmentId 
        });
        return respond(c, failure(400, learnerSubmissionsErrorCodes.validationError, 'Valid course ID is required'));
      }

      const courseId = parseInt(courseIdParam, 10);

      logger.info('Getting learner submission status', {
        userId: user.id,
        assignmentId,
        courseId,
      });

      // Get learner submission status and context
      const result = await getLearnerSubmissionStatus(
        supabase,
        user.id,
        assignmentId,
        courseId
      );

      if (!result.ok) {
        const errorResult = result as ErrorResult<LearnerSubmissionsServiceError, unknown>;
        logger.error('Failed to get learner submission status', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          assignmentId,
          courseId,
          userId: user.id,
        });

        // Map specific errors to appropriate HTTP status codes
        switch (errorResult.error.code) {
          case learnerSubmissionsErrorCodes.unauthorized:
          case learnerSubmissionsErrorCodes.notEnrolled:
            return respond(c, failure(403, errorResult.error.code, errorResult.error.message));
          case learnerSubmissionsErrorCodes.notFound:
            return respond(c, failure(404, errorResult.error.code, errorResult.error.message));
          case learnerSubmissionsErrorCodes.validationError:
            return respond(c, failure(400, errorResult.error.code, errorResult.error.message));
          default:
            return respond(c, failure(500, errorResult.error.code, errorResult.error.message));
        }
      }

      logger.info('Learner submission status retrieved successfully', {
        userId: user.id,
        assignmentId,
        courseId,
        hasSubmission: result.data.hasSubmission,
        canSubmit: result.data.canSubmit,
        canResubmit: result.data.canResubmit,
      });

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Unexpected error in get my-submission', { 
        error: errorMessage,
        assignmentId: c.req.param('assignmentId'),
      });
      return respond(c, failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to get submission status'));
    }
  });
};