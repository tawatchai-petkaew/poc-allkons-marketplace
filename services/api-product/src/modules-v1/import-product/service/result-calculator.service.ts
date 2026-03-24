import { Injectable } from '@nestjs/common';
import { DataSheet } from '../dto/extract-excel-response.dto';

export interface ResultSummary {
  all: number;
  pass: number;
  fail: number;
}

@Injectable()
export class ResultCalculatorService {

  calculateResult(dataSheets: DataSheet[]): ResultSummary {
    let all: number = 0;
    let pass: number = 0;
    let fail: number = 0;

    for (const sheet of dataSheets) {
      for (const row of sheet.rows) {
        all++;
        if (row.isValid) {
          pass++;
        } else {
          fail++;
        }
      }
    }
    
    return { all, pass, fail };
  }
}

