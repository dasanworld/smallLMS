import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { respond, failure, success } from '@/backend/http/response';

export const registerRoleRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/auth/role', async (c) => {
    const supabase = getSupabase(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Not authenticated'));
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        return respond(c, failure(404, 'NOT_FOUND', 'Profile not found'));
      }

      return respond(c, success({ role: profile.role }, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return respond(c, failure(500, 'SERVER_ERROR', errorMessage));
    }
  });
};
