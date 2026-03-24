import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  CloudflareConfig,
  CloudflareDNSRecord,
  CloudflareResponse,
} from './interfaces/cloudflare.interface';

import { ConfigService } from '@nestjs/config';
import { CreateSubdomainDto } from './dto/create-subdomain.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly config: CloudflareConfig;
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = {
      apiToken: this.configService.get<string>('CLOUDFLARE_API_TOKEN'),
      zoneId: this.configService.get<string>('CLOUDFLARE_ZONE_ID')
    };
    if (!this.config.apiToken && (!this.config.email || !this.config.apiKey)) {
      throw new Error('Cloudflare credentials not configured properly');
    }
  }
  private getHeaders() {
    if (this.config.apiToken) {
      // ใช้ API Token (แนะนำ)
      return {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      };
    } else {
      // ใช้ Global API Key (เก่า)
      return {
        'X-Auth-Email': this.config.email,
        'X-Auth-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      };
    }
  }
  async createSubdomain(
    createSubdomainDto: CreateSubdomainDto,
  ): Promise<CloudflareDNSRecord> {
    const {
      subdomain,
      type,
      content,
      ttl,
      proxied,
      priority,
    } = createSubdomainDto;

    const subDomain = `${subdomain}${
      process.env.ENV_TYPE === 'prod'
        ? ''
        : process.env.ENV_TYPE === 'dev'
        ? '-dev'
        : process.env.ENV_TYPE === 'sit'
        ? '-sit'
        : process.env.ENV_TYPE === 'uat'
        ? '-uat'
        : ''
    }`;

    // สร้าง full domain name
    const zoneName = await this.getZoneName();
    const fullDomainName = `${subDomain}.${zoneName}`;

    // ตรวจสอบว่า subdomain นี้มีอยู่แล้วหรือไม่
    const existingRecord = await this.findExistingRecord(fullDomainName, type);
    if (existingRecord) {
      throw new HttpException(`Subdomain already exists`, HttpStatus.CONFLICT);
    }
    const payload: any = {
      type,
      name: fullDomainName,
      content,
      ttl: ttl || 1,
      proxied: true,
      comment: 'shopt'
    };

    // เพิ่ม priority สำหรับ MX records
    if (type === 'MX') {
      payload.priority = priority || 10;
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post<CloudflareResponse<CloudflareDNSRecord>>(
          `${this.baseUrl}/zones/${this.config.zoneId}/dns_records`,
          payload,
          { headers: this.getHeaders() },
        ),
      );
      if (!response.data.success) {
        this.logger.error('Cloudflare API Error:', response.data.errors);
        throw new HttpException(
          `Failed to create subdomain: ${
            response.data.errors[0]?.message || 'Unknown error'
          }`,
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log(`Successfully created subdomain: ${fullDomainName}`);
      return response.data.result;
    } catch (error) {
      this.logger.error('Error creating subdomain:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating subdomain',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSubdomain(recordId: string): Promise<{ success: boolean }> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<CloudflareResponse<{ id: string }>>(
          `${this.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`,
          { headers: this.getHeaders() },
        ),
      );
      if (!response.data.success) {
        throw new HttpException(
          `Failed to delete subdomain: ${
            response.data.errors[0]?.message || 'Unknown error'
          }`,
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log(`Successfully deleted subdomain with ID: ${recordId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting subdomain:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting subdomain',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listSubdomains(): Promise<CloudflareDNSRecord[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CloudflareResponse<CloudflareDNSRecord[]>>(
          `${this.baseUrl}/zones/${this.config.zoneId}/dns_records?per_page=99999`,
          { headers: this.getHeaders() },
        ),
      );
      if (!response.data.success) {
        throw new HttpException(
          `Failed to list subdomains: ${
            response.data.errors[0]?.message || 'Unknown error'
          }`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data.result;
    } catch (error) {
      this.logger.error('Error listing subdomains:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while listing subdomains',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // async updateSubdomain(
  //   recordId: string,
  //   updateData: Partial<CreateSubdomainDto>,
  // ): Promise<CloudflareDNSRecord> {
  //   try {
  //     const zoneName = await this.getZoneName();
  //     const payload: any = {};
  //     if (updateData.subdomain) {
  //       payload.name = `${updateData.subdomain}.${zoneName}`;
  //     }
  //     if (updateData.type) payload.type = updateData.type;
  //     if (updateData.content) payload.content = updateData.content;
  //     if (updateData.ttl !== undefined) payload.ttl = updateData.ttl;
  //     if (updateData.proxied !== undefined)
  //       payload.proxied = updateData.proxied;
  //     if (updateData.priority !== undefined)
  //       payload.priority = updateData.priority;
  //     const response = await firstValueFrom(
  //       this.httpService.put<CloudflareResponse<CloudflareDNSRecord>>(
  //         `${this.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`,
  //         payload,
  //         { headers: this.getHeaders() },
  //       ),
  //     );
  //     if (!response.data.success) {
  //       throw new HttpException(
  //         `Failed to update subdomain: ${
  //           response.data.errors[0]?.message || 'Unknown error'
  //         }`,
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     this.logger.log(`Successfully updated subdomain with ID: ${recordId}`);
  //     return response.data.result;
  //   } catch (error) {
  //     this.logger.error('Error updating subdomain:', error.message);
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       'Internal server error while updating subdomain',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
  private async getZoneName(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CloudflareResponse<{ name: string }>>(
          `${this.baseUrl}/zones/${this.config.zoneId}`,
          { headers: this.getHeaders() },
        ),
      );
      if (!response.data.success) {
        throw new Error('Failed to get zone information');
      }
      return response.data.result.name;
    } catch (error) {
      this.logger.error('Error getting zone name:', error.message);
      throw new HttpException(
        'Failed to get zone information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async findExistingRecord(
    name: string,
    type: string,
  ): Promise<CloudflareDNSRecord | null> {
    try {
      const records = await this.listSubdomains();
      return (
        records.find(
          (record) => record.name === name && record.type === type,
        ) || null
      );
    } catch (error) {
      this.logger.error('Error finding existing record:', error.message);
      return null;
    }
  }
  // async testConnectivity(): Promise<{ success: boolean; message: string }> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get<CloudflareResponse<any>>(
  //         `${this.baseUrl}/zones/${this.config.zoneId}`,
  //         { headers: this.getHeaders() },
  //       ),
  //     );
  //     if (response.data.success) {
  //       return {
  //         success: true,
  //         message: 'Cloudflare API connection successful',
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: `API Error: ${
  //           response.data.errors[0]?.message || 'Unknown error'
  //         }`,
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: `Connection failed: ${error.message}`,
  //     };
  //   }
  // }
}
