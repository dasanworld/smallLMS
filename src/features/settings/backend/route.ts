import type { Hono } from 'hono';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { getProfile, updateProfile, getNotificationPreferences, updateNotificationPreferences } from './service';
import { updateProfileSchema, notificationPreferencesSchema } from './schema';

export function registerSettingsRoutes(app: Hono<AppEnv>) {
  app.get('/api/settings/profile', async (c) => {
    const supabase = getSupabase(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return c.json({ error: '인증이 필요합니다' }, 401);
      }

      const profile = await getProfile(supabase, authUser.id);
      return c.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      return c.json({ error: '프로필을 가져올 수 없습니다' }, 500);
    }
  });

  app.patch('/api/settings/profile', async (c) => {
    const supabase = getSupabase(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return c.json({ error: '인증이 필요합니다' }, 401);
      }

      const body = await c.req.json();
      const input = updateProfileSchema.parse(body);
      const profile = await updateProfile(supabase, authUser.id, input);
      return c.json(profile);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return c.json({ error: '요청 형식이 올바르지 않습니다' }, 400);
      }
      console.error('Update profile error:', error);
      return c.json({ error: '프로필 업데이트에 실패했습니다' }, 500);
    }
  });

  app.get('/api/settings/notifications', async (c) => {
    const supabase = getSupabase(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return c.json({ error: '인증이 필요합니다' }, 401);
      }

      const preferences = await getNotificationPreferences(supabase, authUser.id);
      return c.json(preferences);
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return c.json({ error: '알림 설정을 가져올 수 없습니다' }, 500);
    }
  });

  app.patch('/api/settings/notifications', async (c) => {
    const supabase = getSupabase(c);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.id) {
        return c.json({ error: '인증이 필요합니다' }, 401);
      }

      const body = await c.req.json();
      const preferences = notificationPreferencesSchema.parse(body);
      const updated = await updateNotificationPreferences(supabase, authUser.id, preferences);
      return c.json(updated);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return c.json({ error: '요청 형식이 올바르지 않습니다' }, 400);
      }
      console.error('Update notification preferences error:', error);
      return c.json({ error: '알림 설정 업데이트에 실패했습니다' }, 500);
    }
  });
}
