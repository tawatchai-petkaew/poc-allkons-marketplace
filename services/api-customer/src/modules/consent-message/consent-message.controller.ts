import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { ConsentType } from '@/model/consent-message.entity';
import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConsentMessageService } from './consent-message.service';
import { ApiGetConsentMessage } from './decorators/consent-message-swagger.decorator';
import { ConsentMessageResponseDto } from './dto/consent-message-response.dto';
import { GetConsentMessageDto } from './dto/get-consent-message.dto';

@ApiTags('Consent Message')
@Controller('v1/consent-message')
export class ConsentMessageController {
  constructor(
    private readonly consentMessageService: ConsentMessageService
  ) {}

  @UseGuards(PublicApiKeyGuard)
  @Get()
  @ApiGetConsentMessage()
  @UseInterceptors(new ResponseInterceptor())
  async getConsentMessage(
    @Query(new ValidationPipe({ transform: true })) query: GetConsentMessageDto,
  ): Promise<ConsentMessageResponseDto | ConsentMessageResponseDto[]> {
    let consentType = [...(query.types || [])];

    if (query.type && !consentType.includes(query.type)) {
      consentType.push(query.type);
    }

    if (!consentType.length) {
      consentType = Object.values(ConsentType);
    }

    const consentMessage = await this.consentMessageService.findByTypeAndOptions(
      consentType,
      query.version,
      query.language,
    );

    return Array.isArray(consentMessage)
      ? ConsentMessageResponseDto.fromEntityArray(consentMessage)
      : ConsentMessageResponseDto.fromEntity(consentMessage);
  }

  // For testing
  @Post('test-consent-message')
  async syncConsentMessage() {
    return this.consentMessageService.syncConsentMessage();
  }
}
