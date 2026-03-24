import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { CreateSubdomainDto } from './dto/create-subdomain.dto';
import { CloudflareDNSRecord } from './interfaces/cloudflare.interface';
import { ResponseInterceptor } from '../../interceptors/response.interceptors';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';

@Controller('cloudflare')
@ApiTags('cloudflare')
export class CloudflareController {
  constructor(private readonly cloudflareService: CloudflareService) {}
  @Post('subdomain')
  @UseGuards(PublicApiKeyGuard)
  @UseInterceptors(new ResponseInterceptor())
  @HttpCode(HttpStatus.CREATED)
  async createSubdomain(
    @Body() createSubdomainDto: CreateSubdomainDto,
  ): Promise<{
    success: boolean;
    data: CloudflareDNSRecord;
    message: string;
  }> {
    const result = await this.cloudflareService.createSubdomain(
      createSubdomainDto,
    );
    return {
      success: true,
      data: result,
      message: `Subdomain created successfully`,
    };
  }
  // @Get('subdomains')
  // async listSubdomains(
  //   @Query('type') type?: string,
  // ): Promise<{
  //   success: boolean;
  //   data: CloudflareDNSRecord[];
  //   count: number;
  // }> {
  //   let records = await this.cloudflareService.listSubdomains();
  //   // Filter by type if provided
  //   if (type) {
  //     records = records.filter(
  //       (record) => record.type.toLowerCase() === type.toLowerCase(),
  //     );
  //   }
  //   return {
  //     success: true,
  //     data: records,
  //     count: records.length,
  //   };
  // }
  // @Put('subdomain/:recordId')
  // async updateSubdomain(
  //   @Param('recordId') recordId: string,
  //   @Body() updateData: Partial<CreateSubdomainDto>,
  // ): Promise<{
  //   success: boolean;
  //   data: CloudflareDNSRecord;
  //   message: string;
  // }> {
  //   const result = await this.cloudflareService.updateSubdomain(
  //     recordId,
  //     updateData,
  //   );
  //   return {
  //     success: true,
  //     data: result,
  //     message: `Subdomain updated successfully`,
  //   };
  // }
  @Delete('subdomain/:recordId')
  @UseGuards(PublicApiKeyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubdomain(@Param('recordId') recordId: string): Promise<void> {
    await this.cloudflareService.deleteSubdomain(recordId);
  }
  // @Get('test-connection')
  // async testConnection(): Promise<{
  //   success: boolean;
  //   message: string;
  // }> {
  //   return await this.cloudflareService.testConnectivity();
  // }
}
