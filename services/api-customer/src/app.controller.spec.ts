import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const mockAppService = {
  getHealth: jest.fn().mockReturnValue({ status: 'ok', timestamp: new Date() }),
  getHealthCheck: jest.fn().mockReturnValue({ status: 'ok', info: {} }),
};

const mockI18n = {
  t: jest.fn().mockReturnValue('Hello I18n'),
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoot', () => {
    it('should return "Hello"', () => {
      expect(controller.getRoot()).toBe('Hello');
    });
  });

  describe('getHello', () => {
    it('should return localized hello', async () => {
      const result = await controller.getHello(mockI18n as any);
      expect(result).toBe('Hello I18n');
      expect(mockI18n.t).toHaveBeenCalledWith('errors.HELLO');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      controller.getHealth();
      expect(mockAppService.getHealth).toHaveBeenCalled();
    });
  });

  describe('check', () => {
    it('should return health check', () => {
      controller.check();
      expect(mockAppService.getHealthCheck).toHaveBeenCalled();
    });
  });
});
