import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mockRepository } from '@/lib/mock-data/mock-repository';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { env } from '@/lib/env';

const querySchema = z.object({
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  severity: z.string().optional(),
});

const patchSchema = z.object({
  action: z.enum(['mark_all_read', 'mark_read']).optional(),
  id: z.string().optional(),
  read: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      unreadOnly: searchParams.get('unreadOnly') || undefined,
      severity: searchParams.get('severity') || undefined,
    });

    const unreadOnly = parsed.success ? parsed.data.unreadOnly : false;
    const severity = parsed.success ? parsed.data.severity : undefined;

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    const notifications = mockRepository.getNotifications(unreadOnly, severity);

    const response: ApiSuccessResponse<typeof notifications> = {
      success: true,
      data: notifications,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid notification patch payload.',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (env.MOCK_API_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_API_DELAY_MS));
    }

    if (parsed.data.action === 'mark_all_read') {
      const count = mockRepository.markAllNotificationsAsRead();
      const response: ApiSuccessResponse<{ count: number }> = {
        success: true,
        data: { count },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (parsed.data.id) {
      const item = mockRepository.markNotificationAsRead(parsed.data.id);
      if (!item) {
        const notFound: ApiErrorResponse = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Notification ${parsed.data.id} not found.`,
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(notFound, { status: 404 });
      }

      const response: ApiSuccessResponse<typeof item> = {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    }

    const badRequest: ApiErrorResponse = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Must provide id or mark_all_read action.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(badRequest, { status: 400 });
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
