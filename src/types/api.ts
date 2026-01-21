/**
 * API関連の型定義
 */

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'CONVERSATION_NOT_FOUND'
  | 'CLAUDE_API_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export interface APIError {
  code: ErrorCode;
  message: string;
}

export interface APIErrorResponse {
  error: APIError;
}
