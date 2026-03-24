import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { ConsentMessageResponseDto } from '../dto/consent-message-response.dto';
import { ApiKeyAuth } from '../../../auth/decorators/api-auth.decorator';
import { CONSENT_MESSAGE_SWAGGER } from '../constants/swagger.constants';

export function ApiGetConsentMessage() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get consent message',
      description: 'Retrieve consent message by type, version, or latest version. Supports both Thai and English languages.'
    }),
    ApiKeyAuth(),
    ApiQuery({
      name: 'type',
      required: true,
      enum: CONSENT_MESSAGE_SWAGGER.TYPES,
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.TYPE,
      example: 'privacy_policy'
    }),
    ApiQuery({
      name: 'version',
      required: false,
      type: 'string',
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.VERSION,
      example: 'v2.0'
    }),
    ApiQuery({
      name: 'latest',
      required: false,
      type: 'boolean',
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.LATEST,
      example: true
    }),
    ApiQuery({
      name: 'language',
      required: false,
      enum: CONSENT_MESSAGE_SWAGGER.LANGUAGES,
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.LANGUAGE,
      example: 'th'
    }),
    ApiOkResponse({
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.SUCCESS,
      type: ConsentMessageResponseDto,
      schema: {
        example: CONSENT_MESSAGE_SWAGGER.EXAMPLES.SUCCESS_RESPONSE
      }
    }),
    ApiBadRequestResponse({
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.VALIDATION_ERROR,
      schema: {
        example: CONSENT_MESSAGE_SWAGGER.EXAMPLES.VALIDATION_ERROR
      }
    }),
    ApiNotFoundResponse({
      description: CONSENT_MESSAGE_SWAGGER.DESCRIPTIONS.NOT_FOUND,
      schema: {
        example: CONSENT_MESSAGE_SWAGGER.EXAMPLES.NOT_FOUND_ERROR
      }
    })
  );
}
