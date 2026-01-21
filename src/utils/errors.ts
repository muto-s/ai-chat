/**
 * エラーハンドリング
 */

import type { ErrorCode, APIErrorResponse } from '@/types/api';

/**
 * カスタムエラークラス
 */
export class APIError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string
): APIErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}

/**
 * エラーハンドラー
 */
export function handleError(error: unknown): {
  response: APIErrorResponse;
  statusCode: number;
} {
  if (error instanceof APIError) {
    return {
      response: createErrorResponse(error.code, error.message),
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error);
    return {
      response: createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        error.message || 'An unexpected error occurred'
      ),
      statusCode: 500,
    };
  }

  console.error('Unknown error:', error);
  return {
    response: createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unknown error occurred'
    ),
    statusCode: 500,
  };
}
