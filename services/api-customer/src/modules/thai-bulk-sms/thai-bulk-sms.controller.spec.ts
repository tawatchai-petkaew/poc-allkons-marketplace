import { Test, TestingModule } from '@nestjs/testing';
import { ThaiBulkSmsController } from './thai-bulk-sms.controller';
import { ThaiBulkSmsService } from './thai-bulk-sms.service';

describe('ThaiBulkSmsController', () => {
  let controller: ThaiBulkSmsController;

  const mockService = {
    sendSms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThaiBulkSmsController],
      providers: [
        {
          provide: ThaiBulkSmsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ThaiBulkSmsController>(ThaiBulkSmsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('send', () => {
    it('should send sms', async () => {
      mockService.sendSms.mockResolvedValue({});
      const result = await controller.send({
        phoneNumber: '123',
        message: 'msg',
      });
      expect(result).toEqual({ ok: true, result: {} });
      expect(mockService.sendSms).toHaveBeenCalled();
    });
  });
});
