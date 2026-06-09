export type ValidationErrors = Record<string, string>;

interface ValidationErrorResponse {
  validationErrors?: ValidationErrors;
  message?: string;
}

export function extractValidationErrors(error: unknown): ValidationErrors | null {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('response' in error)
  ) {
    return null;
  }

  const response = (
    error as { response?: { status?: number; data?: ValidationErrorResponse } }
  ).response;

  if (response?.status !== 400 || !response.data?.validationErrors) {
    return null;
  }

  return response.data.validationErrors;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }

  return fallback;
}
