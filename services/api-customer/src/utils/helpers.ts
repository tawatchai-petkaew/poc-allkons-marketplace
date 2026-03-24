import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

export class ErrorHandler {
  static handleHttpError(error: any, message: string): never {
    console.error(message, error);
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      { message, description: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static handleBadRequestError(
    message: string,
    data?: any,
    description?: string,
  ): never {
    console.error(message);
    throw new HttpException(
      {
        message: message || 'Request failed',
        error: 'Bad Request',
        data: data ?? null,
        description: description ?? null,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  static handleUnauthorizedError(
    message?: string,
    description?: string,
  ): never {
    const errorMessage = message || 'Token expired';
    console.error(errorMessage);
    throw new HttpException(
      {
        message: errorMessage,
        error: 'Unauthorized',
        data: null,
        description: description ?? null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  static handleForbiddenError(
    message: string,
    data?: any,
    description?: string,
  ): never {
    console.error(message);
    throw new HttpException(
      {
        message: message || 'You do not have permission to access this page',
        error: 'Forbidden',
        data: data ?? null,
        description: description ?? null,
      },
      HttpStatus.FORBIDDEN,
    );
  }

  static handleNotFoundError(
    message: string,
    data?: any,
    description?: string,
  ): never {
    console.error(message);
    throw new HttpException(
      {
        message: message || 'The page or data you requested could not be found',
        error: 'Not Found',
        data: data ?? null,
        description: description ?? null,
      },
      HttpStatus.NOT_FOUND,
    );
  }

  static handleConflictError(
    message: string,
    data?: any,
    description?: string,
  ): never {
    console.error(message);
    throw new HttpException(
      {
        message: message || 'Resource conflict',
        error: 'Conflict',
        data: data ?? null,
        description: description ?? null,
      },
      HttpStatus.CONFLICT,
    );
  }

  static handleUnprocessableEntityError(
    message: string,
    data?: any,
    description?: string,
  ): never {
    console.error(message);
    throw new HttpException(
      {
        message: message || 'An error occurred. Please try again.',
        error: 'Unprocessable Entity',
        data: data ?? null,
        description: description ?? null,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static handleTooManyRequestsError(
    message?: string,
    retryAfter?: number,
    description?: string,
  ): never {
    const errorMessage = message || 'Too Many Requests';
    console.error(errorMessage);
    throw new HttpException(
      {
        message: errorMessage,
        error: 'Too Many Requests',
        data: retryAfter ? { retryAfter } : null,
        description: description ?? null,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  static handleInternalServerError(
    message: string,
    error?: string,
    description?: string,
  ): never {
    console.error(message, error);
    throw new HttpException(
      {
        message: message || 'System Error',
        error: 'Internal Server Error',
        data: null,
        description: description ?? error ?? null,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static handleBadGatewayError(message?: string, description?: string): never {
    const errorMessage = message || 'The system cannot connect to the server';
    console.error(errorMessage);
    throw new HttpException(
      {
        message: errorMessage,
        error: 'Bad Gateway',
        data: null,
        description: description ?? null,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  static handleServiceUnavailableError(
    message?: string,
    description?: string,
  ): never {
    const errorMessage =
      message || 'The system is currently unavailable. Please try again later.';
    console.error(errorMessage);
    throw new HttpException(
      {
        message: errorMessage,
        error: 'Service Unavailable',
        data: null,
        description: description ?? null,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  static handleGatewayTimeoutError(
    message?: string,
    description?: string,
  ): never {
    const errorMessage =
      message ||
      'Unable to connect to the destination system within the specified time. Please try again later.';
    console.error(errorMessage);
    throw new HttpException(
      {
        message: errorMessage,
        error: 'Gateway Timeout',
        data: null,
        description: description ?? null,
      },
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

export class CallApiErrorHandler {
  static handleApiError(error: AxiosError, serviceMessage): never {
    if (error.response) {
      const { status, data } = error.response;
      console.error('Error calling third-party API:', serviceMessage, data);
      // Third-party API responded with an error status code
      throw new HttpException(data, status);
    } else if (error.request) {
      // No response was received
      console.error(
        'Error calling third-party API no response:',
        serviceMessage,
        error.message,
      );
      throw new HttpException(
        {
          message: 'No response form third-party API',
          description: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
        { description: error.message },
      );
    }
    // Error setting up the request
    console.error(
      'Error calling third-party API:',
      serviceMessage,
      error.message,
    );
    throw new HttpException(
      {
        message: 'Internal server error when contacting third-party',
        description: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UserNotFoundByPhoneException extends HttpException {
  constructor() {
    super(
      {
        message: 'Phone number user not exists',
        error: {
          message: 'Phone number user not exists',
          code: ErrorCode.PHONE_NUMBER_NOT_EXISTS,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DataNotFoundException extends HttpException {
  constructor(errorMessage: string, errorCode: string) {
    super(
      {
        message: 'Not Found',
        error: {
          message: errorMessage,
          code: errorCode,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Failed to register with phone number in local system',
        error: {
          message: 'This phone number is already used in system',
          code: ErrorCode.USER_ALREADY_EXISTS,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class EmailAlreadyExistsException extends HttpException {
  constructor(source: 'cis' | 'local') {
    const message =
      source === 'cis'
        ? 'Email already exists in cis system'
        : 'Email already exists in this system';

    super(
      {
        message: 'Email already exists',
        error: {
          message: message,
          code: 'EMAIL_ALREADY_EXISTS',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function getHttpStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
    [HttpStatus.CONFLICT]: 'Conflict',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  };
  return statusTexts[status] || 'Error';
}
