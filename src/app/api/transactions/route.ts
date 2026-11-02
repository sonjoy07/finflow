import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().optional(),
  status: z.enum(['settled', 'pending', 'processing', 'failed', 'refunded', 'disputed', 'all']).optional(),
  paymentMethod: z.enum(['card', 'bank_transfer', 'virtual_account', 'ach', 'sepa', 'wire', 'all']).optional(),
  minAmountCents: z.coerce.number().int().min(0).optional(),
  maxAmountCents: z.coerce.number().int().min(0).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amountCents', 'status', 'customerName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'TRANSACTION_VIEW');
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters passed to /api/transactions.',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            issue: i.message,
          })),
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const { data, meta } = mockRepository.getTransactions(parsed.data);

    const response: ApiSuccessResponse<typeof data> = {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
