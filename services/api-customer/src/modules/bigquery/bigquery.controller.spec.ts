import { Test, TestingModule } from '@nestjs/testing';
import { BigqueryController } from './bigquery.controller';
import { BigqueryService } from './bigquery.service';

describe('BigqueryController', () => {
  let controller: BigqueryController;
  let service: any;

  const mockService = {
    insertEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BigqueryController],
      providers: [
        {
          provide: BigqueryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BigqueryController>(BigqueryController);
    service = module.get<BigqueryService>(BigqueryService);
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      mockService.insertEvent.mockResolvedValue({});
      const result = await controller.createEvent({}, 'slug');
      expect(result).toEqual({
        message: 'Event stored in BigQuery',
        response: {},
      });
      expect(service.insertEvent).toHaveBeenCalledWith({}, 'slug');
    });

    it('should handle errors', async () => {
      mockService.insertEvent.mockRejectedValue(new Error('Fail'));
      const result = await controller.createEvent({}, 'slug');
      expect(result).toEqual({
        error: 'Failed to store event',
        message: 'Fail',
      });
    });
  });
});
