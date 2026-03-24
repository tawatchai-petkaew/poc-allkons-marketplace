/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ResultCalculatorService } from './result-calculator.service';
import { DataSheet } from '../dto/extract-excel-response.dto';

describe('ResultCalculatorService', () => {
  let service: ResultCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultCalculatorService],
    }).compile();

    service = module.get<ResultCalculatorService>(ResultCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateResult', () => {
    it('should calculate correct result for all valid rows', () => {
      const dataSheets: DataSheet[] = [
        {
          sheetNo: 1,
          sheetName: 'Sheet1',
          rows: [
            { rowNo: 3, isValid: true, columns: [] },
            { rowNo: 4, isValid: true, columns: [] },
            { rowNo: 5, isValid: true, columns: [] },
          ],
        },
      ];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 3, pass: 3, fail: 0 });
    });

    it('should calculate correct result for all invalid rows', () => {
      const dataSheets: DataSheet[] = [
        {
          sheetNo: 1,
          sheetName: 'Sheet1',
          rows: [
            { rowNo: 3, isValid: false, columns: [] },
            { rowNo: 4, isValid: false, columns: [] },
          ],
        },
      ];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 2, pass: 0, fail: 2 });
    });

    it('should calculate correct result for mixed valid and invalid rows', () => {
      const dataSheets: DataSheet[] = [
        {
          sheetNo: 1,
          sheetName: 'Sheet1',
          rows: [
            { rowNo: 3, isValid: true, columns: [] },
            { rowNo: 4, isValid: false, columns: [] },
            { rowNo: 5, isValid: true, columns: [] },
            { rowNo: 6, isValid: false, columns: [] },
          ],
        },
      ];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 4, pass: 2, fail: 2 });
    });

    it('should handle multiple sheets', () => {
      const dataSheets: DataSheet[] = [
        {
          sheetNo: 1,
          sheetName: 'Sheet1',
          rows: [
            { rowNo: 3, isValid: true, columns: [] },
            { rowNo: 4, isValid: false, columns: [] },
          ],
        },
        {
          sheetNo: 2,
          sheetName: 'Sheet2',
          rows: [
            { rowNo: 3, isValid: true, columns: [] },
            { rowNo: 4, isValid: true, columns: [] },
          ],
        },
      ];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 4, pass: 3, fail: 1 });
    });

    it('should return zero counts for empty sheets', () => {
      const dataSheets: DataSheet[] = [
        {
          sheetNo: 1,
          sheetName: 'Sheet1',
          rows: [],
        },
      ];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 0, pass: 0, fail: 0 });
    });

    it('should handle empty dataSheets array', () => {
      const dataSheets: DataSheet[] = [];

      const result = service.calculateResult(dataSheets);

      expect(result).toEqual({ all: 0, pass: 0, fail: 0 });
    });
  });
});

