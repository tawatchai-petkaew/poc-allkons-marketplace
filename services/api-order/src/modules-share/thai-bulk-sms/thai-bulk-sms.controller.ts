import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ThaiBulkSmsService } from './thai-bulk-sms.service';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('sms')
export class ThaiBulkSmsController {
  constructor(private readonly svc: ThaiBulkSmsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async send(@Body() dto: SendSmsDto) {
    const result = await this.svc.sendSms(dto);
    return { ok: true, result };
  }
}
