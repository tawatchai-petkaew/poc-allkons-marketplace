import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { Response } from 'express';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('TemplateController', () => {
  let controller: TemplateController;
  let service: TemplateService;

  const mockStream = {
    pipe: jest.fn(),
  };

  const mockStreamableFile = {
    getStream: jest.fn().mockReturnValue(mockStream),
  };

  const mockService = {
    getImportProductTemplateStream: jest
      .fn()
      .mockResolvedValue(mockStreamableFile),
  };

  const mockResponse = {
    set: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        {
          provide: TemplateService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TemplateController>(TemplateController);
    service = module.get<TemplateService>(TemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('downloadProductTemplate', () => {
    it('should download template file sucessfully', async () => {
      await controller.downloadProductTemplate(mockResponse);

      expect(service.getImportProductTemplateStream).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="Template_import_product.xlsx"',
      });
      expect(mockStreamableFile.getStream).toHaveBeenCalled();
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });
});
