import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response?.statusCode || 200;
    return next.handle().pipe(
      map((data) => ({
        statusCode: statusCode,
        message: data?.message || 'Success',
        data: data?.data ?? data,
      })),
    );
  }
}
