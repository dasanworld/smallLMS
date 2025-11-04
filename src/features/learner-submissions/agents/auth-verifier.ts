import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthVerifierAgent, AuthVerifierResult } from './types';

export const createAuthVerifierAgent = (client: SupabaseClient): AuthVerifierAgent => ({
  client,

  async verify(userId: string): Promise<AuthVerifierResult> {
    console.log(`[AuthVerifierAgent] Verifying user ${userId}`);

    try {
      if (!userId || typeof userId !== 'string') {
        console.warn(`[AuthVerifierAgent] Invalid user ID: ${userId}`);
        return {
          isAuthenticated: false,
          reason: 'Invalid user ID format',
        };
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.warn(`[AuthVerifierAgent] Invalid UUID format: ${userId}`);
        return {
          isAuthenticated: false,
          reason: 'Invalid user ID format',
        };
      }

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user || user.id !== userId) {
        console.warn(`[AuthVerifierAgent] Authenticated user mismatch or no user`);
        return {
          isAuthenticated: false,
          reason: 'User not authenticated or mismatch',
        };
      }

      console.log(`[AuthVerifierAgent] User ${userId} verified successfully`);
      return {
        isAuthenticated: true,
        userId: user.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AuthVerifierAgent] Verification failed:`, errorMessage);
      return {
        isAuthenticated: false,
        reason: `Authentication error: ${errorMessage}`,
      };
    }
  },
});
