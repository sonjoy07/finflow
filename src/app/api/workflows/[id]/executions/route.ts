import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_VIEW');
    if (errorResponse) return errorResponse;

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination parameters.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const { data, meta } = mockRepository.getWorkflowExecutions(
      id,
      parsed.data.page,
      parsed.data.pageSize
    );

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
