/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ImportProductService } from './import-product.service';
import { HttpException, HttpStatus, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import { ValidationResultDataDto } from './dto/validation-result.dto';
import { ExcelParserService } from '@/common/service/excel-parser.service';
import { ProductExcelRowProcessorService } from './service/product-excel-row-processor.service';
import { ResultCalculatorService } from './service/result-calculator.service';
import { ErrorHandler } from 'allkons-api-helper';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';

jest.mock('allkons-api-helper', () => ({
  ErrorHandler: {
    handleBadRequestError: jest.fn(),
    handleNotFoundError: jest.fn(),
    handleInternalServerError: jest.fn(),
  },
}));

jest.mock('fs');

const mockWorkbookInstance = {
  xlsx: {
    readFile: jest.fn().mockResolvedValue(true),
    writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-buffer')),
  },
  getWorksheet: jest.fn(),
};

jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn(() => mockWorkbookInstance),
  };
});

describe('ImportProductService', () => {
  let service: ImportProductService;

  const mockExcelParserService = {
    loadWorkbook: jest.fn(),
    getWorksheet: jest.fn(),
    getColumnKeys: jest.fn(),
    validateTemplateFormat: jest.fn(),
  };
  const mockProductExcelRowProcessorService = {
    processRows: jest.fn(),
  };
  const mockResultCalculatorService = {
    calculateResult: jest.fn(),
  };

  const mockCell = {
    value: null,
    note: null,
    style: { fill: {} },
    font: {},
  };
  const mockRow = {
    getCell: jest.fn().mockReturnValue(mockCell),
    commit: jest.fn(),
  };
  const mockWorksheet = {
    getRow: jest.fn().mockReturnValue(mockRow),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCell.value = null;
    mockCell.note = null;
    mockCell.style = { fill: {} };
    mockCell.font = {};

    mockWorkbookInstance.getWorksheet.mockReturnValue(mockWorksheet);
    mockWorkbookInstance.xlsx.readFile.mockResolvedValue(true);
    mockWorkbookInstance.xlsx.writeBuffer.mockResolvedValue(
      Buffer.from('mock-buffer'),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportProductService,
        {
          provide: ExcelParserService,
          useValue: mockExcelParserService,
        },
        {
          provide: ProductExcelRowProcessorService,
          useValue: mockProductExcelRowProcessorService,
        },
        {
          provide: ResultCalculatorService,
          useValue: mockResultCalculatorService,
        },
      ],
    }).compile();

    service = module.get<ImportProductService>(ImportProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateValidationResultExcel', () => {
    const mockValidationData: ValidationResultDataDto = {
      result: { all: 1, pass: 0, fail: 1 },
      dataSheets: [
        {
          sheetNo: 1,
          sheetName: 'Product Import',
          rows: [
            {
              rowNo: 3,
              isValid: false,
              columns: [
                {
                  columnNo: 1,
                  key: 'ProductBarcode',
                  value: 'INVALID',
                  isValid: false,
                  errors: ['Error'],
                },
                {
                  columnNo: 2,
                  key: 'Valid',
                  value: 'VALID',
                  isValid: true,
                  errors: [],
                },
              ],
            },
          ],
        },
      ],
    };

    it('should generate an Excel file successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result =
        await service.generateValidationResultExcel(mockValidationData);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(mockWorkbookInstance.xlsx.readFile).toHaveBeenCalled();
      expect(mockWorkbookInstance.getWorksheet).toHaveBeenCalledWith(
        'Product Import',
      );
      expect(mockWorksheet.getRow).toHaveBeenCalledWith(3);
      expect(mockRow.getCell).toHaveBeenCalledWith(1);
      expect(mockRow.getCell).toHaveBeenCalledWith(3);

      expect(mockCell.value).toBe('fail');
      expect(mockCell.font).toEqual({
        name: 'Calibri',
        size: 11,
        color: { argb: 'FFFF0000' },
      });

      expect(mockWorkbookInstance.xlsx.writeBuffer).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundError if template file is missing', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const handleNotFoundErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleNotFoundError',
      );
      handleNotFoundErrorSpy.mockImplementation(() => {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      });

      await expect(
        service.generateValidationResultExcel(mockValidationData),
      ).rejects.toThrow(HttpException);
      expect(ErrorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('should throw BadRequestError if input data is invalid', async () => {
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
      });

      await expect(
        service.generateValidationResultExcel({} as any),
      ).rejects.toThrow(HttpException);
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        'Invalid validation result data',
      );
    });

    it('should apply cleanup and styles to cells correctly', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.generateValidationResultExcel(mockValidationData);

      expect(mockRow.getCell).toHaveBeenCalledWith(1);
    });

    it('should skip rows less than DATA_START_ROW (3)', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const skipData = JSON.parse(JSON.stringify(mockValidationData));
      skipData.dataSheets[0].rows[0].rowNo = 2;

      await service.generateValidationResultExcel(skipData);

      expect(mockWorksheet.getRow).not.toHaveBeenCalledWith(2);
    });
  });

  describe('extractFromExcel', () => {
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

    const mockWorkbook = {
      worksheets: [{ name: 'Sheet1' }],
    };

    const mockWorksheet = {
      name: 'Sheet1',
    };

    const mockKeys = ['ProductBarcode', 'Brand', 'ProductName'];
    const mockRows = [
      {
        rowNo: 3,
        isValid: true,
        columns: [],
      },
    ];

    const mockResult = {
      all: 1,
      pass: 1,
      fail: 0,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should extract Excel data successfully', async () => {
      (mockExcelParserService.loadWorkbook as jest.Mock).mockResolvedValue(
        mockWorkbook,
      );
      (mockExcelParserService.getWorksheet as jest.Mock).mockReturnValue(
        mockWorksheet,
      );
      (
        mockExcelParserService.validateTemplateFormat as jest.Mock
      ).mockReturnValue(undefined);
      (mockExcelParserService.getColumnKeys as jest.Mock).mockReturnValue(
        mockKeys,
      );
      (
        mockProductExcelRowProcessorService.processRows as jest.Mock
      ).mockResolvedValue(mockRows);
      (
        mockResultCalculatorService.calculateResult as jest.Mock
      ).mockReturnValue(mockResult);

      const result = await service.extractFromExcel(mockFile);

      expect(mockExcelParserService.loadWorkbook).toHaveBeenCalled();
      expect(mockExcelParserService.getWorksheet).toHaveBeenCalledWith(
        mockWorkbook,
        1,
      );
      expect(
        mockExcelParserService.validateTemplateFormat,
      ).toHaveBeenCalledWith(mockWorksheet, expect.any(Number));
      expect(mockExcelParserService.getColumnKeys).toHaveBeenCalledWith(
        mockWorksheet,
        expect.arrayContaining(['ProductBarcode', 'Brand', 'ProductName']),
      );
      expect(
        mockProductExcelRowProcessorService.processRows,
      ).toHaveBeenCalledWith(mockWorksheet, mockKeys, 3);
      expect(mockResultCalculatorService.calculateResult).toHaveBeenCalled();
      expect(result.result).toEqual(mockResult);
      expect(result.dataSheets).toHaveLength(1);
    });

    it('should throw BadRequestError when file is null', async () => {
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException(
          ErrorMessagesImportProduct.TEMPLATE_FORMAT_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      });

      await expect(service.extractFromExcel(null as any)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        ErrorMessagesImportProduct.TEMPLATE_FORMAT_ERROR,
      );
    });

    it('should throw BadRequestError when file is not .xlsx', async () => {
      const invalidFile = { ...mockFile, originalname: 'test.pdf' };
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException(
          ErrorMessagesImportProduct.INVALID_FILE_EXTENSION_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      });

      await expect(service.extractFromExcel(invalidFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        ErrorMessagesImportProduct.INVALID_FILE_EXTENSION_ERROR,
      );
    });

    it('should throw BadRequestError when file is empty', async () => {
      const emptyFile = { ...mockFile, size: 0 };
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException(
          ErrorMessagesImportProduct.EMPTY_FILE_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      });

      await expect(service.extractFromExcel(emptyFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        ErrorMessagesImportProduct.EMPTY_FILE_ERROR,
      );
    });

    it('should handle worksheet not found error', async () => {
      const worksheetError = new Error('Worksheet not found');
      (mockExcelParserService.loadWorkbook as jest.Mock).mockResolvedValue(
        mockWorkbook,
      );
      (mockExcelParserService.getWorksheet as jest.Mock).mockImplementation(
        () => {
          throw worksheetError;
        },
      );

      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException(
          ErrorMessagesImportProduct.WORKSHEET_NOT_FOUND_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      });

      await expect(service.extractFromExcel(mockFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        ErrorMessagesImportProduct.WORKSHEET_NOT_FOUND_ERROR,
      );
    });

    it('should handle corrupted Excel file error', async () => {
      const corruptError = new Error('Cannot read file format');
      (mockExcelParserService.loadWorkbook as jest.Mock).mockRejectedValue(
        corruptError,
      );

      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException(
          ErrorMessagesImportProduct.INVALID_FILE_FORMAT_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      });

      await expect(service.extractFromExcel(mockFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalledWith(
        ErrorMessagesImportProduct.INVALID_FILE_FORMAT_ERROR,
      );
    });

    it('should handle invalid file format error', async () => {
      const invalidFormatError = new Error('Invalid Excel file');
      (mockExcelParserService.loadWorkbook as jest.Mock).mockRejectedValue(
        invalidFormatError,
      );

      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw new HttpException('Invalid format', HttpStatus.BAD_REQUEST);
      });

      await expect(service.extractFromExcel(mockFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).toHaveBeenCalled();
    });

    it('should handle unexpected errors with InternalServerError', async () => {
      const unexpectedError = new Error('Unexpected error');
      (mockExcelParserService.loadWorkbook as jest.Mock).mockRejectedValue(
        unexpectedError,
      );

      const handleInternalServerErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleInternalServerError',
      );
      handleInternalServerErrorSpy.mockImplementation(() => {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(service.extractFromExcel(mockFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleInternalServerError).toHaveBeenCalledWith(
        'ระบบขัดข้อง',
        unexpectedError.message,
      );
    });

    it('should re-throw HttpException from dependencies', async () => {
      const httpException = new HttpException(
        'Service error',
        HttpStatus.BAD_REQUEST,
      );
      (mockExcelParserService.loadWorkbook as jest.Mock).mockRejectedValue(
        httpException,
      );

      await expect(service.extractFromExcel(mockFile)).rejects.toThrow(
        HttpException,
      );
      expect(ErrorHandler.handleBadRequestError).not.toHaveBeenCalled();
      expect(ErrorHandler.handleInternalServerError).not.toHaveBeenCalled();
    });

    it('should convert buffer correctly when buffer is not Buffer instance', async () => {
      const uint8Array = new Uint8Array([1, 2, 3]);
      const fileWithUint8Array = {
        ...mockFile,
        buffer: uint8Array as Buffer,
      } as Express.Multer.File;

      (mockExcelParserService.loadWorkbook as jest.Mock).mockResolvedValue(
        mockWorkbook,
      );
      (mockExcelParserService.getWorksheet as jest.Mock).mockReturnValue(
        mockWorksheet,
      );
      (
        mockExcelParserService.validateTemplateFormat as jest.Mock
      ).mockReturnValue(undefined);
      (mockExcelParserService.getColumnKeys as jest.Mock).mockReturnValue(
        mockKeys,
      );
      (
        mockProductExcelRowProcessorService.processRows as jest.Mock
      ).mockResolvedValue(mockRows);
      (
        mockResultCalculatorService.calculateResult as jest.Mock
      ).mockReturnValue(mockResult);

      await service.extractFromExcel(fileWithUint8Array);

      expect(mockExcelParserService.loadWorkbook).toHaveBeenCalled();
    });
  });

  describe('generateValidationResultExcel error handling', () => {
    const mockValidationData: ValidationResultDataDto = {
      result: { all: 1, pass: 0, fail: 1 },
      dataSheets: [],
    };

    it('should handle InternalServerError for unexpected errors', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const unexpectedError = new Error('Unexpected error');
      mockWorkbookInstance.xlsx.readFile.mockRejectedValue(unexpectedError);

      const handleInternalServerErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleInternalServerError',
      );
      handleInternalServerErrorSpy.mockImplementation(() => {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(
        service.generateValidationResultExcel(mockValidationData),
      ).rejects.toThrow(HttpException);
      expect(ErrorHandler.handleInternalServerError).toHaveBeenCalledWith(
        'Could not generate validation result file',
        unexpectedError.message,
      );
    });

    it('should re-throw HttpException from validateInput', async () => {
      const httpException = new HttpException(
        'Bad request',
        HttpStatus.BAD_REQUEST,
      );
      const handleBadRequestErrorSpy = jest.spyOn(
        ErrorHandler,
        'handleBadRequestError',
      );
      handleBadRequestErrorSpy.mockImplementation(() => {
        throw httpException;
      });

      await expect(
        service.generateValidationResultExcel({} as any),
      ).rejects.toThrow(HttpException);
    });
  });
});
