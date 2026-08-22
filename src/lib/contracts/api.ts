export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_TRANSITION"
  | "ESCALATION_NOT_AVAILABLE"
  | "UNAUTHORIZED"
  | "AI_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    requestId?: string;
    generatedAt?: string;
  };
}

export interface ApiError {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryable: boolean;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const apiSuccess = <T>(data: T): ApiSuccess<T> => ({ ok: true, data });

export const apiError = (
  code: ApiErrorCode,
  message: string,
  retryable = false,
): ApiError => ({
  ok: false,
  error: { code, message, retryable },
});
