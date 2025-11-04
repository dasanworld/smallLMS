export const submissionsErrorCodes = {
  notFound: 'SUBMISSION_NOT_FOUND',
  fetchError: 'SUBMISSION_FETCH_ERROR',
  validationError: 'SUBMISSION_VALIDATION_ERROR',
  unauthorized: 'SUBMISSION_UNAUTHORIZED',
  conflictError: 'SUBMISSION_CONFLICT_ERROR',
} as const;

type SubmissionsErrorValue = (typeof submissionsErrorCodes)[keyof typeof submissionsErrorCodes];
export type SubmissionsServiceError = SubmissionsErrorValue;
