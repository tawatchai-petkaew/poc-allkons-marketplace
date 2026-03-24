import { Test, TestingModule } from '@nestjs/testing';
import { RetailApiController } from './retail-api.controller';
import { RetailApiService } from './retail-api.service';

describe('RetailApiController', () => {
  let controller: RetailApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetailApiController],
      providers: [
        {
          provide: RetailApiService,
          useValue: {
            listCatalogs: jest.fn(),
            callPredict: jest.fn(),
            callSearch: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RetailApiController>(RetailApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
