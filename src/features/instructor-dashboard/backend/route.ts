import { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getInstructorDashboard } from '@/features/instructor-dashboard/backend/service';
import { instructorDashboardErrorCodes, type InstructorDashboardServiceError } from '@/features/instructor-dashboard/backend/error';

export const registerInstructorDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/instructor/dashboard', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized dashboard request');
        return respond(c, failure(401, instructorDashboardErrorCodes.unauthorized, 'Not authenticated'));
      }

      logger.info('Fetching instructor dashboard', { userId: user.id });
      const result = await getInstructorDashboard(supabase, user.id);

      if (!result.ok) {
        const errorResult = result as ErrorResult<InstructorDashboardServiceError, unknown>;
        logger.error('Failed to fetch dashboard', {
          code: errorResult.error.code,
          message: errorResult.error.message,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Unexpected error in dashboard route', { error: errorMessage });
      return respond(c, failure(500, instructorDashboardErrorCodes.fetchError, 'Failed to fetch dashboard'));
    }
  });
};
