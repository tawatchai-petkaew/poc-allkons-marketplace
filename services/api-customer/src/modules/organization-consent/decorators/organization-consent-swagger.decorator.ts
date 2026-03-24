import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiBody
} from '@nestjs/swagger';
import { ApiKeyAuth } from '../../../auth/decorators/api-auth.decorator';
import { SaveOrganizationConsentDto } from '../dto/save-organization-consent.dto';
import { SaveOrganizationConsentResponseDto } from '../dto/save-organization-consent-response.dto';
import { ORGANIZATION_CONSENT_SWAGGER } from '../constants/swagger.constants';

export function ApiSaveOrganizationConsent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Save organization consent',
      description: ORGANIZATION_CONSENT_SWAGGER.DESCRIPTIONS.OPERATION
    }),
    ApiKeyAuth(),
    ApiBody({
      type: SaveOrganizationConsentDto,
      description: 'organization consent data',
      examples: {
        'single-consent': {
          summary: 'Single consent',
          value: ORGANIZATION_CONSENT_SWAGGER.EXAMPLES.REQUEST_SINGLE
        },
        'multiple-consents': {
          summary: 'Multiple consents',
          value: ORGANIZATION_CONSENT_SWAGGER.EXAMPLES.REQUEST_MULTIPLE
        }
      }
    }),
    ApiOkResponse({
      description: ORGANIZATION_CONSENT_SWAGGER.DESCRIPTIONS.SUCCESS,
      type: SaveOrganizationConsentResponseDto,
      schema: {
        example: ORGANIZATION_CONSENT_SWAGGER.EXAMPLES.SUCCESS_RESPONSE
      }
    }),
    ApiBadRequestResponse({
      description: ORGANIZATION_CONSENT_SWAGGER.DESCRIPTIONS.VALIDATION_ERROR,
      schema: {
        example: ORGANIZATION_CONSENT_SWAGGER.EXAMPLES.VALIDATION_ERROR
      }
    })
  );
}
