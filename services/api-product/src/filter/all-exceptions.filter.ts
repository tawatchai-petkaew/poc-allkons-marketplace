import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getHttpStatusText } from '@/utils/helpers';
import { ErrorCode } from '@/common/enum/global-error-code.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private readonly statusToErrorCodeMap: Record<number, ErrorCode> = {
    [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
    [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
    [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
    [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
    [HttpStatus.METHOD_NOT_ALLOWED]: ErrorCode.METHOD_NOT_ALLOWED,
    [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
    [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.UNPROCESSABLE_ENTITY,
    [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
    [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_SERVER_ERROR,
    [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
    [HttpStatus.GATEWAY_TIMEOUT]: ErrorCode.GATEWAY_TIMEOUT,
    [HttpStatus.REQUEST_TIMEOUT]: ErrorCode.REQUEST_TIMEOUT,
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('exception', (exception as any).response);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let description: string | null = null;
    let data: any = null;
    let errorCode: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.getErrorCode(status);
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;

        // Handle statusCode in the response object (backward compatibility)
        if (res.statusCode && typeof res.statusCode === 'number') {
          status = res.statusCode;
        }

        message = res.message || getHttpStatusText(status) || message;

        // Check for custom error code
        if (res.error) {
          if (typeof res.error === 'string') {
            // If error is a string, use it as custom code
            errorCode = res.error;
          } else if (typeof res.error === 'object' && res.error.code) {
            // If error is an object with code property, use that code
            errorCode = res.error.code;
          } else {
            // Fallback to standard code
            errorCode = this.getErrorCode(status);
          }
        } else {
          // No custom error provided, use standard code
          errorCode =
            (exception as any).response?.error?.code ||
            this.getErrorCode(status);
        }

        data = res.data !== undefined ? res.data : null;
        description =
          res.description !== undefined
            ? res.description
            : ((exception as any).response?.error?.message ?? null);
      }
    } else {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : 'Unknown error occurred';
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;

      this.logger.error(
        `Unhandled exception: ${errorMessage}`,
        errorStack,
        `Path: ${request.method} ${request.url}`,
      );

      message = 'An unexpected error occurred';
      errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
      description = errorMessage ?? null;
    }

    if (status >= 500) {
      this.logger.error(
        `[${status}] ${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      code: errorCode,
      data,
      description,
    });
  }

  /**
   * Get error code based on HTTP status code
   * Returns standard error code from enum or falls back to INTERNAL_SERVER_ERROR
   */
  private getErrorCode(status: number): string {
    return this.statusToErrorCodeMap[status] || ErrorCode.INTERNAL_SERVER_ERROR;
  }
}
