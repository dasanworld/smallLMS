import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { completeOnboarding } from '@/features/auth/backend/onboarding/service';
import { OnboardingRequestSchema } from '@/features/auth/backend/onboarding/schema';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from '@/features/auth/backend/onboarding/error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/auth/onboarding', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const user = (await c.req.json()) as Record<string, unknown>;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(
          c,
          failure(401, onboardingErrorCodes.unauthorized, 'User not authenticated'),
        );
      }

      const parsedRequest = OnboardingRequestSchema.safeParse(user);

      if (!parsedRequest.success) {
        return respond(
          c,
          failure(
            400,
            onboardingErrorCodes.validationError,
            'Invalid onboarding data',
            parsedRequest.error.format(),
          ),
        );
      }

      const result = await completeOnboarding(
        supabase,
        authUser.id,
        parsedRequest.data
      );

      if (!result.ok) {
        const errorResult = result as ErrorResult<OnboardingServiceError, unknown>;
        logger.error('Onboarding failed', {
          code: errorResult.error.code,
          message: errorResult.error.message,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Onboarding route error', errorMessage);
      return respond(
        c,
        failure(
          500,
          onboardingErrorCodes.creationError,
          `Onboarding failed: ${errorMessage}`
        ),
      );
    }
  });
};
