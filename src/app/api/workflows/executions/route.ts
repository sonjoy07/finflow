import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const querySchema = z.object({
  workflowId: z.string().optional(),
  status: z.enum(['all', 'success', 'skipped', 'failed']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_VIEW');
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters for executions.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const { workflowId, status, page, pageSize } = parsed.data;
    const { data: rawList, meta: _meta } = mockRepository.getWorkflowExecutions(workflowId, 1, 1000);

    const filtered = status === 'all'
      ? rawList
      : rawList.filter((item) => item.status === status);

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    const response: ApiSuccessResponse<typeof paginated> = {
      success: true,
      data: paginated,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
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
