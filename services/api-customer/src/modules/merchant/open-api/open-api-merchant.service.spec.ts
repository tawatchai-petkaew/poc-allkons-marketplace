import { Test, TestingModule } from '@nestjs/testing';
import { OpenApiMerchantService } from './open-api-merchant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Merchant } from '@/model/merchant.entity';
import { MerchantTranslation } from '@/model/merchant-translation.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';

const createMockRepository = <T>() => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockRequest = {
  merchant: { id: 1 },
};

const mockRequestContextService = {
  currentLang: 'en',
};

const mockMerchant = { id: 1, merchantTranslations: [] };

describe('OpenApiMerchantService', () => {
  let service: OpenApiMerchantService;
  let repo: any;

  beforeEach(async () => {
    repo = createMockRepository();
    // mock findOne to return a merchant, assuming getByIdWithTranslation uses it or similar
    repo.findOne.mockResolvedValue(mockMerchant);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenApiMerchantService,
        { provide: 'REQUEST', useValue: mockRequest },
        { provide: getRepositoryToken(Merchant), useValue: repo },
        { provide: getRepositoryToken(MerchantTranslation), useValue: repo },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    }).compile();

    service = module.get<OpenApiMerchantService>(OpenApiMerchantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
