export interface APIError {
  error: string;
  status?: number;
  details?: unknown;
}

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as APIError).error === 'string'
  );
}