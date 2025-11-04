export const coursesErrorCodes = {
  notFound: 'COURSE_NOT_FOUND',
  fetchError: 'COURSE_FETCH_ERROR',
  validationError: 'COURSE_VALIDATION_ERROR',
  unauthorized: 'COURSE_UNAUTHORIZED',
} as const;

type CoursesErrorValue = (typeof coursesErrorCodes)[keyof typeof coursesErrorCodes];
export type CoursesServiceError = CoursesErrorValue;
