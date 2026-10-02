import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_SIMULATE');
    if (errorResponse) return errorResponse;

    const { id } = params;

    let triggerEntityId: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.triggerEntityId === 'string') {
        triggerEntityId = body.triggerEntityId;
      }
    } catch {
      // Body is optional
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    try {
      const execution = mockRepository.simulateWorkflowRun(id, triggerEntityId);
      const response: ApiSuccessResponse<typeof execution> = {
        success: true,
        data: execution,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg === 'WORKFLOW_NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'WORKFLOW_NOT_FOUND', message: `Workflow '${id}' was not found.` },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred during execution simulation.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
