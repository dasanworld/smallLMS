export const onboardingErrorCodes = {
  creationError: 'ONBOARDING_CREATION_ERROR',
  profileCreationError: 'PROFILE_CREATION_ERROR',
  termsAgreementError: 'TERMS_AGREEMENT_ERROR',
  profileLookupError: 'PROFILE_LOOKUP_ERROR',
  invalidRole: 'INVALID_ROLE',
  validationError: 'ONBOARDING_VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  databaseError: 'DATABASE_ERROR',
} as const;

type OnboardingErrorValue = (typeof onboardingErrorCodes)[keyof typeof onboardingErrorCodes];

export type OnboardingServiceError = OnboardingErrorValue;
