import { Test, TestingModule } from '@nestjs/testing';
import { ThaiBulkSmsService } from './thai-bulk-sms.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

describe('ThaiBulkSmsService', () => {
  let service: ThaiBulkSmsService;
  let httpService: any;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn().mockImplementation((key, def) => def || 'val'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThaiBulkSmsService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ThaiBulkSmsService>(ThaiBulkSmsService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send sms successfully', async () => {
      const response = { data: { total_use_credit: 1, remaining_credit: 10 } };
      httpService.post.mockReturnValue(of(response));

      const result = await service.sendSms({
        phoneNumber: '0812345678',
        message: 'hello',
      });
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle invalid msisdn error', async () => {
      const err = {
        response: {
          data: { error: { message: 'invalid msisdn' } },
          status: 400,
        },
      };
      httpService.post.mockReturnValue(throwError(() => err));

      await expect(
        service.sendSms({ phoneNumber: '081', message: 'hello' }),
      ).rejects.toThrow('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    });

    it('should handle quota exceeded error', async () => {
      const err = {
        response: { data: { message: 'quota exceeded' }, status: 402 },
      };
      httpService.post.mockReturnValue(throwError(() => err));

      await expect(
        service.sendSms({ phoneNumber: '081', message: 'hello' }),
      ).rejects.toThrow('โควต้าส่ง SMS หมด กรุณาเติมเครดิต');
    });

    it('should handle unauthorized error', async () => {
      const err = {
        response: { data: { message: 'unauthorized' }, status: 401 },
      };
      httpService.post.mockReturnValue(throwError(() => err));

      await expect(
        service.sendSms({ phoneNumber: '081', message: 'hello' }),
      ).rejects.toThrow(
        'ยืนยันตัวตนกับผู้ให้บริการไม่สำเร็จ ตรวจสอบ API Key/Secret',
      );
    });

    it('should handle generic error', async () => {
      const err = { response: { status: 500, statusText: 'Server Error' } };
      httpService.post.mockReturnValue(throwError(() => err));

      await expect(
        service.sendSms({ phoneNumber: '081', message: 'hello' }),
      ).rejects.toThrow(
        'ไม่สามารถส่ง SMS ได้ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ',
      );
    });
  });
});
