import type { ApiErrorResponse, ApiSuccessResponse } from '@/types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorPayload: ApiErrorResponse['error'] | null = null;
    try {
      const json: ApiErrorResponse = await response.json();
      if (json && json.error) {
        errorPayload = json.error;
      }
    } catch {
      // Body not JSON
    }

    throw new ApiError(
      response.status,
      errorPayload?.code || `HTTP_${response.status}`,
      errorPayload?.message || `Request failed with status ${response.status}`,
      errorPayload?.details
    );
  }

  const payload: ApiSuccessResponse<T> = await response.json();
  return payload.data;
}
