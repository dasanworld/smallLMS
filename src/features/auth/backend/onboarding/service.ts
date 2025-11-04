import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  OnboardingResponseSchema,
  ProfileTableRowSchema,
  type OnboardingRequest,
  type OnboardingResponse,
} from '@/features/auth/backend/onboarding/schema';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from '@/features/auth/backend/onboarding/error';
import { UserRole } from '@/lib/shared/user-types';

const PROFILES_TABLE = 'profiles';
const TERMS_AGREEMENTS_TABLE = 'terms_agreements';

export const completeOnboarding = async (
  client: SupabaseClient,
  userId: string,
  data: OnboardingRequest,
): Promise<HandlerResult<OnboardingResponse, OnboardingServiceError, unknown>> => {
  try {
    const normalizedRole = data.role.toLowerCase();

    if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
      return failure(
        400,
        onboardingErrorCodes.invalidRole,
        `Invalid role: ${data.role}. Must be one of: ${Object.values(UserRole).join(', ')}`
      );
    }

    const phoneNumber = data.phoneNumber || null;

    const { data: profileData, error: profileError } = await client
      .from(PROFILES_TABLE)
      .insert({
        id: userId,
        role: normalizedRole,
        name: data.name,
        phone_number: phoneNumber,
      })
      .select('id, role, name, phone_number, created_at')
      .single();

    if (profileError) {
      return failure(
        500,
        onboardingErrorCodes.profileCreationError,
        `Failed to create profile: ${profileError.message}`
      );
    }

    const profileParse = ProfileTableRowSchema.safeParse(profileData);

    if (!profileParse.success) {
      return failure(
        500,
        onboardingErrorCodes.validationError,
        'Profile row validation failed',
        profileParse.error.format(),
      );
    }

    const { error: termsError } = await client
      .from(TERMS_AGREEMENTS_TABLE)
      .insert({
        user_id: userId,
      });

    if (termsError) {
      return failure(
        500,
        onboardingErrorCodes.termsAgreementError,
        `Failed to record terms agreement: ${termsError.message}`
      );
    }

    const responseData: OnboardingResponse = {
      success: true,
      message: 'Onboarding completed successfully',
      userId: profileParse.data.id,
      role: profileParse.data.role as 'learner' | 'instructor' | 'operator',
    };

    const responseParse = OnboardingResponseSchema.safeParse(responseData);

    if (!responseParse.success) {
      return failure(
        500,
        onboardingErrorCodes.validationError,
        'Response validation failed',
        responseParse.error.format(),
      );
    }

    return success(responseParse.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(
      500,
      onboardingErrorCodes.creationError,
      `Onboarding failed: ${errorMessage}`
    );
  }
};
