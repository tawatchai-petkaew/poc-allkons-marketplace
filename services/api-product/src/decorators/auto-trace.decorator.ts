import { trace, SpanStatusCode, context } from '@opentelemetry/api';

/**
 * Class decorator ที่ทำให้ทุก public methods ใน Service ถูก trace อัตโนมัติ
 */
export function AutoTrace() {
  return function (target: any) {
    const className = target.name;
    const tracer = trace.getTracer(
      process.env.OTEL_PRODUCT_SERVICE_NAME || 'product-service',
    );

    // Get all method names from prototype
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      (name) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          target.prototype,
          name,
        );
        return (
          name !== 'constructor' &&
          descriptor &&
          typeof descriptor.value === 'function' &&
          !name.startsWith('_') // Skip private methods (by convention)
        );
      },
    );

    // Wrap each method with tracing
    methodNames.forEach((methodName) => {
      const originalMethod = target.prototype[methodName];
      const spanName = `${className}.${methodName}`;

      target.prototype[methodName] = async function (...args: any[]) {
        // เริ่ม span ภายใน active context
        const span = tracer.startSpan(spanName, undefined, context.active());

        // เพิ่ม attributes
        span.setAttribute('component', 'service');
        span.setAttribute('class', className);
        span.setAttribute('method', methodName);

        // เพิ่มข้อมูลจาก arguments (เฉพาะ primitive types)
        args.forEach((arg, index) => {
          if (
            typeof arg === 'string' ||
            typeof arg === 'number' ||
            typeof arg === 'boolean'
          ) {
            span.setAttribute(`arg.${index}`, arg);
          } else if (arg && typeof arg === 'object') {
            // ถ้าเป็น object ที่มี id ให้เก็บ id
            if ('id' in arg) {
              span.setAttribute(`arg.${index}.id`, arg.id);
            }
          }
        });

        try {
          // Execute method ภายใน context ของ span
          const activeContext = trace.setSpan(context.active(), span);
          const result = await context.with(activeContext, () =>
            originalMethod.apply(this, args),
          );

          // Success
          span.setStatus({ code: SpanStatusCode.OK });

          // เพิ่มข้อมูล result
          if (result && typeof result === 'object') {
            if (Array.isArray(result)) {
              span.setAttribute('result.length', result.length);
            } else if ('id' in result) {
              span.setAttribute('result.id', result.id);
            }
          }

          return result;
        } catch (error) {
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.setAttribute('error', true);
          span.setAttribute('error.type', error.name);
          throw error;
        } finally {
          span.end();
        }
      };
    });

    return target;
  };
}
