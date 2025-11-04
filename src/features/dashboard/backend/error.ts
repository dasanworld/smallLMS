export const dashboardErrorCodes = {
  fetchError: 'DASHBOARD_FETCH_ERROR',
  unauthorized: 'DASHBOARD_UNAUTHORIZED',
  validationError: 'DASHBOARD_VALIDATION_ERROR',
} as const;

type DashboardErrorValue = (typeof dashboardErrorCodes)[keyof typeof dashboardErrorCodes];
export type DashboardServiceError = DashboardErrorValue;
