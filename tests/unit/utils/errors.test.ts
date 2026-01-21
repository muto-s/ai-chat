import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIError, createErrorResponse, handleError } from '@/utils/errors';

describe('APIError', () => {
  it('should create an APIError with correct properties', () => {
    const error = new APIError('NOT_FOUND', 'Resource not found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should default to status code 500 when not provided', () => {
    const error = new APIError('INTERNAL_SERVER_ERROR', 'Server error');

    expect(error.statusCode).toBe(500);
  });

  it('should support different error codes', () => {
    const validationError = new APIError('VALIDATION_ERROR', 'Invalid input', 400);
    const authError = new APIError('UNAUTHORIZED', 'Not authorized', 401);

    expect(validationError.code).toBe('VALIDATION_ERROR');
    expect(validationError.statusCode).toBe(400);
    expect(authError.code).toBe('UNAUTHORIZED');
    expect(authError.statusCode).toBe(401);
  });
});

describe('createErrorResponse()', () => {
  it('should create an error response with correct structure', () => {
    const response = createErrorResponse('NOT_FOUND', 'Item not found');

    expect(response).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Item not found',
      },
    });
  });

  it('should handle different error codes and messages', () => {
    const response1 = createErrorResponse('VALIDATION_ERROR', 'Invalid email format');
    const response2 = createErrorResponse('INTERNAL_SERVER_ERROR', 'Database connection failed');

    expect(response1.error.code).toBe('VALIDATION_ERROR');
    expect(response1.error.message).toBe('Invalid email format');
    expect(response2.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(response2.error.message).toBe('Database connection failed');
  });

  it('should handle empty message', () => {
    const response = createErrorResponse('UNKNOWN_ERROR', '');

    expect(response.error.message).toBe('');
  });
});

describe('handleError()', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should handle APIError correctly', () => {
    const apiError = new APIError('NOT_FOUND', 'Resource not found', 404);
    const result = handleError(apiError);

    expect(result.statusCode).toBe(404);
    expect(result.response).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle standard Error with message', () => {
    const standardError = new Error('Something went wrong');
    const result = handleError(standardError);

    expect(result.statusCode).toBe(500);
    expect(result.response).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', standardError);
  });

  it('should handle Error without message', () => {
    const errorWithoutMessage = new Error();
    const result = handleError(errorWithoutMessage);

    expect(result.statusCode).toBe(500);
    expect(result.response.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(result.response.error.message).toBe('An unexpected error occurred');
  });

  it('should handle unknown error types', () => {
    const unknownError = 'string error';
    const result = handleError(unknownError);

    expect(result.statusCode).toBe(500);
    expect(result.response).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred',
      },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown error:', unknownError);
  });

  it('should handle null or undefined errors', () => {
    const result1 = handleError(null);
    const result2 = handleError(undefined);

    expect(result1.statusCode).toBe(500);
    expect(result1.response.error.message).toBe('An unknown error occurred');
    expect(result2.statusCode).toBe(500);
    expect(result2.response.error.message).toBe('An unknown error occurred');
  });

  it('should handle different APIError status codes', () => {
    const error400 = new APIError('VALIDATION_ERROR', 'Bad request', 400);
    const error401 = new APIError('UNAUTHORIZED', 'Unauthorized', 401);
    const error403 = new APIError('FORBIDDEN', 'Forbidden', 403);

    expect(handleError(error400).statusCode).toBe(400);
    expect(handleError(error401).statusCode).toBe(401);
    expect(handleError(error403).statusCode).toBe(403);
  });
});
