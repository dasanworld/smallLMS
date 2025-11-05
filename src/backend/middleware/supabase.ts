import { createMiddleware } from 'hono/factory';
import {
  contextKeys,
  type AppEnv,
} from '@/backend/hono/context';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export const withSupabase = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const config = c.get(
      contextKeys.config,
    ) as AppEnv['Variables']['config'] | undefined;

    if (!config) {
      throw new Error('Application configuration is not available.');
    }

    // 쿠키에서 Supabase access_token 추출 시도
    // sb-<project>-auth-token 은 base64 JSON({ access_token, refresh_token, ... })
    const cookieHeader = c.req.header('cookie') ?? '';
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, part) => {
      const [k, v] = part.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});

    const authCookieKey = Object.keys(cookies).find(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token') && !k.includes('code-verifier')
    );

    let accessToken: string | null = null;
    if (authCookieKey) {
      const raw = cookies[authCookieKey];
      if (raw?.startsWith('base64-')) {
        try {
          const decoded = Buffer.from(raw.substring(7), 'base64').toString('utf-8');
          const parsed = JSON.parse(decoded) as { access_token?: string };
          accessToken = parsed.access_token ?? null;
        } catch {
          // ignore
        }
      }
    }

    // Authorization Bearer 헤더도 폴백으로 검사
    if (!accessToken) {
      const authz = c.req.header('authorization') || c.req.header('Authorization');
      if (authz?.toLowerCase().startsWith('bearer ')) {
        accessToken = authz.slice(7);
      }
    }

    // 익명 키로 기본 클라이언트 생성, 토큰 있으면 Authorization 헤더 주입
    const supabase = createClient<Database>(
      config.supabase.url,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      accessToken
        ? {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          }
        : undefined
    );

    c.set(contextKeys.supabase, supabase);
    await next();
  });