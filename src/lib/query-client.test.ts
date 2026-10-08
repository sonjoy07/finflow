import { describe, it, expect } from 'vitest';
import { createQueryClient } from './query-client';
import { ApiError } from './api-client';

describe('createQueryClient', () => {
  it('initializes query client with deliberate enterprise cache options', () => {
    const client = createQueryClient();
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(30 * 1000);
    expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaultOptions.mutations?.retry).toBe(false);
  });

  it('rejects retries for 4xx client errors in query retry predicate', () => {
    const client = createQueryClient();
    const retryFn = client.getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: unknown
    ) => boolean;

    expect(retryFn).toBeDefined();

    // 400 Bad Request
    const clientError400 = new ApiError(400, 'BAD_REQUEST', 'Bad Request');
    expect(retryFn(0, clientError400)).toBe(false);

    // 404 Not Found
    const clientError404 = new ApiError(404, 'NOT_FOUND', 'Not Found');
    expect(retryFn(0, clientError404)).toBe(false);

    // 409 Conflict
    const clientError409 = new ApiError(409, 'CONFLICT', 'Conflict');
    expect(retryFn(0, clientError409)).toBe(false);

    // 422 Validation Error
    const clientError422 = new ApiError(422, 'VALIDATION_ERROR', 'Unprocessable Entity');
    expect(retryFn(0, clientError422)).toBe(false);

    // 500 Internal Server Error (first attempt should retry)
    const serverError500 = new ApiError(500, 'SERVER_ERROR', 'Server Error');
    expect(retryFn(0, serverError500)).toBe(true);
    expect(retryFn(1, serverError500)).toBe(false);

    // Network error (generic Error)
    const networkError = new Error('Network timeout');
    expect(retryFn(0, networkError)).toBe(true);
    expect(retryFn(1, networkError)).toBe(false);
  });
});
