import type { SupabaseClient } from '@supabase/supabase-js';
import type { UpdateProfileInput, GetProfileResponse } from './schema';

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<GetProfileResponse> {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, name, phone_number, created_at')
    .eq('id', userId)
    .single();

  if (profileError || !profileData) {
    throw new Error('프로필을 찾을 수 없습니다');
  }

  return {
    id: profileData.id,
    email: authUser.email || '',
    name: profileData.name,
    phoneNumber: profileData.phone_number || null,
    role: profileData.role as 'learner' | 'instructor' | 'operator',
    createdAt: profileData.created_at,
  };
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<GetProfileResponse> {
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      name: input.name,
      phone_number: input.phoneNumber || null,
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('프로필 업데이트에 실패했습니다');
  }

  return getProfile(supabase, userId);
}

export async function getNotificationPreferences(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return {
      emailNotifications: true,
      assignmentReminders: true,
      gradeNotifications: true,
      courseUpdates: true,
      pushNotifications: false,
    };
  }

  return data || {};
}

export async function updateNotificationPreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: Record<string, boolean>
): Promise<Record<string, boolean>> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Notification preferences update error:', error);
  }

  return preferences;
}
