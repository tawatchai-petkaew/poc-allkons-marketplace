import { Test, TestingModule } from '@nestjs/testing';
import { ThaiBulkSmsService } from './thai-bulk-sms.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpStatus } from '@nestjs/common';

describe('ThaiBulkSmsService', () => {
  let service: ThaiBulkSmsService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThaiBulkSmsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<ThaiBulkSmsService>(ThaiBulkSmsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendSms', () => {
    it('should send sms successfully', async () => {
      const response = { data: { total_use_credit: 1, remaining_credit: 100 } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(response as any));

      const result = await service.sendSms({
        phoneNumber: '1234567890',
        message: 'test',
      });
      expect(result.total_use_credit).toBe(1);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const error = {
        response: {
          status: HttpStatus.BAD_REQUEST,
          data: { error: { message: 'invalid msisdn' } },
        },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));

      await expect(
        service.sendSms({ phoneNumber: '123', message: 'test' }),
      ).rejects.toThrow('เบอร์โทรศัพท์ไม่ถูกต้อง');
    });

    it('should handle quota exceeded error', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: { message: 'quota exceeded' } },
        },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));

      await expect(
        service.sendSms({ phoneNumber: '123', message: 'test' }),
      ).rejects.toThrow('โควต้าส่ง SMS หมด');
    });

    it('should handle unauthorized error', async () => {
      const error = {
        response: { status: 401, data: { message: 'unauthorized' } },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));
      await expect(
        service.sendSms({ phoneNumber: '123', message: 'test' }),
      ).rejects.toThrow('ยืนยันตัวตนกับผู้ให้บริการไม่สำเร็จ');
    });

    it('should handle sender not allowed error', async () => {
      const error = {
        response: { status: 400, message: 'sender not allowed' },
      };
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));
      await expect(
        service.sendSms({ phoneNumber: '123', message: 'test' }),
      ).rejects.toThrow('ชื่อผู้ส่ง');
    });

    it('should handle generic error', async () => {
      const error = { message: 'unknown' };
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error));
      await expect(
        service.sendSms({ phoneNumber: '123', message: 'test' }),
      ).rejects.toThrow('ไม่สามารถส่ง SMS ได้');
    });
  });
});
