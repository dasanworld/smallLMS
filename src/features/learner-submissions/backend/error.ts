export const learnerSubmissionsErrorCodes = {
  notFound: 'LEARNER_SUBMISSION_NOT_FOUND',
  fetchError: 'LEARNER_SUBMISSION_FETCH_ERROR',
  validationError: 'LEARNER_SUBMISSION_VALIDATION_ERROR',
  unauthorized: 'LEARNER_SUBMISSION_UNAUTHORIZED',
  notEnrolled: 'LEARNER_NOT_ENROLLED',
  assignmentClosed: 'ASSIGNMENT_CLOSED',
  deadlineExceeded: 'DEADLINE_EXCEEDED',
  resubmissionNotAllowed: 'RESUBMISSION_NOT_ALLOWED',
  validationFailed: 'SUBMISSION_VALIDATION_FAILED',
} as const;

type LearnerSubmissionsErrorValue = (typeof learnerSubmissionsErrorCodes)[keyof typeof learnerSubmissionsErrorCodes];
export type LearnerSubmissionsServiceError = LearnerSubmissionsErrorValue;