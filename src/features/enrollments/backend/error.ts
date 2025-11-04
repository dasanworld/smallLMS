export const enrollmentsErrorCodes = {
  alreadyEnrolled: 'ALREADY_ENROLLED',
  notEnrolled: 'NOT_ENROLLED',
  courseNotFound: 'COURSE_NOT_FOUND',
  creationError: 'ENROLLMENT_CREATION_ERROR',
  cancellationError: 'ENROLLMENT_CANCELLATION_ERROR',
  validationError: 'ENROLLMENT_VALIDATION_ERROR',
  unauthorized: 'ENROLLMENT_UNAUTHORIZED',
} as const;

type EnrollmentsErrorValue = (typeof enrollmentsErrorCodes)[keyof typeof enrollmentsErrorCodes];
export type EnrollmentsServiceError = EnrollmentsErrorValue;
