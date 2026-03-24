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
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn().mockReturnValue(of({ message: 'test', data: 'data' })),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 201,
        message: 'test',
        data: 'data',
      });
      done();
    });
  });

  it('should use default status 200 and message Success', (done) => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn().mockReturnValue(of('data')),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: 'data',
      });
      done();
    });
  });

  it('should handle data wrapping', (done) => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn().mockReturnValue(of({ data: 'inner' })),
    } as unknown as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: 'inner',
      });
      done();
    });
  });
});
