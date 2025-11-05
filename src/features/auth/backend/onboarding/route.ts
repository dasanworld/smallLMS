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
import { completeOnboarding, checkOnboardingStatus } from '@/features/auth/backend/onboarding/service';
import { OnboardingRequestSchema } from '@/features/auth/backend/onboarding/schema';
import { randomUUID } from 'crypto';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from '@/features/auth/backend/onboarding/error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/auth/onboarding', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return respond(
          c,
          failure(401, onboardingErrorCodes.unauthorized, 'User not authenticated'),
        );
      }

      const result = await checkOnboardingStatus(supabase, authUser.id);

      if (!result.ok) {
        const errorResult = result as ErrorResult<OnboardingServiceError, unknown>;
        logger.error('Onboarding status check failed', {
          code: errorResult.error.code,
          message: errorResult.error.message,
        });
      }

      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Onboarding status route error', errorMessage);
      return respond(
        c,
        failure(
          500,
          onboardingErrorCodes.databaseError,
          `Onboarding status check failed: ${errorMessage}`
        ),
      );
    }
  });

  app.post('/api/auth/onboarding', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const user = (await c.req.json()) as Record<string, unknown>;

      // 1) 쿠키에서 Supabase access_token 추출
      const cookieHeader = c.req.header('cookie') ?? '';
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, part) => {
        const [k, v] = part.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});

      // sb-<project-ref>-auth-token (base64-encoded JSON with { access_token, refresh_token, ... })
      const authCookieKey = Object.keys(cookies).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token') && !k.includes('code-verifier'));

      let accessToken: string | null = null;
      if (authCookieKey) {
        const raw = cookies[authCookieKey];
        if (raw?.startsWith('base64-')) {
          try {
            const decoded = Buffer.from(raw.substring(7), 'base64').toString('utf-8');
            // 대부분의 경우 JSON 문자열이므로 파싱 후 access_token 추출
            const parsed = JSON.parse(decoded) as { access_token?: string };
            accessToken = parsed.access_token ?? null;
          } catch (e) {
            // 쿠키 파싱 실패 시, Authorization 헤더 폴백으로 처리
          }
        }
      }

      // Authorization 헤더 Bearer 토큰도 fallback으로 시도
      if (!accessToken) {
        const authz = c.req.header('authorization') || c.req.header('Authorization');
        if (authz?.toLowerCase().startsWith('bearer ')) {
          accessToken = authz.slice(7);
        }
      }

      if (!accessToken || accessToken.split('.').length !== 3) {
        return respond(c, failure(401, onboardingErrorCodes.unauthorized, 'User not authenticated'));
      }

      // 2) 토큰으로 사용자 검증
      const getUserResult = await supabase.auth.getUser(accessToken);

      const authUserId = getUserResult.data.user?.id;
      if (!authUserId) {
        return respond(c, failure(401, onboardingErrorCodes.unauthorized, 'User not authenticated'));
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
        authUserId,
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
