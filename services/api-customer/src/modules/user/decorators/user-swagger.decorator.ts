import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuth } from '../../../auth/decorators/api-auth.decorator';
import { CheckIdCardResponseDto } from '../dto/check-id-card/check-id-card-response.dto';
import { IdentityVerificationDto, IdentityVerificationResponseDto } from '../dto/identity-verification/identity-verification.dto';

export function ApiCheckIdCard() {
  return applyDecorators(
    JwtAuth(),
    ApiOperation({
      summary: 'Check Thai National ID Card registration status',
      description: 'Check if a Thai National ID Card number is already registered in the system. Requires JWT authentication token in Authorization header.'
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          idCard: {
            type: 'string',
            description: 'Thai National ID Card number (13 digits)',
            example: '1234567890123'
          }
        },
        required: ['idCard']
      }
    }),
    ApiOkResponse({
      description: 'ID card check completed successfully',
      type: CheckIdCardResponseDto,
      schema: {
        examples: {
          registered: {
            summary: 'ID card is registered',
            value: {
              isRegistered: true,
              idCard: '1234567890123',
              phoneNumber: '0891234567',
              message: 'ID card is already registered in the system'
            }
          },
          notRegistered: {
            summary: 'ID card is not registered',
            value: {
              isRegistered: false,
              idCard: '1234567890123',
              message: 'ID card is not registered in the system'
            }
          }
        }
      }
    }),
    ApiBadRequestResponse({
      description: 'Invalid ID card format',
      schema: {
        example: {
          statusCode: 400,
          message: 'Invalid Thai ID card format',
          code: 'INVALID_ID_CARD_FORMAT'
        }
      }
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        example: {
          statusCode: 500,
          message: 'Failed to check ID card',
          code: 'CHECK_ID_CARD_FAILED'
        }
      }
    })
  );
}

export function ApiUpdateIdentityVerification() {
  return applyDecorators(
    JwtAuth(),
    ApiOperation({
      summary: 'Update user identity verification information',
      description: 'Update user personal information and addresses for identity verification. Requires JWT authentication token in Authorization header.'
    }),
    ApiBody({
      type: IdentityVerificationDto,
      description: 'Identity verification data including personal info and addresses',
      examples: {
        complete: {
          summary: 'Complete identity verification data',
          value: {
            sendApproval: false,
            personalInfo: {
              firstName: 'เดชวิทย์',
              middleName: 'กรุณากรอกชื่อกลาง',
              lastName: 'มงคลจิต',
              firstNameEn: 'Dechvich',
              lastNameEn: 'Mongkoljit',
              birthDate: '1994-06-14',
              gender: 'female',
              maritalStatus: 'MARRIED',
              idCard: '124563892009'
            },
            addressInfo: {
              addressIdCard: {
                address: '123 คอนโด ABC',
                subDistrictId: '1',
                districtId: '1',
                provinceId: '1',
                countryId: '3'
              },
              addressCurrent: {
                address: '123 คอนโด ABC',
                subDistrictId: '1',
                districtId: '1',
                provinceId: '1',
                countryId: '3'
              },
              addressTaxInvoice: {
                address: '123 คอนโด ABC',
                subDistrictId: '1',
                districtId: '1',
                provinceId: '1',
                countryId: '3'
              }
            }
          }
        }
      }
    }),
    ApiOkResponse({
      description: 'User identity verification updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          firstName: { type: 'string', example: 'เดชวิทย์' },
          lastName: { type: 'string', example: 'มงคลจิต' },
          email: { type: 'string', example: 'user@example.com' }
        }
      }
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data or validation failed',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          statusCode: { type: 'number', example: 400 }
        }
      }
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Failed to update identity verification' },
          statusCode: { type: 'number', example: 500 }
        }
      }
    })
  );
}

export function ApiGetIdentityVerification() {
  return applyDecorators(
    JwtAuth(),
    ApiOperation({
      summary: 'Get user identity verification information',
      description: 'Retrieve user personal information and addresses for identity verification. Requires JWT authentication token in Authorization header.'
    }),
    ApiParam({
      name: 'id',
      description: 'User ID',
      example: 1,
      type: Number
    }),
    ApiOkResponse({
      description: 'User identity verification data retrieved successfully',
      type: IdentityVerificationResponseDto,
      schema: {
        example: {
          personalInfo: {
            firstName: 'เดชวิทย์',
            middleName: '',
            lastName: 'มงคลจิต',
            firstNameEn: 'Dechvich',
            middleNameEn: '',
            lastNameEn: 'Mongkoljit',
            birthDate: '1994-06-14',
            gender: 'female',
            maritalStatus: 'MARRIED',
            idCard: '1234567890123'
          },
          addressInfo: {
            addressIdCard: {
              address: '123 คอนโด ABC',
              countryId: 3,
              countryNameTh: 'ประเทศไทย',
              provinceId: 1,
              provinceNameTh: 'กรุงเทพมหานคร',
              districtId: 1,
              districtNameTh: 'เขตปทุมวัน',
              subDistrictId: 1,
              subDistrictNameTh: 'แขวงปทุมวัน',
              zipCode: 10110,
              cisNumber: '12345'
            },
            addressCurrent: {
              address: '456 อพาร์ทเมนท์ XYZ',
              countryId: 3,
              countryNameTh: 'ประเทศไทย',
              provinceId: 1,
              provinceNameTh: 'กรุงเทพมหานคร',
              districtId: 2,
              districtNameTh: 'เขตบางรัก',
              subDistrictId: 2,
              subDistrictNameTh: 'แขวงสีลม',
              zipCode: '10120'
            },
            addressTaxInvoice: {
              address: '789 ออฟฟิศ DEF',
              countryId: 3,
              countryNameTh: 'ประเทศไทย',
              provinceId: 1,
              provinceNameTh: 'กรุงเทพมหานคร',
              districtId: 3,
              districtNameTh: 'เขตสาทร',
              subDistrictId: 3,
              subDistrictNameTh: 'แขวงทุ่งมหาเมฆ',
              zipCode: '10130'
            }
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      schema: {
        example: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      }
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        example: {
          message: 'Failed to get identity verification: Unknown error',
          code: 'GET_IDENTITY_VERIFICATION_FAILED'
        }
      }
    })
  );
}
