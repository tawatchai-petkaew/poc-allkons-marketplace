import { Test, TestingModule } from '@nestjs/testing';
import { CisService } from './cis.service';
import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ContactTypeCIS,
  CustomerProfileType,
  KycStatusCIS,
  PlatformCIS,
  RelationTypeCIS,
  UsagePurposeTypeCIS,
  CustomerStatusCIS,
} from './enum/cis.enum';
import { CallApiErrorHandler } from '../../utils/helpers';
import { CommonService } from '../common/common.service';
import { CreateContactProfileCis } from './interfaces/api-request.interface';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock CallApiErrorHandler
jest.mock('../../utils/helpers', () => ({
  CallApiErrorHandler: {
    handleApiError: jest.fn().mockImplementation((error, message) => {
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }),
  },
}));

describe('CisService', () => {
  let service: CisService;
  let commonService: CommonService;
  const mockCisApiKey = 'test-api-key';
  const mockCisPlatformKey = 'test-platform-key';
  const mockCisPlatformBuyerKey = 'test-platform-buyer-key';
  const mockCisUrl = 'https://test-cis-url.com';
  const mockAppId = 'test-app-id';
  const mockAppIdBuyer = 'test-app-id-buyer';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CisService,
        {
          provide: 'CIS_API_KEY',
          useValue: mockCisApiKey,
        },
        {
          provide: 'CIS_PLATFORM_SELLER_KEY',
          useValue: mockCisPlatformKey,
        },
        {
          provide: 'CIS_PLATFORM_BUYER_KEY',
          useValue: mockCisPlatformBuyerKey,
        },
        {
          provide: 'CIS_URL',
          useValue: mockCisUrl,
        },
        {
          provide: 'APP_ID_SELLER',
          useValue: mockAppId,
        },
        {
          provide: 'APP_ID_BUYER',
          useValue: mockAppIdBuyer,
        },
        {
          provide: CommonService,
          useValue: {
            writeLog: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CisService>(CisService);
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPersonalProfile', () => {
    const mockUserInfo: any = {
      firstName: 'John',
      midName: '',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    it('should successfully create a personal profile', async () => {
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: {
            cis_number: 'CIS123456789',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createPersonalProfile(mockUserInfo, true);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockCisUrl}/personal/create-personal`,
        {
          app_id: mockAppId,
          allkons_id: null,
          first_name: mockUserInfo.firstName,
          middle_name: mockUserInfo.midName,
          last_name: mockUserInfo.lastName,
          is_allow_concern: true,
          customer_status: CustomerStatusCIS.VISITOR,
          active_status: true,
        },
        {
          headers: {
            'cis360-api-key': mockCisApiKey,
            'platform-key': mockCisPlatformKey,
            'Accept-Encoding': 'identity',
          },
          decompress: false,
        },
      );

      expect(result).toEqual({
        cis_number: 'CIS123456789',
        status: 'SUCCESS',
      });
    });

    it('should handle errors when creating personal profile', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            code: '1000',
            message: 'Bad request',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        service.createPersonalProfile(mockUserInfo, true),
      ).rejects.toThrow(HttpException);
      expect(CallApiErrorHandler.handleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to create personal profile',
      );
    });
  });

  describe('createContactProfile', () => {
    const mockCisNumber = 'CIS123456789';
    const mockEmail = 'john.doe@example.com';

    const contactBody: CreateContactProfileCis = {
      app_id: mockAppId,
      cis_number: mockCisNumber,
      platform: PlatformCIS.ALLKONS_M_SELLER,
      contact_type: ContactTypeCIS.EMAIL,
      usage_purpose_type: UsagePurposeTypeCIS.NONE_SPECIFIED,
      contact: mockEmail,
      active_status: true,
      is_verify: true,
      is_default: true,
      is_kyc_document: true,
    };

    it('should successfully create a contact profile', async () => {
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: {
            id: 'CONTACT123456789',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createContactProfile(contactBody);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockCisUrl}/customer-contact/create-customer-contact`,
        contactBody,
        {
          headers: {
            'cis360-api-key': mockCisApiKey,
            'platform-key': mockCisPlatformKey,
            'Accept-Encoding': 'identity',
          },
          decompress: false,
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when creating contact profile', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            code: '1000',
            message: 'Bad request',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(service.createContactProfile(contactBody)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createPlatformAssociation', () => {
    const mockCisNumber = 'CIS123456789';

    it('should successfully create a platform association', async () => {
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: {
            id: 'PLATFORM123456789',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createPlatformAssociation(mockCisNumber);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockCisUrl}/customer-to-platform/create-customer-to-platform`,
        {
          app_id: mockAppId,
          cis_number: mockCisNumber,
          platform: PlatformCIS.ALLKONS_M_SELLER,
          create_relationship_date: expect.any(String),
          active_status: true,
        },
        {
          headers: {
            'cis360-api-key': mockCisApiKey,
            'platform-key': mockCisPlatformKey,
            'Accept-Encoding': 'identity',
          },
          decompress: false,
        },
      );

      expect(result).toEqual({
        data: {
          id: 'PLATFORM123456789',
        },
        status: 'SUCCESS',
      });
    });

    it('should handle errors when creating platform association', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            code: '1000',
            message: 'Bad request',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        service.createPlatformAssociation(mockCisNumber),
      ).rejects.toThrow(HttpException);
      expect(CallApiErrorHandler.handleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to link platform',
      );
    });
  });

  describe('createJuristicProfile', () => {
    const mockOrganizeInfo = {
      customer_profile_type: CustomerProfileType.JURISTIC,
      customer_status: 1,
      juristic_name: 'Test Company Ltd.',
      juristic_type: 'COMPANY_LIMITED',
      branch_number: '00000',
      organize_type: 'COMPANY',
      tax_id: '1234567890123',
    };

    it('should successfully create a juristic profile', async () => {
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: {
            cis_number: 'CIS123456789',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createJuristicProfile(mockOrganizeInfo);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockCisUrl}/juristic/create-juristic`,
        {
          app_id: mockAppId,
          customer_profile_type: mockOrganizeInfo.customer_profile_type,
          customer_status: mockOrganizeInfo.customer_status,
          juristic_name: mockOrganizeInfo.juristic_name,
          juristic_type: mockOrganizeInfo.juristic_type,
          juristic_type_remark: null,
          branch_number: mockOrganizeInfo.branch_number,
          organize_type: mockOrganizeInfo.organize_type,
          tax_id: mockOrganizeInfo.tax_id,
          contact_shown_highest_authority: false,
          is_dopa: true,
          is_dbd: true,
          kyc_status: KycStatusCIS.NONE,
          active_status: true,
        },
        {
          headers: {
            'cis360-api-key': mockCisApiKey,
            'platform-key': mockCisPlatformKey,
            'Accept-Encoding': 'identity',
          },
          decompress: false,
        },
      );

      expect(result).toEqual({
        cis_number: 'CIS123456789',
        status: 'SUCCESS',
      });
    });

    it('should handle errors when creating juristic profile', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            code: '1000',
            message: 'Bad request',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        service.createJuristicProfile(mockOrganizeInfo),
      ).rejects.toThrow(HttpException);
      expect(CallApiErrorHandler.handleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to create juristic profile',
      );
    });
  });

  describe('createRelationship', () => {
    const mockCisNumber = 'CIS123456789';
    const mockRelatedCisNumber = 'CIS987654321';
    const mockRelationshipType = 'BRANCH';
    const mockRole = 'OWNER';
    const mockIsOwner = true;

    it('should successfully create a relationship', async () => {
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: {
            id: 'REL123456789',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createRelationship(
        mockCisNumber,
        mockRelatedCisNumber,
        mockRelationshipType,
        mockRole,
        mockIsOwner,
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${mockCisUrl}/customer-to-customer/create-customer-to-customer`,
        {
          app_id: mockAppId,
          cis_number: mockCisNumber,
          related_cis_number: mockRelatedCisNumber,
          relationship_type: RelationTypeCIS.BRANCH,
          create_relationship_date: expect.any(String),
          role: mockRole,
          is_owner: mockIsOwner,
        },
        {
          headers: {
            'cis360-api-key': mockCisApiKey,
            'platform-key': mockCisPlatformKey,
            'Accept-Encoding': 'identity',
          },
          decompress: false,
        },
      );

      expect(result).toEqual({
        cis_number: 'REL123456789',
        status: 'SUCCESS',
      });
    });
  });
  describe('checkExistEmail', () => {
    it('should successfully check existing email', async () => {
      const mockEmail = 'john.doe@example.com';
      const mockResponse = {
        data: {
          code: '0000',
          message: 'success',
          data: { isExist: true },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.checkExistEmail(mockEmail);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('customer-check'),
        expect.objectContaining({ email: mockEmail }),
        expect.anything(),
      );
      expect(result).toEqual({
        data: mockResponse.data.data,
        status: 'SUCCESS',
      });
    });
  });

  describe('findAllMasterData', () => {
    it('should return master data', async () => {
      const mockResponse = { data: { data: [], code: '0000' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.findAllMasterData('code');
      expect(result.data).toEqual([]);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as any;
      const mockResponse = { data: { id: 'doc123' }, code: '0000' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.uploadDocument(mockAppId, mockFile);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('attachDocument', () => {
    it('should attach document', async () => {
      const mockResponse = { data: { data: { code: '0000' } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.attachDocument(mockAppId, 'cis123', []);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateStatusVerify', () => {
    it('should update status', async () => {
      const mockResponse = { data: { data: { code: '0000' } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.updateStatusVerify(
        mockAppId,
        'cis123',
        KycStatusCIS.APPROVE,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAttachDocuments', () => {
    it('should get attached documents', async () => {
      const mockResponse = { data: { data: [] } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.getAttachDocuments(
        mockAppId,
        'cis123',
        'type' as any,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getDocumentById', () => {
    it('should get document by id', async () => {
      const mockResponse = { data: { data: {} } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.getDocumentById(mockAppId, 'doc123');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getFileDocuments', () => {
    it('should get file documents as buffer', async () => {
      const mockBuffer = Buffer.from('pdf-content');
      const mockResponse = { data: mockBuffer };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.getFileDocuments(mockAppId, 'path/to/file');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('get-file-documents'),
        expect.anything(),
        expect.objectContaining({ responseType: 'arraybuffer' }),
      );
      expect(result).toEqual(mockBuffer);
    });
  });

  describe('updateUserValue', () => {
    it('should update user value', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.updateUserValue('cis123', 'type', [1, 2]);
      expect(result).toEqual({ data: 'ok', status: 'SUCCESS' });
    });
  });

  describe('addVerifyUserInfo', () => {
    it('should add verify info', async () => {
      const mockResponse = { data: { data: { code: '0000' } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.addVerifyUserInfo({} as any, 1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw if failed', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: 'fail' } }); // no data.data
      await expect(
        service.addVerifyUserInfo({} as any, 1),
      ).rejects.toBeDefined();
    });
  });

  describe('mapRoleBusinessType', () => {
    it('should map roles', () => {
      const data = [
        { code: 'PARENT', parent_ref: null },
        { code: 'CHILD', parent_ref: 'PARENT' },
      ];
      const result = service.mapRoleBusinessType(data);
      expect(result.length).toBe(1);
      expect(result[0].children.length).toBe(1);
      expect(result[0].children[0].code).toBe('CHILD');
    });
  });

  describe('unattachDocument', () => {
    it('should unattach', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.unattachDocument(mockAppId, 'cis', []);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteDocument', () => {
    it('should delete', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.deleteDocument(mockAppId, ['1']);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createCustomerAddress', () => {
    it('should create', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.createCustomerAddress({} as any);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getVerifyUserInfo', () => {
    it('should get info', async () => {
      const mockResponse = { data: { code: '0000' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.getVerifyUserInfo(mockAppId, 'cis');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateVerifyUserInfo', () => {
    it('should update info', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.updateVerifyUserInfo({} as any);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('customerContactSearch', () => {
    it('should search', async () => {
      const mockResponse = { data: { data: [] } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.customerContactSearch('cis');
      expect(result).toEqual([]);
    });
  });

  describe('newUpdateContactProfile', () => {
    it('should update', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.newUpdateContactProfile({} as any);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteContactProfile', () => {
    it('should delete', async () => {
      const mockResponse = { data: { data: 'ok' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const result = await service.deleteContactProfile({} as any);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
