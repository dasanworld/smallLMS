import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getLearnerDashboard } from '@/features/dashboard/backend/service';
import { dashboardErrorCodes, type DashboardServiceError } from '@/features/dashboard/backend/error';

export const registerDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/learner/dashboard', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(c, failure(401, dashboardErrorCodes.unauthorized, 'User not authenticated'));
      }

      const result = await getLearnerDashboard(supabase, authUser.id);

      if (!result.ok) {
        const errorResult = result as ErrorResult<DashboardServiceError, unknown>;
        logger.info('Dashboard fetch attempt', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          userId: authUser.id,
        });
      } else {
        logger.info('Dashboard fetched', { userId: authUser.id });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Dashboard route error', errorMessage);
      return respond(c, failure(500, dashboardErrorCodes.fetchError, errorMessage));
    }
  });
};
