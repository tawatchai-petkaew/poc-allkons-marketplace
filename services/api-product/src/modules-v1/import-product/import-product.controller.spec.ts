/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ImportProductController } from './import-product.controller';
import { ImportProductService } from './import-product.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ExtractExcelResponseDto } from './dto/extract-excel-response.dto';
import { ErrorHandler } from 'allkons-api-helper';
import { Response } from 'express';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('ImportProductController', () => {
  let controller: ImportProductController;
  let service: jest.Mocked<ImportProductService>;

  const mockService = {
    extractFromExcel: jest.fn(),
    generateValidationResultExcel: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportProductController],
      providers: [
        {
          provide: ImportProductService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ImportProductController>(ImportProductController);
    service = module.get(ImportProductService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('extractExcel', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.xlsx',
      encoding: '7bit',
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1024,
      buffer: Buffer.from('mock file content'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const mockExtractResult = {
      result: {
        all: 2,
        pass: 1,
        fail: 1,
      },
      dataSheets: [
        {
          sheetNo: 1,
          sheetName: 'Product Import',
          rows: [
            {
              rowNo: 3,
              isValid: true,
              columns: [],
            },
          ],
        },
      ],
    };

    it('should extract Excel data successfully', async () => {
      (service.importAndValidateProductsExcel as jest.Mock).mockResolvedValue(
        mockExtractResult,
      );

      const result = await controller.extractExcel({} as any, mockFile);

      expect(service.importAndValidateProductsExcel).toHaveBeenCalledWith(
        mockFile,
      );
      expect(result).toBeInstanceOf(ExtractExcelResponseDto);
      expect(result.result).toEqual(mockExtractResult.result);
      expect(result.dataSheets).toEqual(mockExtractResult.dataSheets);
    });

    it('should throw BadRequestError when file is not provided', async () => {
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException('กรุณาแนบไฟล์ Excel', HttpStatus.BAD_REQUEST);
      });

      await expect(
        controller.extractExcel({} as any, undefined),
      ).rejects.toThrow(HttpException);
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        'กรุณาแนบไฟล์ Excel',
      );
      expect(service.importAndValidateProductsExcel).not.toHaveBeenCalled();
    });

    it('should re-throw HttpException from service', async () => {
      const httpException = new HttpException(
        'Service error',
        HttpStatus.BAD_REQUEST,
      );
      (service.importAndValidateProductsExcel as jest.Mock).mockRejectedValue(
        httpException,
      );

      await expect(
        controller.extractExcel({} as any, mockFile),
      ).rejects.toThrow(HttpException);
      expect(service.importAndValidateProductsExcel).toHaveBeenCalledWith(
        mockFile,
      );
    });

    it('should handle unexpected errors with handleHttpError', async () => {
      const unexpectedError = new Error('Unexpected error');
      (service.importAndValidateProductsExcel as jest.Mock).mockRejectedValue(
        unexpectedError,
      );

      const handleHttpErrorSpy = jest.spyOn(ErrorHandler, 'handleHttpError');
      handleHttpErrorSpy.mockImplementation(() => {
        throw new HttpException(
          'Failed to extract Excel data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(
        controller.extractExcel({} as any, mockFile),
      ).rejects.toThrow(HttpException);
      expect(ErrorHandler.handleHttpError).toHaveBeenCalledWith(
        unexpectedError,
        'Failed to extract Excel data',
      );
    });
  });
});
