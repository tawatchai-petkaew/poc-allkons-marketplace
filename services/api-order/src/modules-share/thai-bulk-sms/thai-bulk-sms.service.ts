import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ConfigService } from '@nestjs/config';
import { SendSmsDto } from './dto/send-sms.dto';
import { ThaiBulkSmsSendResponse } from './interfaces/thai-bulk-sms.response';

@Injectable()
export class ThaiBulkSmsService {
  private readonly logger = new Logger(ThaiBulkSmsService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly defaultSender: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>(
      'THAIBULKSMS_BASE_URL',
      'https://api-v2.thaibulksms.com',
    );
    this.apiKey = this.config.get<string>('THAIBULKSMS_API_KEY', '');
    this.apiSecret = this.config.get<string>('THAIBULKSMS_API_SECRET', '');
    this.defaultSender = this.config.get<string>(
      'THAIBULKSMS_SENDER',
      'Allkons',
    );

    if (!this.apiKey || !this.apiSecret) {
      this.logger.warn('THAIBULKSMS_API_KEY/SECRET ยังไม่ถูกตั้งค่า');
    }
  }

  private buildAuthHeader(): string {
    return Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
  }

  // Simplified mapper: map ข้อผิดพลาดจาก provider
  private mapProviderError(err: any): {
    status: number;
    message: string;
    details?: string;
  } {
    const status = err?.status ?? HttpStatus.BAD_GATEWAY;
    const rawMsg =
      err?.data?.error?.message ??
      err?.error?.message ??
      err?.data?.message ??
      err?.statusText ??
      err?.message ??
      'unknown';

    const key = String(rawMsg).toLowerCase().trim();
    let friendly = 'ไม่สามารถส่ง SMS ได้ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ';

    if (key.includes('invalid msisdn'))
      friendly = 'เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    else if (key.includes('quota exceeded'))
      friendly = 'โควต้าส่ง SMS หมด กรุณาเติมเครดิต';
    else if (key.includes('unauthorized'))
      friendly = 'ยืนยันตัวตนกับผู้ให้บริการไม่สำเร็จ ตรวจสอบ API Key/Secret';
    else if (key.includes('sender not allowed'))
      friendly = 'ชื่อผู้ส่ง (Sender) ยังไม่ได้รับอนุมัติหรือไม่ถูกต้อง';
    else if (key.includes('message rejected'))
      friendly = 'ข้อความถูกปฏิเสธจากผู้ให้บริการ กรุณาปรับข้อความ';

    return { status, message: friendly, details: String(rawMsg) };
  }

  /**
   * ส่ง SMS แบบ single msisdn
   */
  async sendSms(dto: SendSmsDto): Promise<ThaiBulkSmsSendResponse> {
    const formData = new FormData();
    formData.append('sender', dto.sender || this.defaultSender);
    formData.append('force', 'corporate'); // บัญชีองค์กรใช้ค่านี้
    formData.append('msisdn', dto.phoneNumber);
    formData.append('message', dto.message);

    const url = `${this.baseUrl}/sms`;
    const headers = {
      ...formData.getHeaders(),
      Authorization: `Basic ${this.buildAuthHeader()}`,
    };

    this.logger.log(`กำลังส่ง SMS → ${dto.phoneNumber}`);

    try {
      const res = await firstValueFrom(
        this.http.post<ThaiBulkSmsSendResponse>(url, formData, { headers }),
      );
      this.logger.log(
        `ส่งสำเร็จ: ใช้เครดิต=${res.data?.total_use_credit}, เครดิตคงเหลือ=${res.data?.remaining_credit}`,
      );
      return res.data;
    } catch (e: any) {
      const raw = e?.response ?? e;
      this.logger.error(
        `ส่งล้มเหลว msisdn=${dto.phoneNumber}`,
        JSON.stringify(raw?.data ?? raw),
      );
      const mapped = this.mapProviderError(raw);
      throw new HttpException(
        { message: mapped.message, details: mapped.details },
        mapped.status,
      );
    }
  }
}
