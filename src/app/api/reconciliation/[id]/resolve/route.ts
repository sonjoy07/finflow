import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const resolveSchema = z.object({
  notes: z
    .string()
    .min(5, 'Audit justification notes must be at least 5 characters.')
    .max(500, 'Audit notes cannot exceed 500 characters.'),
  action: z
    .enum(['force_match', 'accept_external', 'write_off', 'flag_investigation'])
    .default('force_match'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'RECONCILIATION_RESOLVE');
    if (errorResponse) return errorResponse;

    const { id } = params;

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Malformed request JSON.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid resolution parameters.',
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
      const updatedRecord = mockRepository.resolveReconciliationRecord(
        id,
        parsed.data.notes,
        parsed.data.action
      );

      const response: ApiSuccessResponse<typeof updatedRecord> = {
        success: true,
        data: updatedRecord,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response, { status: 200 });
    } catch (repoError) {
      const msg = repoError instanceof Error ? repoError.message : 'UNKNOWN_ERROR';
      if (msg === 'RECORD_NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RECORD_NOT_FOUND',
              message: `Reconciliation record '${id}' was not found.`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
      throw repoError;
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
