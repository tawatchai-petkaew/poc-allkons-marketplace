import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nContext } from 'nestjs-i18n';

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn(),
            getHealthCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return translated hello message', async () => {
      const i18n = {
        t: jest.fn().mockReturnValue('Hello World'),
      } as unknown as I18nContext;

      const result = await controller.getHello(i18n);
      expect(i18n.t).toHaveBeenCalledWith('errors.HELLO');
      expect(result).toBe('Hello World');
    });
  });

  describe('getHealth', () => {
    it('should call appService.getHealth', () => {
      const expectedResult = {
        node_env: 'test',
        uptime: 100,
        tz: 'UTC',
        tzOffSet: 0,
        message: 'OK',
        timestamp: new Date().toISOString(),
        time: new Date(),
        version: '1.0.0',
        commit: '123456',
      };
      (appService.getHealth as jest.Mock).mockReturnValue(expectedResult);

      const result = controller.getHealth();
      expect(appService.getHealth).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('check', () => {
    it('should call appService.getHealthCheck', async () => {
      const expectedResult = { status: 'ok', info: {}, error: {}, details: {} };
      (appService.getHealthCheck as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.check();
      expect(appService.getHealthCheck).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRoot', () => {
    it('should return "Hello"', () => {
      expect(controller.getRoot()).toBe('Hello');
    });
  });
});
