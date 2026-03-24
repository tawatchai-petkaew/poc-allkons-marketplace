import { Test, TestingModule } from '@nestjs/testing';
import { BigqueryService } from './bigquery.service';
import { BigQuery } from '@google-cloud/bigquery';

jest.mock('@google-cloud/bigquery');

describe('BigqueryService', () => {
  let service: BigqueryService;
  let mockBigQueryInstance: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockBigQueryInstance = {
      dataset: jest.fn().mockReturnThis(),
      table: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue([{}]),
      query: jest.fn().mockResolvedValue([[]]),
    };

    ((BigQuery as unknown) as jest.Mock).mockImplementation(
      () => mockBigQueryInstance,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [BigqueryService],
    }).compile();

    service = module.get<BigqueryService>(BigqueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('query', () => {
    it('should execute query', async () => {
      const sql = 'SELECT * FROM table';
      const rows = [{ id: 1 }];
      mockBigQueryInstance.query.mockResolvedValue([rows]);

      const result = await service.query(sql);

      expect(mockBigQueryInstance.query).toHaveBeenCalledWith({ query: sql });
      expect(result).toEqual(rows);
    });
  });

  describe('insertEvent', () => {
    it('should insert event data', async () => {
      process.env.BIG_QUERY_INSERT_EVENT_DATASET_ID = 'ds';
      process.env.BIG_QUERY_INSERT_EVENT_TABLE_ID = 'tb';

      const eventData = { action: 'test' };
      const slug = 'test-slug';

      await service.insertEvent(eventData, slug);

      expect(mockBigQueryInstance.dataset).toHaveBeenCalledWith('ds');
      expect(mockBigQueryInstance.table).toHaveBeenCalledWith('tb');
      expect(mockBigQueryInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'test',
          attributes: expect.arrayContaining([
            expect.objectContaining({
              key: 'merchantSlug',
              value: { text: [slug] },
            }),
          ]),
        }),
      );
    });
  });

  describe('insertProducts', () => {
    it('should insert products', async () => {
      process.env.BIG_QUERY_INSERT_PRODUCT_DATASET_ID = 'ds-prod';
      process.env.BIG_QUERY_INSERT_PRODUCT_TABLE_ID = 'tb-prod';

      const products = [
        {
          name: 'P1',
          id: 1,
          productCategory: { name: 'Cat1' },
          merchant: { slug: 'merch1' },
          minFinalProductPrice: 100,
        },
      ];

      await service.insertProducts(products);

      expect(mockBigQueryInstance.dataset).toHaveBeenCalledWith('ds-prod');
      expect(mockBigQueryInstance.table).toHaveBeenCalledWith('tb-prod');
      expect(mockBigQueryInstance.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'P1',
            id: '1',
            categories: ['Cat1'],
          }),
        ]),
      );
    });
  });
});
