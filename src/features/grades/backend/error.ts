export const gradesErrorCodes = {
  notFound: 'GRADES_NOT_FOUND',
  fetchError: 'GRADES_FETCH_ERROR',
  validationError: 'GRADES_VALIDATION_ERROR',
  unauthorized: 'GRADES_UNAUTHORIZED',
  calculationError: 'GRADES_CALCULATION_ERROR',
} as const;

type GradesErrorValue = (typeof gradesErrorCodes)[keyof typeof gradesErrorCodes];
export type GradesServiceError = GradesErrorValue;
