import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { REQUEST_TIMEOUT_KEY } from '@/decorators/set-timeout.decorator';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue = this.reflector.get<number>(
      REQUEST_TIMEOUT_KEY,
      context.getHandler(),
    );

    // If no timeout is set, return without timeout
    if (!timeoutValue) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${timeoutValue}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}