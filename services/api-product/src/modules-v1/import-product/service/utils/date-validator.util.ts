import { ErrorMessagesImportProduct } from "@/constant/error-messages";
import { ProductImportValidationConstants } from "@/constant/valid-value";


export class DateValidator {

  static validateDateFormat(dateString: string): string {
    if (!dateString || !dateString.trim()) {
      return null;
    }

    const trimmed = dateString.trim();
    const match = trimmed.match(ProductImportValidationConstants.DATE_FORMAT_REGEX);

    if (!match) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (day < 1 || day > 31) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    if (month < 1 || month > 12) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    if (year < 2500 || year > 2600) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    if (!this.isValidDate(day, month, year)) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    const date = this.parseBuddhistDate(day, month, year);
    if (!date || date.getDate() !== day || date.getMonth() + 1 !== month) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    return null;
  }

  private static isValidDate(day: number, month: number, buddhistYear: number): boolean {
    const adYear = buddhistYear - 543;
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeapYear = (adYear % 4 === 0 && adYear % 100 !== 0) || adYear % 400 === 0;
    if (isLeapYear) {
      daysInMonth[1] = 29;
    }
    if (day > daysInMonth[month - 1]) {
      return false;
    }

    return true;
  }


  private static parseBuddhistDate(day: number, month: number, buddhistYear: number): Date | null {
    try {
      const adYear = buddhistYear - 543;
      const date = new Date(adYear, month - 1, day);
      return date;
    } catch {
      return null;
    }
  }

  static compareDates(date1Str: string, date2Str: string): number {
    const date1 = this.parseDateString(date1Str);
    const date2 = this.parseDateString(date2Str);

    if (!date1 || !date2) {
      return 0;
    }

    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
  }


  private static parseDateString(dateStr: string): Date | null {
    const match = dateStr.trim().match(ProductImportValidationConstants.DATE_FORMAT_REGEX);
    if (!match) {
      return null;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const buddhistYear = parseInt(match[3], 10);
    const adYear = buddhistYear - 543;

    try {
      const date = new Date(adYear, month - 1, day, 0, 0, 0, 0);
      return date;
    } catch {
      return null;
    }
  }


  static getCurrentDateBuddhist(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const buddhistYear = now.getFullYear() + 543;
    return `${day}/${month}/${buddhistYear}`;
  }


  static validateSpecialPriceStartDateComparison(dateString: string): string {
    if (!dateString || !dateString.trim()) {
      return null;
    }

    const currentDate = this.getCurrentDateBuddhist();
    const comparison = this.compareDates(dateString, currentDate);

    if (comparison < 0) {
      return ErrorMessagesImportProduct.START_DATE_BEFORE_IMPORT_ERROR;
    }

    return null;
  }


  static validateSpecialPriceEndDateComparison(
    endDateString: string,
    startDateString: string,
  ): string {
    if (!endDateString || !endDateString.trim()) {
      return null;
    }

    if (startDateString && startDateString.trim()) {
      const comparison = this.compareDates(endDateString, startDateString);
      if (comparison < 0) {
        return ErrorMessagesImportProduct.END_DATE_BEFORE_START_ERROR;
      }
    } else {
      const currentDate = this.getCurrentDateBuddhist();
      const comparison = this.compareDates(endDateString, currentDate);
      if (comparison < 0) {
        return ErrorMessagesImportProduct.END_DATE_BEFORE_START_ERROR;
      }
    }

    return null;
  }
}

