import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError } from './api-client';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('unwraps data correctly on 200 OK responses', async () => {
    const mockData = { id: 'txn_001', amountCents: 1500 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockData,
        timestamp: '2026-11-01T12:00:00Z',
      }),
    });

    const result = await apiClient<typeof mockData>('/api/test');
    expect(result).toEqual(mockData);
  });

  it('throws ApiError with status and code on non-2xx responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction txn_999 does not exist',
        },
        timestamp: '2026-11-01T12:00:00Z',
      }),
    });

    await expect(apiClient('/api/transactions/txn_999')).rejects.toThrow(ApiError);
    try {
      await apiClient('/api/transactions/txn_999');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(404);
      expect(apiErr.code).toBe('TRANSACTION_NOT_FOUND');
      expect(apiErr.message).toBe('Transaction txn_999 does not exist');
    }
  });

  it('supports request cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      if (options.signal?.aborted) {
        return Promise.reject(new DOMException('The user aborted a request.', 'AbortError'));
      }
      return new Promise((_, reject) => {
        options.signal?.addEventListener('abort', () => {
          reject(new DOMException('The user aborted a request.', 'AbortError'));
        });
      });
    });

    const promise = apiClient('/api/test', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow('The user aborted a request.');
  });
});
