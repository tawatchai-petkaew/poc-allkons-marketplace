import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiSecurity,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Common decorator for API Key authentication
 * Can be reused across multiple controllers
 */
export function ApiKeyAuth() {
  return applyDecorators(
    ApiSecurity('X-API-KEY'),
    ApiHeader({
      name: 'app-id',
      description:
        'API Key for authentication (APP_ID_SELLER) || (APP_ID_BUYER)',
      required: true,
      schema: {
        type: 'string',
        example: 'your-api-key-here',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or missing API key',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid API key',
          error: 'Unauthorized',
        },
      },
    }),
  );
}

/**
 * Common decorator for standard error responses
 */
export function ApiStandardErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Invalid or missing API key',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid API key',
          error: 'Unauthorized',
        },
      },
    }),
  );
}

/**
 * Common decorator for JWT Bearer authentication
 * Can be reused across multiple controllers
 */
export function JwtAuth() {
  return applyDecorators(
    // ApiBearerAuth('JWT'),
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({
      description: 'Invalid or missing JWT token',
      schema: {
        examples: {
          missingToken: {
            summary: 'Missing Authorization header',
            value: {
              statusCode: 401,
              message: 'Unauthorized',
              error: 'Authorization header is required',
            },
          },
          invalidToken: {
            summary: 'Invalid JWT token',
            value: {
              statusCode: 401,
              message: 'Unauthorized',
              error: 'Invalid or expired JWT token',
            },
          },
        },
      },
    }),
  );
}
