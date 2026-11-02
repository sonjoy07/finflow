import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'gt', 'lt', 'in', 'contains']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

const actionSchema = z.object({
  type: z.enum(['auto_retry', 'notify_slack', 'create_ticket', 'freeze_account']),
  params: z.record(z.unknown()).default({}),
});

const createWorkflowSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(60),
  description: z.string().trim().max(200),
  trigger: z.object({
    eventType: z.enum(['transaction_failed', 'reconciliation_mismatch', 'high_risk_transaction']),
  }),
  conditions: z.array(conditionSchema).min(1, 'At least one condition rule is required'),
  actions: z.array(actionSchema).min(1, 'At least one action is required'),
  status: z.enum(['active', 'paused']).default('active'),
});

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_VIEW');
    if (errorResponse) return errorResponse;

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const workflows = mockRepository.getWorkflows();

    const response: ApiSuccessResponse<typeof workflows> = {
      success: true,
      data: workflows,
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

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'WORKFLOW_WRITE');
    if (errorResponse) return errorResponse;

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

    const parsed = createWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Workflow parameters validation failed.',
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

    const newWorkflow = mockRepository.createWorkflow(parsed.data);

    const response: ApiSuccessResponse<typeof newWorkflow> = {
      success: true,
      data: newWorkflow,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
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
