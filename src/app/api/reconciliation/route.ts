import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const querySchema = z.object({
  status: z
    .enum([
      'all',
      'matched',
      'unmatched',
      'mismatched_amount',
      'duplicate_record',
      'missing_provider',
      'missing_internal',
      'missing_external',
      'resolved',
    ])
    .optional(),
  search: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'RECONCILIATION_VIEW');
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters for /api/reconciliation.',
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

    const searchQuery = parsed.data.search || parsed.data.q;
    const { data, meta } = mockRepository.getReconciliationRecords(
      parsed.data.status,
      parsed.data.page,
      parsed.data.pageSize,
      searchQuery
    );

    const summary = mockRepository.getReconciliationSummary();

    const response: ApiSuccessResponse<{
      records: typeof data;
      summary: typeof summary;
    }> = {
      success: true,
      data: {
        records: data,
        summary,
      },
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
