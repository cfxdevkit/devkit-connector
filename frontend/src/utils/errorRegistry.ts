/**
 * Comprehensive Error Registry System
 * Tracks, categorizes, and provides meaningful error codes and messages
 */

export enum ErrorCode {
  // Network/Connection Errors (1xxx)
  NETWORK_ERROR = 1001,
  TIMEOUT_ERROR = 1002,
  CONNECTION_REFUSED = 1003,

  // API Response Errors (2xxx)
  INVALID_JSON_RESPONSE = 2001,
  MISSING_CONTENT_TYPE = 2002,
  SERVER_ERROR = 2003,

  // Rate Limiting (3xxx)
  RATE_LIMIT_EXCEEDED = 3001,
  TOO_MANY_REQUESTS = 3002,

  // Authentication/Authorization (4xxx)
  UNAUTHORIZED = 4001,
  FORBIDDEN = 4003,
  TOKEN_EXPIRED = 4004,

  // Wallet Errors (5xxx)
  WALLET_NOT_CONNECTED = 5001,
  WALLET_CONNECTION_FAILED = 5002,
  TRANSACTION_REJECTED = 5003,
  INSUFFICIENT_FUNDS = 5004,
  WALLET_LOCKED = 5005,
  MULTIPLE_WALLETS_DETECTED = 5006,

  // Contract Errors (6xxx)
  CONTRACT_NOT_DEPLOYED = 6001,
  CONTRACT_CALL_FAILED = 6002,
  INVALID_CONTRACT_ADDRESS = 6003,
  GAS_ESTIMATION_FAILED = 6004,

  // Validation Errors (7xxx)
  INVALID_INPUT = 7001,
  REQUIRED_FIELD_MISSING = 7002,
  INVALID_FORMAT = 7003,

  // Application Errors (8xxx)
  COMPONENT_MOUNT_ERROR = 8001,
  STATE_UPDATE_ERROR = 8002,
  DELEGATION_ERROR = 8003,

  // Unknown/Generic (9xxx)
  UNKNOWN_ERROR = 9001,
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  suggestions: string[];
  retryable: boolean;
  timestamp: number;
  context?: Record<string, any>;
}

export class ApplicationError extends Error {
  public readonly details: ErrorDetails;

  constructor(
    code: ErrorCode,
    originalError?: Error | unknown,
    context?: Record<string, any>
  ) {
    const errorInfo = getErrorInfo(code);
    super(errorInfo.message);

    this.name = 'ApplicationError';
    this.details = {
      ...errorInfo,
      code,
      timestamp: Date.now(),
      context: {
        originalError: originalError instanceof Error ? originalError.message : originalError,
        stack: originalError instanceof Error ? originalError.stack : undefined,
        ...context,
      },
    };

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

// Error registry with detailed information
const ERROR_REGISTRY: Record<ErrorCode, Omit<ErrorDetails, 'code' | 'timestamp' | 'context'>> = {
  // Network Errors
  [ErrorCode.NETWORK_ERROR]: {
    message: 'Network connection failed',
    category: 'Network',
    severity: 'high',
    userMessage: 'Unable to connect to the server. Please check your internet connection.',
    suggestions: ['Check your internet connection', 'Try refreshing the page', 'Contact support if the issue persists'],
    retryable: true,
  },
  [ErrorCode.TIMEOUT_ERROR]: {
    message: 'Request timeout',
    category: 'Network',
    severity: 'medium',
    userMessage: 'The request took too long to complete.',
    suggestions: ['Try again', 'Check your connection speed', 'Contact support if timeouts persist'],
    retryable: true,
  },
  [ErrorCode.CONNECTION_REFUSED]: {
    message: 'Connection refused by server',
    category: 'Network',
    severity: 'high',
    userMessage: 'Unable to reach the server.',
    suggestions: ['Server may be down', 'Try again later', 'Contact support'],
    retryable: true,
  },

  // API Response Errors
  [ErrorCode.INVALID_JSON_RESPONSE]: {
    message: 'Server returned invalid JSON',
    category: 'API',
    severity: 'high',
    userMessage: 'Server response was malformed. This may be due to rate limiting or server issues.',
    suggestions: ['Wait a moment and try again', 'Check if you\'re being rate limited', 'Contact support if the issue persists'],
    retryable: true,
  },
  [ErrorCode.MISSING_CONTENT_TYPE]: {
    message: 'Response missing content-type header',
    category: 'API',
    severity: 'medium',
    userMessage: 'Server response was unexpected.',
    suggestions: ['Try refreshing the page', 'Contact support'],
    retryable: true,
  },
  [ErrorCode.SERVER_ERROR]: {
    message: 'Internal server error',
    category: 'API',
    severity: 'high',
    userMessage: 'The server encountered an error.',
    suggestions: ['Try again later', 'Contact support if the issue persists'],
    retryable: true,
  },

  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    message: 'Rate limit exceeded',
    category: 'RateLimit',
    severity: 'medium',
    userMessage: 'Too many requests. Please wait before trying again.',
    suggestions: ['Wait a few minutes before trying again', 'Reduce the frequency of your requests'],
    retryable: true,
  },
  [ErrorCode.TOO_MANY_REQUESTS]: {
    message: 'Too many requests from your IP',
    category: 'RateLimit',
    severity: 'medium',
    userMessage: 'You\'ve made too many requests. Please wait before trying again.',
    suggestions: ['Wait 15 minutes before trying again', 'Reduce request frequency'],
    retryable: true,
  },

  // Authentication/Authorization
  [ErrorCode.UNAUTHORIZED]: {
    message: 'Unauthorized access',
    category: 'Auth',
    severity: 'high',
    userMessage: 'You need to log in to access this feature.',
    suggestions: ['Please log in', 'Check if your session has expired'],
    retryable: false,
  },
  [ErrorCode.FORBIDDEN]: {
    message: 'Access forbidden',
    category: 'Auth',
    severity: 'high',
    userMessage: 'You don\'t have permission to perform this action.',
    suggestions: ['Check your permissions', 'Contact an administrator'],
    retryable: false,
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    message: 'Authentication token expired',
    category: 'Auth',
    severity: 'medium',
    userMessage: 'Your session has expired. Please log in again.',
    suggestions: ['Log in again', 'Check if you were inactive for too long'],
    retryable: false,
  },

  // Wallet Errors
  [ErrorCode.WALLET_NOT_CONNECTED]: {
    message: 'Wallet not connected',
    category: 'Wallet',
    severity: 'medium',
    userMessage: 'Please connect your wallet to continue.',
    suggestions: ['Connect your wallet', 'Check if your wallet extension is installed'],
    retryable: false,
  },
  [ErrorCode.WALLET_CONNECTION_FAILED]: {
    message: 'Failed to connect to wallet',
    category: 'Wallet',
    severity: 'high',
    userMessage: 'Unable to connect to your wallet.',
    suggestions: ['Make sure your wallet extension is unlocked', 'Try refreshing the page', 'Check wallet extension settings'],
    retryable: true,
  },
  [ErrorCode.TRANSACTION_REJECTED]: {
    message: 'Transaction was rejected',
    category: 'Wallet',
    severity: 'low',
    userMessage: 'You rejected the transaction.',
    suggestions: ['Try again and approve the transaction', 'Check transaction details'],
    retryable: true,
  },
  [ErrorCode.INSUFFICIENT_FUNDS]: {
    message: 'Insufficient funds for transaction',
    category: 'Wallet',
    severity: 'medium',
    userMessage: 'You don\'t have enough funds to complete this transaction.',
    suggestions: ['Add more funds to your wallet', 'Reduce transaction amount'],
    retryable: false,
  },
  [ErrorCode.WALLET_LOCKED]: {
    message: 'Wallet is locked',
    category: 'Wallet',
    severity: 'medium',
    userMessage: 'Your wallet is locked. Please unlock it.',
    suggestions: ['Unlock your wallet extension', 'Check wallet password'],
    retryable: true,
  },
  [ErrorCode.MULTIPLE_WALLETS_DETECTED]: {
    message: 'Multiple wallet extensions detected',
    category: 'Wallet',
    severity: 'medium',
    userMessage: 'Multiple wallet extensions are installed and may be conflicting.',
    suggestions: ['Disable unused wallet extensions', 'Keep only one wallet extension enabled', 'Refresh the page after disabling'],
    retryable: true,
  },

  // Contract Errors
  [ErrorCode.CONTRACT_NOT_DEPLOYED]: {
    message: 'Contract not deployed',
    category: 'Contract',
    severity: 'high',
    userMessage: 'The smart contract is not deployed on this network.',
    suggestions: ['Check if you\'re on the correct network', 'Contact support'],
    retryable: false,
  },
  [ErrorCode.CONTRACT_CALL_FAILED]: {
    message: 'Contract call failed',
    category: 'Contract',
    severity: 'high',
    userMessage: 'The smart contract call failed.',
    suggestions: ['Check transaction parameters', 'Ensure you have enough gas', 'Try again'],
    retryable: true,
  },
  [ErrorCode.INVALID_CONTRACT_ADDRESS]: {
    message: 'Invalid contract address',
    category: 'Contract',
    severity: 'high',
    userMessage: 'The contract address is invalid.',
    suggestions: ['Check the contract address', 'Contact support'],
    retryable: false,
  },
  [ErrorCode.GAS_ESTIMATION_FAILED]: {
    message: 'Gas estimation failed',
    category: 'Contract',
    severity: 'medium',
    userMessage: 'Unable to estimate gas for this transaction.',
    suggestions: ['Try setting gas manually', 'Check transaction parameters'],
    retryable: true,
  },

  // Validation Errors
  [ErrorCode.INVALID_INPUT]: {
    message: 'Invalid input provided',
    category: 'Validation',
    severity: 'low',
    userMessage: 'Please check your input and try again.',
    suggestions: ['Verify all required fields are filled', 'Check input format'],
    retryable: false,
  },
  [ErrorCode.REQUIRED_FIELD_MISSING]: {
    message: 'Required field is missing',
    category: 'Validation',
    severity: 'low',
    userMessage: 'Please fill in all required fields.',
    suggestions: ['Check for empty required fields', 'Complete the form'],
    retryable: false,
  },
  [ErrorCode.INVALID_FORMAT]: {
    message: 'Invalid format',
    category: 'Validation',
    severity: 'low',
    userMessage: 'The format of your input is incorrect.',
    suggestions: ['Check the expected format', 'Follow the provided examples'],
    retryable: false,
  },

  // Application Errors
  [ErrorCode.COMPONENT_MOUNT_ERROR]: {
    message: 'Component failed to mount',
    category: 'Application',
    severity: 'high',
    userMessage: 'There was an error loading this component.',
    suggestions: ['Try refreshing the page', 'Contact support if the issue persists'],
    retryable: true,
  },
  [ErrorCode.STATE_UPDATE_ERROR]: {
    message: 'Failed to update application state',
    category: 'Application',
    severity: 'medium',
    userMessage: 'Unable to update the application state.',
    suggestions: ['Try refreshing the page', 'Check console for more details'],
    retryable: true,
  },
  [ErrorCode.DELEGATION_ERROR]: {
    message: 'Delegation operation failed',
    category: 'Application',
    severity: 'high',
    userMessage: 'Failed to create or manage delegation.',
    suggestions: ['Check wallet connection', 'Try again', 'Contact support'],
    retryable: true,
  },

  // Unknown/Generic
  [ErrorCode.UNKNOWN_ERROR]: {
    message: 'An unknown error occurred',
    category: 'Unknown',
    severity: 'medium',
    userMessage: 'An unexpected error occurred.',
    suggestions: ['Try refreshing the page', 'Contact support with error details'],
    retryable: true,
  },
};

export function getErrorInfo(code: ErrorCode): Omit<ErrorDetails, 'code' | 'timestamp' | 'context'> {
  return ERROR_REGISTRY[code] || ERROR_REGISTRY[ErrorCode.UNKNOWN_ERROR];
}

export function createError(code: ErrorCode, originalError?: Error | unknown, context?: Record<string, any>): ApplicationError {
  return new ApplicationError(code, originalError, context);
}

// Error classification helpers
export function classifyError(error: unknown): ErrorCode {
  if (error instanceof ApplicationError) {
    return error.details.code;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return ErrorCode.NETWORK_ERROR;
    }

    // JSON parsing errors
    if (message.includes('unexpected token') || message.includes('json')) {
      return ErrorCode.INVALID_JSON_RESPONSE;
    }

    // Rate limiting
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return ErrorCode.TOO_MANY_REQUESTS;
    }

    // Wallet errors
    if (message.includes('wallet') || message.includes('metamask')) {
      return ErrorCode.WALLET_CONNECTION_FAILED;
    }

    // Contract errors
    if (message.includes('contract')) {
      return ErrorCode.CONTRACT_CALL_FAILED;
    }
  }

  return ErrorCode.UNKNOWN_ERROR;
}

// Error tracking
class ErrorTracker {
  private errors: ApplicationError[] = [];
  private maxErrors = 100; // Keep last 100 errors

  track(error: ApplicationError): void {
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error ${error.details.code}: ${error.details.category}`);
      console.error('Message:', error.details.message);
      console.warn('User Message:', error.details.userMessage);
      console.info('Suggestions:', error.details.suggestions);
      console.log('Context:', error.details.context);
      console.groupEnd();
    }
  }

  getRecentErrors(count = 10): ApplicationError[] {
    return this.errors.slice(0, count);
  }

  getErrorsByCategory(category: string): ApplicationError[] {
    return this.errors.filter(error => error.details.category === category);
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errors.forEach(error => {
      const key = `${error.details.category}_${error.details.code}`;
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  }

  clear(): void {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

// Helper function to handle and track errors
export function handleError(error: unknown, context?: Record<string, any>): ApplicationError {
  let appError: ApplicationError;

  if (error instanceof ApplicationError) {
    appError = error;
  } else {
    const code = classifyError(error);
    appError = createError(code, error, context);
  }

  errorTracker.track(appError);
  return appError;
}

// Helper to get user-friendly error message
export function getUserErrorMessage(error: unknown): string {
  const appError = handleError(error);
  return appError.details.userMessage;
}