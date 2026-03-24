import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBody
} from '@nestjs/swagger';
import { ApiKeyAuth } from '../../../auth/decorators/api-auth.decorator';
import { SaveUserConsentDto } from '../dto/save-user-consent.dto';
import { SaveUserConsentResponseDto } from '../dto/save-user-consent-response.dto';
import { USER_CONSENT_SWAGGER } from '../constants/swagger.constants';

export function ApiSaveUserConsent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Save user consent',
      description: USER_CONSENT_SWAGGER.DESCRIPTIONS.OPERATION
    }),
    ApiKeyAuth(),
    ApiBody({
      type: SaveUserConsentDto,
      description: 'User consent data',
      examples: {
        'single-consent': {
          summary: 'Single consent',
          value: USER_CONSENT_SWAGGER.EXAMPLES.REQUEST_SINGLE
        },
        'multiple-consents': {
          summary: 'Multiple consents',
          value: USER_CONSENT_SWAGGER.EXAMPLES.REQUEST_MULTIPLE
        }
      }
    }),
    ApiOkResponse({
      description: USER_CONSENT_SWAGGER.DESCRIPTIONS.SUCCESS,
      type: SaveUserConsentResponseDto,
      schema: {
        example: USER_CONSENT_SWAGGER.EXAMPLES.SUCCESS_RESPONSE
      }
    }),
    ApiBadRequestResponse({
      description: USER_CONSENT_SWAGGER.DESCRIPTIONS.VALIDATION_ERROR,
      schema: {
        example: USER_CONSENT_SWAGGER.EXAMPLES.VALIDATION_ERROR
      }
    }),
    ApiNotFoundResponse({
      description: USER_CONSENT_SWAGGER.DESCRIPTIONS.NOT_FOUND,
      schema: {
        example: USER_CONSENT_SWAGGER.EXAMPLES.NOT_FOUND_ERROR
      }
    })
  );
}
