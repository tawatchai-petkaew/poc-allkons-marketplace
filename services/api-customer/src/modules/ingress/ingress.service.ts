import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateIngressDto } from './dto/create-ingress.dto';
import { IngressResponse } from './dto/ingress-response.dto';

@Injectable()
export class IngressService {
  private readonly logger = new Logger(IngressService.name);
  private readonly ingressApiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ingressApiUrl =
      this.configService.get<string>('INGRESS_API_URL') ||
      'https://ing-ctl-dev.allkons.com';
  }

  async createIngress(requestData: CreateIngressDto): Promise<IngressResponse> {
    const url = `${this.ingressApiUrl}/ingress/add`;
    this.logger.log(`Creating ingress for host: ${requestData.host}`);
    this.logger.log(`Url ingress: ${url}`);
    this.logger.log(`Body to ingress: ${requestData}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post<IngressResponse>(url, requestData, {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );
      this.logger.log(
        `Successfully created ingress: ${requestData.ingress_name}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create ingress: ${error.message}`,
        error.stack,
      );
      if (error.response) {
        throw new HttpException(
          {
            message: 'Failed to create ingress',
            error: error.response.data,
            statusCode: error.response.status,
          },
          error.response.status,
        );
      } else if (error.request) {
        throw new HttpException(
          'Network error: Unable to reach ingress service',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        throw new HttpException(
          'Internal server error while creating ingress',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async createSubdomainIngress(
    slug: string,
    namespace: string = this.configService.get<string>('ENV_TYPE') == 'dev'
      ? 'develop'
      : this.configService.get<string>('ENV_TYPE'),
    serviceName: string = 'allkons-marketplace-b2c',
    servicePort: number = 80,
  ): Promise<IngressResponse> {
    const host = `${slug}-${
      this.configService.get<string>('ENV_TYPE') == 'prod'
        ? ''
        : this.configService.get<string>('ENV_TYPE')
    }.allkons.com`;
    const createIngressDto: CreateIngressDto = {
      ingress_name:
        this.configService.get<string>('INGRESS_NAME') ||
        'allkons-marketplace-b2c',
      namespace,
      host,
      service_name: serviceName,
      service_port: servicePort,
    };
    return this.createIngress(createIngressDto);
  }

  async deleteIngress(
    ingressName: string,
    namespace: string = this.configService.get<string>('ENV_TYPE') == 'dev'
      ? 'develop'
      : this.configService.get<string>('ENV_TYPE'),
  ): Promise<void> {
    const url = `${this.ingressApiUrl}/ingress/delete`;
    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          data: { ingress_name: ingressName, namespace },
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`Successfully deleted ingress: ${ingressName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete ingress ${ingressName}: ${error.message}`,
      );
      throw error;
    }
  }
}
