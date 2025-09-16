import { ApplicationError, ErrorCode, handleError, getUserErrorMessage } from './errorRegistry';
import { requestDeduplicator } from './requestDeduplication';
import { getApiUrl } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryAfter?: number;
}

export class ApiError extends ApplicationError {
  public status: number;
  public retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number, originalError?: Error) {
    // Determine appropriate error code based on status
    let code: ErrorCode;
    if (status === 429) {
      code = ErrorCode.TOO_MANY_REQUESTS;
    } else if (status >= 500) {
      code = ErrorCode.SERVER_ERROR;
    } else if (status === 401) {
      code = ErrorCode.UNAUTHORIZED;
    } else if (status === 403) {
      code = ErrorCode.FORBIDDEN;
    } else if (status >= 400) {
      code = ErrorCode.INVALID_JSON_RESPONSE;
    } else if (status === 0) {
      code = ErrorCode.NETWORK_ERROR;
    } else {
      code = ErrorCode.UNKNOWN_ERROR;
    }

    super(code, originalError, { httpStatus: status, retryAfter });

    this.status = status;
    this.retryAfter = retryAfter;
    this.name = 'ApiError';
  }
}

/**
 * Enhanced fetch wrapper that handles common API response patterns
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Convert relative URLs to absolute URLs with API base
    const fullUrl = url.startsWith('http') ? url : getApiUrl(url);

    // Use request deduplication to prevent React Strict Mode duplicate calls
    const response = await requestDeduplicator.executeRequest(
      fullUrl,
      {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      },
      fetch
    );

    // Handle non-200 responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');

      // Try to parse JSON error response first
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json() as ApiResponse;
          throw new ApiError(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.retryAfter
          );
        } catch (parseError) {
          // If JSON parsing fails, fall back to text
          const errorText = await response.text();
          throw new ApiError(
            `HTTP ${response.status}: ${errorText || response.statusText}`,
            response.status,
            undefined,
            parseError instanceof Error ? parseError : undefined
          );
        }
      } else {
        // Handle non-JSON error responses
        const errorText = await response.text();
        throw new ApiError(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
          response.status
        );
      }
    }

    // Parse successful response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();

      // Check if this might be a rate limiting response that got through
      if (textResponse.toLowerCase().includes('too many requests')) {
        throw new ApiError(
          'Rate limit exceeded - server returned text instead of JSON',
          429,
          900, // Default 15 minute retry
          new Error(`Non-JSON rate limit response: ${textResponse}`)
        );
      }

      throw new ApiError(
        `Server returned non-JSON response: ${textResponse}`,
        response.status,
        undefined,
        new Error(`Expected JSON, got: ${contentType}`)
      );
    }

    const data = await response.json() as ApiResponse<T>;
    return data;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors, JSON parsing errors, etc.
    const errorMessage = error instanceof Error ? error.message : 'Unknown network error';

    // Special handling for JSON parsing errors (the original issue)
    if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
      throw new ApiError(
        'Server returned invalid response (possible rate limiting)',
        0,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }

    throw new ApiError(
      errorMessage,
      0,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Retry wrapper for API requests with exponential backoff
 */
export async function retryApiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelay = 1000
): Promise<ApiResponse<T>> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(url, options);
    } catch (error) {
      lastError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delay = lastError.retryAfter
        ? lastError.retryAfter * 1000  // retryAfter is in seconds
        : baseDelay * Math.pow(2, attempt);

      console.log(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Helper for handling API errors in React components
 * Now uses the error registry system for consistent messaging
 */
export function getErrorMessage(error: unknown): string {
  // Use the error registry system for consistent user messages
  return getUserErrorMessage(error);
}