export const adminErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  validationError: 'VALIDATION_ERROR',
  inUse: 'IN_USE',
  fetchError: 'FETCH_ERROR',
  updateError: 'UPDATE_ERROR',
  deleteError: 'DELETE_ERROR',
  createError: 'CREATE_ERROR',
  operatorOnly: 'OPERATOR_ONLY',
} as const;

export type AdminServiceError = (typeof adminErrorCodes)[keyof typeof adminErrorCodes];
