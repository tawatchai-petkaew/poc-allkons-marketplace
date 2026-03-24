import { ResponseInterceptor } from './response.interceptors';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response', (done) => {
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as ExecutionContext;

    const next = {
      handle: () => of({ key: 'value' }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 201,
        message: 'Success',
        data: { key: 'value' },
      });
      done();
    });
  });

  it('should use default status code 200', (done) => {
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({}), // no statusCode
      }),
    } as ExecutionContext;

    const next = {
      handle: () => of('data'),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: 'data',
      });
      done();
    });
  });

  it('should use message from data', (done) => {
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext;

    const next = {
      handle: () => of({ message: 'Custom Message', data: 'real data' }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Custom Message',
        data: 'real data',
      });
      done();
    });
  });
});
