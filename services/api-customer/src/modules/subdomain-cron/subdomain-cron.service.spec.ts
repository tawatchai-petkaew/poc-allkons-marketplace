import { Test, TestingModule } from '@nestjs/testing';
import { SubdomainCronService } from './subdomain-cron.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Merchant } from '@/model';
import { getQueueToken } from '@nestjs/bull';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { IngressService } from '../ingress/ingress.service';
import { ConfigService } from '@nestjs/config';
import { SubDomainStatus } from '@/model/merchant.entity';
import { Job } from 'bull';

describe('SubdomainCronService', () => {
  let service: SubdomainCronService;
  let merchantRepo: any;
  let queue: any;
  let cloudflareService: any;
  let ingressService: any;

  beforeEach(async () => {
    merchantRepo = {
      find: jest.fn(),
      update: jest.fn(),
    };
    queue = {
      add: jest.fn(),
    };
    cloudflareService = {
      createSubdomain: jest.fn(),
      deleteSubdomain: jest.fn(),
    };
    ingressService = {
      createSubdomainIngress: jest.fn(),
    };
    const configService = {
      get: jest.fn().mockReturnValue(1000),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubdomainCronService,
        { provide: getRepositoryToken(Merchant), useValue: merchantRepo },
        { provide: getQueueToken('subdomain-consumer'), useValue: queue },
        { provide: CloudflareService, useValue: cloudflareService },
        { provide: IngressService, useValue: ingressService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<SubdomainCronService>(SubdomainCronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubdomains', () => {
    it('should add jobs for ready merchants', async () => {
      const merchants = [{ id: 1, slug: 'slug' }];
      merchantRepo.find.mockResolvedValue(merchants);

      await service.createSubdomains();

      expect(queue.add).toHaveBeenCalledWith(
        'create-subdomain',
        { merchantId: 1, slug: 'slug' },
        expect.any(Object),
      );
    });
  });

  describe('processSubdomainCreation', () => {
    it('should process successfully', async () => {
      const job = { data: { merchantId: 1, slug: 'slug' }, id: 1 } as Job;
      cloudflareService.createSubdomain.mockResolvedValue({ id: 'cf-id' });
      ingressService.createSubdomainIngress.mockResolvedValue({});
      merchantRepo.update.mockResolvedValue({});

      // Use real timers but wait? The code has 2000ms delay.
      // Using jest.useFakeTimers() is better.
      jest.useFakeTimers();

      const promise = service.processSubdomainCreation(job);
      jest.runAllTimers(); // fasten the 2000ms wait

      await promise;

      expect(cloudflareService.createSubdomain).toHaveBeenCalled();
      expect(ingressService.createSubdomainIngress).toHaveBeenCalled();
      expect(merchantRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({ subdomainStatus: SubDomainStatus.ACTIVE }),
      );

      jest.useRealTimers();
    });

    it('should handle failure and cleanup', async () => {
      const job = {
        data: { merchantId: 1, slug: 'slug' },
        id: 1,
        attemptsMade: 1,
      } as Job;
      cloudflareService.createSubdomain.mockResolvedValue({ id: 'cf-id' });
      ingressService.createSubdomainIngress.mockRejectedValue(
        new Error('fail'),
      );

      jest.useFakeTimers();
      const promise = service.processSubdomainCreation(job);
      jest.runAllTimers();

      await expect(promise).rejects.toThrow('fail');

      expect(cloudflareService.deleteSubdomain).toHaveBeenCalledWith('cf-id');
      jest.useRealTimers();
    });
  });

  describe('processSubdomainFail', () => {
    it('should update status to FAIL', async () => {
      await service.processSubdomainFail(1);
      expect(merchantRepo.update).toHaveBeenCalledWith(1, {
        subdomainStatus: SubDomainStatus.FAIL,
      });
    });
  });
});
