import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareController } from './cloudflare.controller';
import { CloudflareService } from './cloudflare.service';
import { PublicApiKeyGuard } from '../../auth/api-key.guard';
import { ConfigService } from '@nestjs/config';
import { DnsRecordType } from './dto/create-subdomain.dto';

describe('CloudflareController', () => {
  let controller: CloudflareController;
  let service: any;

  const mockService = {
    createSubdomain: jest.fn(),
    deleteSubdomain: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudflareController],
      providers: [
        {
          provide: CloudflareService,
          useValue: mockService,
        },
        {
          provide: ConfigService, // Required by guard but mocked
          useValue: { get: jest.fn() },
        },
      ],
    })
      .overrideGuard(PublicApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CloudflareController>(CloudflareController);
    service = module.get<CloudflareService>(CloudflareService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSubdomain', () => {
    it('should create subdomain successfully', async () => {
      const dto = {
        subdomain: 'test',
        type: DnsRecordType.A,
        content: '1.2.3.4',
        proxied: true,
        ttl: 1,
      };
      const expectedResult = { id: 'dns-1', name: 'test.example.com' };

      mockService.createSubdomain.mockResolvedValue(expectedResult);

      const result = await controller.createSubdomain(dto);

      expect(service.createSubdomain).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        data: expectedResult,
        message: 'Subdomain created successfully',
      });
    });
  });

  describe('deleteSubdomain', () => {
    it('should delete subdomain successfully', async () => {
      mockService.deleteSubdomain.mockResolvedValue({ success: true });

      await controller.deleteSubdomain('rec-1');

      expect(service.deleteSubdomain).toHaveBeenCalledWith('rec-1');
    });
  });
});
