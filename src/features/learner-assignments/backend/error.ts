export const learnerAssignmentsErrorCodes = {
  notFound: 'LEARNER_ASSIGNMENT_NOT_FOUND',
  fetchError: 'LEARNER_ASSIGNMENT_FETCH_ERROR',
  validationError: 'LEARNER_ASSIGNMENT_VALIDATION_ERROR',
  unauthorized: 'LEARNER_ASSIGNMENT_UNAUTHORIZED',
  notEnrolled: 'LEARNER_NOT_ENROLLED',
} as const;

type LearnerAssignmentsErrorValue = (typeof learnerAssignmentsErrorCodes)[keyof typeof learnerAssignmentsErrorCodes];
export type LearnerAssignmentsServiceError = LearnerAssignmentsErrorValue;
