export const assignmentsErrorCodes = {
  notFound: 'ASSIGNMENT_NOT_FOUND',
  fetchError: 'ASSIGNMENT_FETCH_ERROR',
  validationError: 'ASSIGNMENT_VALIDATION_ERROR',
  unauthorized: 'ASSIGNMENT_UNAUTHORIZED',
} as const;

type AssignmentsErrorValue = (typeof assignmentsErrorCodes)[keyof typeof assignmentsErrorCodes];
export type AssignmentsServiceError = AssignmentsErrorValue;
