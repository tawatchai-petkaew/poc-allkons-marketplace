import { Test, TestingModule } from '@nestjs/testing';
import { SendVerifyStatusController } from './send-verify-status.controller';
import { SendVerifyStatusService } from './send-verify-status.service';

describe('SendVerifyStatusController', () => {
  let controller: SendVerifyStatusController;

  const mockService = {
    sendVerifyStatusViaSMS: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SendVerifyStatusController],
      providers: [
        {
          provide: SendVerifyStatusService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SendVerifyStatusController>(
      SendVerifyStatusController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendVerifyStatusViaSMS', () => {
    it('should call service', async () => {
      const body = {} as any;
      mockService.sendVerifyStatusViaSMS.mockResolvedValue({});
      expect(await controller.sendVerifyStatusViaSMS(body)).toEqual({});
      expect(mockService.sendVerifyStatusViaSMS).toHaveBeenCalledWith(body);
    });
  });
});
