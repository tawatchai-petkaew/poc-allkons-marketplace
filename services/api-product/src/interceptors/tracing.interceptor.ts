import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace, SpanStatusCode, context } from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const className = executionContext.getClass().name;
    const methodName = executionContext.getHandler().name;
    const tracer = trace.getTracer(
      process.env.OTEL_SERVICE_NAME || 'customer-service',
    );

    const spanName = `${className}.${methodName}`;

    return new Observable((subscriber) => {
      // เริ่ม span ภายใน active context
      const span = tracer.startSpan(spanName, undefined, context.active());

      // เพิ่ม attributes สำหรับ span
      span.setAttribute('component', 'nestjs');
      span.setAttribute('class', className);
      span.setAttribute('method', methodName);

      // ถ้าเป็น HTTP request ให้เพิ่มข้อมูล HTTP
      const contextType = executionContext.getType();
      if (contextType === 'http') {
        const request = executionContext.switchToHttp().getRequest();
        if (request) {
          span.setAttribute('http.method', request.method);
          span.setAttribute('http.url', request.url);
          span.setAttribute('http.route', request.route?.path || request.url);

          // เพิ่ม user info ถ้ามี
          if (request.user?.id) {
            span.setAttribute('user.id', request.user.id);
          }
        }
      }

      // Execute handler ภายใน context ของ span
      const activeContext = trace.setSpan(context.active(), span);
      context.with(activeContext, () => {
        next
          .handle()
          .pipe(
            tap({
              next: (value) => {
                // Success case
                span.setStatus({ code: SpanStatusCode.OK });

                // เพิ่มข้อมูล response ถ้าเป็น object
                if (value && typeof value === 'object') {
                  if (Array.isArray(value)) {
                    span.setAttribute('response.length', value.length);
                  } else if (value.id) {
                    span.setAttribute('response.id', value.id);
                  }
                }
              },
              error: (error) => {
                // Error case
                span.recordException(error);
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error.message,
                });
                span.setAttribute('error', true);
                span.setAttribute('error.type', error.name);
              },
              finalize: () => {
                span.end();
              },
            }),
          )
          .subscribe(subscriber);
      });
    });
  }
}
