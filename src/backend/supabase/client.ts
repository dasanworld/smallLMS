import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ServiceClientConfig = {
  url: string;
  serviceRoleKey: string;
};

export const createServiceClient = ({
  url,
  serviceRoleKey,
}: ServiceClientConfig): SupabaseClient =>
  createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

export type AuthenticatedClientConfig = {
  url: string;
  anonKey: string;
  accessToken?: string;
  refreshToken?: string;
};

export const createAuthenticatedClient = ({
  url,
  anonKey,
  accessToken,
  refreshToken,
}: AuthenticatedClientConfig): SupabaseClient => {
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (accessToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  return client;
};
