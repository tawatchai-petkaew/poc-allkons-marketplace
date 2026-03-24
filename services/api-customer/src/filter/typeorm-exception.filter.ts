import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  QueryFailedError,
  EntityNotFoundError,
  TypeORMError,
} from 'typeorm';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeORMExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let error: string | { code?: string; message?: string } | null = null;
    let data: any = null;
    let description: string | null = null;

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'Not Found';
      description = exception.message;
    } else if (exception instanceof QueryFailedError) {
      const errorCode = (exception as any).code;
      const errorMessage = exception.message;
      const errorHandler = this.getQueryErrorHandler(errorCode);

      if (errorHandler) {
        const result = errorHandler(errorMessage, exception);
        status = result.status;
        message = result.message;
        error = result.error;
        data = result.data;
        description = result.description;
      } else {
        this.logger.error(
          `Database error [${errorCode}]: ${errorMessage}`,
          exception.stack,
          `Path: ${request.method} ${request.url}`,
        );
        error = 'Internal Server Error';
        description = errorMessage ?? null;
      }
    } else {
      this.logger.error(
        `TypeORM error: ${exception.message}`,
        exception.stack,
        `Path: ${request.method} ${request.url}`,
      );
      error = 'Internal Server Error';
      description = exception.message ?? null;
    }

    if (status >= 500) {
      this.logger.error(
        `[${status}] ${request.method} ${request.url}`,
        exception.stack,
      );
    } else if (status >= 400 && status < 500) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(
          `[${status}] ${request.method} ${request.url} - ${message}`,
        );
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      data,
      description,
    });
  }

  /**
   * Get error handler function for specific error code
   */
  private getQueryErrorHandler(errorCode: string) {
    const errorHandlers: Record<
      string,
      (errorMessage: string, exception: QueryFailedError) => {
        status: HttpStatus;
        message: string;
        error: string;
        data: any;
        description: string;
      }
    > = {
      // Unique constraint violation
      '23505': (errorMessage) => {
        const match = errorMessage.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          error: 'Conflict',
          data: match
            ? {
                field: match[1],
                value: match[2],
                constraint: 'UNIQUE',
              }
            : null,
          description: 'A record with this value already exists',
        };
      },

      // Foreign key constraint violation
      '23503': () => ({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid reference',
        error: 'Bad Request',
        data: null,
        description: 'Referenced record does not exist',
      }),

      // Not null constraint violation
      '23502': (errorMessage) => {
        const match = errorMessage.match(/column "([^"]+)"/);
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Required field is missing',
          error: 'Bad Request',
          data: match
            ? {
                field: match[1],
                constraint: 'NOT_NULL',
              }
            : null,
          description: 'A required field cannot be null',
        };
      },

      // Invalid input syntax
      '22P02': () => ({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid input format',
        error: 'Bad Request',
        data: null,
        description: 'The provided value is not in the correct format',
      }),

      // Check constraint violation
      '23514': () => ({
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation constraint failed',
        error: 'Bad Request',
        data: null,
        description: 'The provided value violates a check constraint',
      }),

      // Connection errors
      ECONNREFUSED: () => ({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection failed',
        error: 'Service Unavailable',
        data: null,
        description: 'Unable to connect to the database',
      }),

      ETIMEDOUT: () => ({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection failed',
        error: 'Service Unavailable',
        data: null,
        description: 'Unable to connect to the database',
      }),

      // Deadlock
      '40P01': () => ({
        status: HttpStatus.CONFLICT,
        message: 'Database deadlock detected',
        error: 'Conflict',
        data: null,
        description: 'Please retry the operation',
      }),
    };

    return errorHandlers[errorCode];
  }
}