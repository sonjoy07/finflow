import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const updateSchema = z.object({
  name: z.string().trim().min(3).max(60).optional(),
  description: z.string().trim().max(200).optional(),
  status: z.enum(['active', 'paused']).optional(),
  conditions: z.array(z.any()).optional(),
  actions: z.array(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_VIEW');
    if (errorResponse) return errorResponse;

    const { id } = params;

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const workflow = mockRepository.getWorkflowById(id);
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'WORKFLOW_NOT_FOUND', message: `Workflow with ID '${id}' not found.` },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const response: ApiSuccessResponse<typeof workflow> = {
      success: true,
      data: workflow,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_WRITE');
    if (errorResponse) return errorResponse;

    const { id } = params;

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    try {
      mockRepository.deleteWorkflow(id);
      return NextResponse.json(
        {
          success: true,
          data: { id, deleted: true },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'WORKFLOW_NOT_FOUND', message: `Workflow with ID '${id}' not found.` },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_WRITE');
    if (errorResponse) return errorResponse;

    const { id } = params;

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload for workflow.',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            issue: i.message,
          })),
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 422 });
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    try {
      const updated = mockRepository.updateWorkflow(id, parsed.data);
      const response: ApiSuccessResponse<typeof updated> = {
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'WORKFLOW_NOT_FOUND', message: `Workflow with ID '${id}' not found.` },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
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
