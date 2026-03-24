import { HttpStatus, HttpException } from '@nestjs/common';
import {
  ErrorHandler,
  CallApiErrorHandler,
  UserNotFoundByPhoneException,
  DataNotFoundException,
  UserAlreadyExistsException,
  EmailAlreadyExistsException,
  getHttpStatusText,
} from './helpers';
import { AxiosError } from 'axios';

describe('Helpers', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorHandler', () => {
    it('should throw HTTP Error', () => {
      const httpError = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      expect(() => ErrorHandler.handleHttpError(httpError, 'Error')).toThrow(
        HttpException,
      );
      expect(() =>
        ErrorHandler.handleHttpError(new Error('error'), 'Error'),
      ).toThrow(HttpException);
    });

    it('should throw BAD_REQUEST', () => {
      expect(() => ErrorHandler.handleBadRequestError('Bad request')).toThrow(
        HttpException,
      );
    });

    it('should throw UNAUTHORIZED', () => {
      expect(() => ErrorHandler.handleUnauthorizedError()).toThrow(
        HttpException,
      );
    });

    it('should throw FORBIDDEN', () => {
      expect(() => ErrorHandler.handleForbiddenError('Forbidden')).toThrow(
        HttpException,
      );
    });

    it('should throw NOT_FOUND', () => {
      expect(() => ErrorHandler.handleNotFoundError('Not found')).toThrow(
        HttpException,
      );
    });

    it('should throw CONFLICT', () => {
      expect(() => ErrorHandler.handleConflictError('Conflict')).toThrow(
        HttpException,
      );
    });

    it('should throw UNPROCESSABLE_ENTITY', () => {
      expect(() =>
        ErrorHandler.handleUnprocessableEntityError('Error'),
      ).toThrow(HttpException);
    });

    it('should throw TOO_MANY_REQUESTS', () => {
      expect(() => ErrorHandler.handleTooManyRequestsError('Error')).toThrow(
        HttpException,
      );
    });

    it('should throw INTERNAL_SERVER_ERROR', () => {
      expect(() => ErrorHandler.handleInternalServerError('Error')).toThrow(
        HttpException,
      );
    });

    it('should throw BAD_GATEWAY', () => {
      expect(() => ErrorHandler.handleBadGatewayError('Error')).toThrow(
        HttpException,
      );
    });

    it('should throw SERVICE_UNAVAILABLE', () => {
      expect(() => ErrorHandler.handleServiceUnavailableError('Error')).toThrow(
        HttpException,
      );
    });

    it('should throw GATEWAY_TIMEOUT', () => {
      expect(() => ErrorHandler.handleGatewayTimeoutError('Error')).toThrow(
        HttpException,
      );
    });
  });

  describe('CallApiErrorHandler', () => {
    it('should handle error with response', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      } as AxiosError;

      expect(() => CallApiErrorHandler.handleApiError(error, 'Test')).toThrow(
        HttpException,
      );
    });

    it('should handle error without response', () => {
      const error = {
        request: {},
        message: 'Network error',
      } as AxiosError;

      expect(() => CallApiErrorHandler.handleApiError(error, 'Test')).toThrow(
        HttpException,
      );
    });

    it('should handle generic error', () => {
      const error = {
        message: 'Generic',
      } as AxiosError;
      expect(() => CallApiErrorHandler.handleApiError(error, 'Test')).toThrow(
        HttpException,
      );
    });
  });

  describe('Custom Exceptions', () => {
    it('UserNotFoundByPhoneException', () => {
      const exception = new UserNotFoundByPhoneException();
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('DataNotFoundException', () => {
      const exception = new DataNotFoundException('Not found', 'CODE');
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('UserAlreadyExistsException', () => {
      const exception = new UserAlreadyExistsException();
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('EmailAlreadyExistsException - CIS', () => {
      const exception = new EmailAlreadyExistsException('cis');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('EmailAlreadyExistsException - Local', () => {
      const exception = new EmailAlreadyExistsException('local');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('getHttpStatusText', () => {
    it('should return correct status texts', () => {
      expect(getHttpStatusText(HttpStatus.BAD_REQUEST)).toBe('Bad Request');
      expect(getHttpStatusText(HttpStatus.NOT_FOUND)).toBe('Not Found');
      expect(getHttpStatusText(999)).toBe('Error');
    });
  });
});
