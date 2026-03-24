import { Test, TestingModule } from '@nestjs/testing';
import { ConsentMessageService } from './consent-message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConsentMessage,
  ConsentType,
} from '../../model/consent-message.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('ConsentMessageService', () => {
  let service: ConsentMessageService;
  let repo: Repository<ConsentMessage>;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      distinctOn: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentMessageService,
        {
          provide: getRepositoryToken(ConsentMessage),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsentMessageService>(ConsentMessageService);
    repo = module.get<Repository<ConsentMessage>>(
      getRepositoryToken(ConsentMessage),
    );

    // Reset env vars before each test if needed, or set them inside tests
    process.env.ALLKONS_ID_API_URL = 'http://api.test';
    process.env.CONSENT_MESSAGE_APP_ID = 'app-id';
    process.env.CONSENT_TYPE = 'type';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByTypeAndOptions', () => {
    it('should return a single consent message', async () => {
      const mockResult = { id: 1, consentType: ConsentType.PRIVACY_POLICY };
      queryBuilder.getMany.mockResolvedValue([mockResult]);

      const result = await service.findByTypeAndOptions([
        ConsentType.PRIVACY_POLICY,
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'cm.consentType IN (:...types)',
        {
          types: [ConsentType.PRIVACY_POLICY],
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should return array of consent messages', async () => {
      const mockResults = [
        { id: 1, consentType: ConsentType.PRIVACY_POLICY },
        { id: 2, consentType: ConsentType.TERMS_OF_SERVICE },
      ];
      queryBuilder.getMany.mockResolvedValue(mockResults);

      const result = await service.findByTypeAndOptions([
        ConsentType.PRIVACY_POLICY,
        ConsentType.TERMS_OF_SERVICE,
      ]);
      expect(result).toEqual(mockResults);
    });

    it('should filter by version', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      await service.findByTypeAndOptions([ConsentType.PRIVACY_POLICY], 'v1');
      expect(
        queryBuilder.andWhere,
      ).toHaveBeenCalledWith('cm.version = :version', { version: 'v1' });
    });

    it('should throw NotFoundException if no result', async () => {
      queryBuilder.getMany.mockResolvedValue([]);
      await expect(
        service.findByTypeAndOptions([ConsentType.PRIVACY_POLICY]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('syncConsentMessage', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should abort if env vars missing', async () => {
      delete process.env.ALLKONS_ID_API_URL;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.syncConsentMessage();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing environment variables'),
      );
      consoleSpy.mockRestore();
    });

    it('should sync successfully with new messages', async () => {
      // Mock existing messages
      jest.spyOn(service, 'findByTypeAndOptions').mockResolvedValue([
        {
          consentType: ConsentType.PRIVACY_POLICY,
          version: 'v0.9',
        },
      ] as ConsentMessage[]);

      // Mock API response
      const mockApiResponse = {
        consentDocument: [
          {
            consentMasterDocumentName: 'นโยบายความเป็นส่วนตัว Allkons',
            version: '1.0',
            documentDetail: 'content',
            documentSubject: 'subject',
            consentDocumentId: '123',
          },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await service.syncConsentMessage();

      expect(repo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            consentType: ConsentType.PRIVACY_POLICY,
            version: 'v1.0',
          }),
        ]),
      );
    });

    it('should not save if no new messages', async () => {
      // Mock existing messages matching api
      jest.spyOn(service, 'findByTypeAndOptions').mockResolvedValue([
        {
          consentType: ConsentType.PRIVACY_POLICY,
          version: 'v1.0',
        },
      ] as ConsentMessage[]); // exist v1.0

      const mockApiResponse = {
        consentDocument: [
          {
            consentMasterDocumentName: 'นโยบายความเป็นส่วนตัว Allkons',
            version: '1.0', // same version
            documentDetail: 'content',
            documentSubject: 'subject',
            consentDocumentId: '123',
          },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.syncConsentMessage();

      expect(repo.save).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'No new consent message. Aborting',
      );
      consoleSpy.mockRestore();
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.syncConsentMessage();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sync consent message failed',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
