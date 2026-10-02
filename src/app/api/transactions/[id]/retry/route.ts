import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/features/auth/lib/server-auth';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const bodySchema = z.object({
  overrideGateway: z.string().optional(),
  strategy: z.enum(['immediate', 'exponential_backoff']).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = await authenticateRequest(request, 'TRANSACTION_RETRY');
    if (errorResponse) return errorResponse;

    const { id } = params;
    const idempotencyKey = request.headers.get('X-Idempotency-Key');

    if (!idempotencyKey) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'MISSING_IDEMPOTENCY_KEY',
          message: 'The X-Idempotency-Key header is required on transaction retry requests.',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body.',
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
      const retryResult = mockRepository.retryTransaction(id, idempotencyKey, parsed.data.notes);

      const response: ApiSuccessResponse<typeof retryResult> = {
        success: true,
        data: retryResult,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response, { status: 200 });
    } catch (repoError) {
      const msg = repoError instanceof Error ? repoError.message : 'UNKNOWN_ERROR';

      if (msg === 'TRANSACTION_NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'TRANSACTION_NOT_FOUND', message: `Transaction '${id}' does not exist.` },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (msg === 'TRANSACTION_ALREADY_RESOLVED') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TRANSACTION_CONFLICT',
              message: 'Cannot retry transaction that is already settled or currently processing.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (msg === 'MAX_RETRIES_EXCEEDED') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MAX_RETRIES_EXCEEDED',
              message: 'Transaction has exceeded maximum allowable retry limit of 3.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }

      if (msg === 'DUPLICATE_IDEMPOTENCY_KEY') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_IDEMPOTENCY_KEY',
              message: 'A retry mutation with this idempotency key was already processed.',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
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
