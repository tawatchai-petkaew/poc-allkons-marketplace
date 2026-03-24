import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareService } from './cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';
import {
  CreateSubdomainDto,
  DnsRecordType,
} from './dto/create-subdomain.dto';
import { AxiosResponse } from 'axios';

describe('CloudflareService', () => {
  let service: CloudflareService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'CLOUDFLARE_API_TOKEN') return 'mock-token';
      if (key === 'CLOUDFLARE_ZONE_ID') return 'mock-zone-id';
      return null;
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudflareService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CloudflareService>(CloudflareService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubdomain', () => {
    const createDto: CreateSubdomainDto = {
      subdomain: 'test',
      type: DnsRecordType.A,
      content: '1.2.3.4',
      proxied: true,
      ttl: 1,
    };

    it('should successfully create a subdomain', async () => {
      // Mock getZoneName response
      const zoneResponse: AxiosResponse = {
        data: { success: true, result: { name: 'example.com' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Mock listSubdomains (findExistingRecord) response
      const listResponse: AxiosResponse = {
        data: { success: true, result: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Mock create request response
      const createResponse: AxiosResponse = {
        data: {
          success: true,
          result: { id: 'dns-id', name: 'test.example.com' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get
        .mockReturnValueOnce(of(zoneResponse)) // for getZoneName
        .mockReturnValueOnce(of(listResponse)); // for findExistingRecord

      mockHttpService.post.mockReturnValueOnce(of(createResponse));

      const result = await service.createSubdomain(createDto);

      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
      expect(mockHttpService.post).toHaveBeenCalled();
      expect(result).toEqual({ id: 'dns-id', name: 'test.example.com' });
    });

    it('should throw Conflict if subdomain exists', async () => {
      // Mock getZoneName
      const zoneResponse: AxiosResponse = {
        data: { success: true, result: { name: 'example.com' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Mock listSubdomains returning existing record
      const listResponse: AxiosResponse = {
        data: {
          success: true,
          result: [{ name: 'test.example.com', type: 'A' }],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get
        .mockReturnValueOnce(of(zoneResponse))
        .mockReturnValueOnce(of(listResponse));

      await expect(service.createSubdomain(createDto)).rejects.toThrow(
        HttpException,
      );
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });
  });

  describe('deleteSubdomain', () => {
    it('should successfully delete subdomain', async () => {
      const deleteResponse: AxiosResponse = {
        data: { success: true, result: { id: 'rec-id' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.delete.mockReturnValueOnce(of(deleteResponse));

      const result = await service.deleteSubdomain('rec-id');
      expect(result).toEqual({ success: true });
    });

    it('should throw error if delete fails', async () => {
      const errorResponse: AxiosResponse = {
        data: { success: false, errors: [{ message: 'Failed' }] },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockHttpService.delete.mockReturnValueOnce(of(errorResponse));

      await expect(service.deleteSubdomain('rec-id')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('listSubdomains', () => {
    it('should return list of subdomains', async () => {
      const listResponse: AxiosResponse = {
        data: { success: true, result: [{ id: '1', name: 'site.com' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValueOnce(of(listResponse));

      const result = await service.listSubdomains();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('site.com');
    });
  });
});
