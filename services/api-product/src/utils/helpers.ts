import { ErrorMessagesImportProduct } from '@/constant/error-messages';
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

  static handleNotFoundError(message: string, data: string): never {
    console.error(message);
    throw new HttpException({ message, data }, HttpStatus.NOT_FOUND);
  }
  static handleBadRequestError(message: string, data: string): never {
    console.error(message);
    throw new HttpException({ message, data }, HttpStatus.BAD_REQUEST);
  }
  static handleForbiddenError(message: string, data: string): never {
    console.error(message);
    throw new HttpException({ message, data }, HttpStatus.FORBIDDEN);
  }
  static handleInternalServerError(message: string, error: string): never {
    console.error(error);
    throw new HttpException(
      { message, data: 'INTERNAL_SERVER_ERROR', description: error },
      HttpStatus.INTERNAL_SERVER_ERROR,
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

export function throwTemplateFormatError(): never {
  throw new HttpException(
    {
      message: ErrorMessagesImportProduct.TEMPLATE_FORMAT_VALIDATION_FAILED,
      description: ErrorMessagesImportProduct.TEMPLATE_FORMAT_DESCRIPTION,
      error: 'Bad Request',
      data: null,
    },
    HttpStatus.BAD_REQUEST,
  );
}

export function throwEmptyDataError(): never {
  throw new HttpException(
    {
      message: ErrorMessagesImportProduct.TEMPLATE_FORMAT_VALIDATION_FAILED,
      description: ErrorMessagesImportProduct.EMPTY_DATA_DESCRIPTION,
      error: 'Bad Request',
      data: null,
    },
    HttpStatus.BAD_REQUEST,
  );
}

export class UserNotFoundByPhoneException extends HttpException {
  constructor() {
    super(
      {
        message: 'Phone number user not exists',
        error: {
          message: 'Phone number user not exists',
          code: 'PHONE_NUMBER_NOT_EXISTS',
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
          message: 'This phone number is already use in system',
          code: 'USER_ALREADY_EXISTS',
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
