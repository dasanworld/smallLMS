export const instructorDashboardErrorCodes = {
  notFound: 'DASHBOARD_NOT_FOUND',
  fetchError: 'DASHBOARD_FETCH_ERROR',
  validationError: 'DASHBOARD_VALIDATION_ERROR',
  unauthorized: 'DASHBOARD_UNAUTHORIZED',
} as const;

type InstructorDashboardErrorValue = (typeof instructorDashboardErrorCodes)[keyof typeof instructorDashboardErrorCodes];
export type InstructorDashboardServiceError = InstructorDashboardErrorValue;
