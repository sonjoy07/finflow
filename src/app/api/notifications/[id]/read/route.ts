import { NextRequest, NextResponse } from 'next/server';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const updated = mockRepository.markNotificationAsRead(id);
    if (!updated) {
      const notFound: ApiErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Notification ${id} not found.`,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(notFound, { status: 404 });
    }

    const response: ApiSuccessResponse<typeof updated> = {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 200 });
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
