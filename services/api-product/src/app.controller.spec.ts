import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    getHealth: jest.fn(),
    getHealthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [ { provide: AppService, useValue: mockAppService } ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Amazing Allkons Marketplace Product API"', () => {
      expect(appController.getApp()).toBe('Amazing Allkons Marketplace Product API');
    });
  });
});
