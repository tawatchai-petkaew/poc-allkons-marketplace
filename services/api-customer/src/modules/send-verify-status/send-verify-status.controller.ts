import { Controller, Post, UseInterceptors, Body } from '@nestjs/common';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { SendVerifyStatusService } from './send-verify-status.service';
import { SendVerifyStatusDto } from './dto/send-verify-status.dto';

@Controller('/send-verify-status')
export class SendVerifyStatusController {
  constructor(private readonly sendVerifyStatusService: SendVerifyStatusService) {}

  /**
   For testing only
   */
  @Post('/via-sms')
  @UseInterceptors(new ResponseInterceptor())
  async sendVerifyStatusViaSMS(
    @Body() body: SendVerifyStatusDto
  ) {
    return this.sendVerifyStatusService.sendVerifyStatusViaSMS(body);
  }
}
