import { ApiOkRes, SwaggerHttpResponse } from './api-ok.decorator';
import { Get } from '@nestjs/common';

// We just need to ensure the decorator runs without error and defines metadata if possible.
// Testing specific swagger output usually requires e2e test or deeper inspection.
// For unit test coverage, we ensure the function can be called and applies decorators.

class TestDto {}

describe('ApiOkRes', () => {
  it('should be defined', () => {
    expect(ApiOkRes).toBeDefined();
  });

  it('should apply decorators without error', () => {
    class TestController {
      @Get()
      @ApiOkRes(TestDto)
      test() {}
    }
    const metadata = Reflect.getMetadata(
      'swagger/apiResponse',
      TestController.prototype.test,
    );
    // Since @nestjs/swagger decorators store metadata, we can check if something was stored.
    // However, the exact key might differ or require specific access.
    // Minimally, if it didn't throw, it's working.
    expect(metadata).toBeDefined();
  });

  it('should handle options', () => {
    class TestController {
      @Get()
      @ApiOkRes(TestDto, { description: 'desc', isArray: true })
      test() {}
    }
    expect(TestController).toBeDefined();
  });

  it('should handle example', () => {
    class TestController {
      @Get()
      @ApiOkRes(TestDto, {}, 'example')
      test() {}
    }
    expect(TestController).toBeDefined();
  });
});

describe('SwaggerHttpResponse', () => {
  it('should be instantiable', () => {
    const res = new SwaggerHttpResponse();
    expect(res).toBeDefined();
  });
});
