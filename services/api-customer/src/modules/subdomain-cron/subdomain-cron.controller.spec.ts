import { Test, TestingModule } from '@nestjs/testing';
import { SubdomainCronController } from './subdomain-cron.controller';
import { SubdomainCronService } from './subdomain-cron.service';

describe('SubdomainCronController', () => {
  let controller: SubdomainCronController;

  const mockService = {
    createSubdomains: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubdomainCronController],
      providers: [
        {
          provide: SubdomainCronService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubdomainCronController>(SubdomainCronController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runCreateSubdomain', () => {
    it('should trigger create subdomains', async () => {
      await controller.runCreateSubdomain();
      expect(mockService.createSubdomains).toHaveBeenCalled();
    });
  });
});
