import { Merchant } from '@/model';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { In, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { SubDomainStatus } from '@/model/merchant.entity';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { IngressService } from '../ingress/ingress.service';
import { CreateSubdomainDto } from '../cloudflare/dto/create-subdomain.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubdomainCronService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectQueue('subdomain-consumer')
    private subdomainQueue: Queue,
    private readonly cloudflareService: CloudflareService,
    private readonly ingressService: IngressService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(SubdomainCronService.name);

  @Cron(process.env.CRON_SUBDOMAIN, { name: 'subdomain' })
  async createSubdomains() {
    const merchants = await this.merchantRepo.find({
      where: { subdomainStatus: In(['ready']) },
    });
    for (const merchant of merchants) {
      await this.subdomainQueue.add(
        'create-subdomain',
        {
          merchantId: merchant.id,
          slug: merchant.slug,
        },
        {
          attempts: 4,
          backoff: {
            type: 'fixed',
            delay: Number(
              this.configService.get<number>('DELAY_SUBDOMAIN_RETRY'),
            ),
          },
        },
      );
    }
    this.logger.log(`Queued ${merchants.length} jobs`);
  }

  async processSubdomainCreation(job: Job<any>) {
    const { merchantId, slug } = job.data;
    try {
      await this.processMerchant(merchantId, slug, job);
      await this.merchantRepo.update(
        { id: merchantId },
        {
          subdomainStatus: SubDomainStatus.ACTIVE,
          updatedAt: new Date(),
        },
      );
    } catch (error) {
      this.logger.error(
        `Merchant ${merchantId} failed (Bull attempt: ${job.attemptsMade}): ${error.message}`,
      );
      throw error;
    }
  }

  private async processMerchant(
    merchantId: number,
    slug: string,
    job: Job,
  ): Promise<void> {
    const processingId = `${slug}-${job.id}`;
    let cloudflareRecordId: string;
    this.logger.log(
      `[${processingId}] Starting subdomain creation for merchant: ${slug}`,
    );
    try {
      this.logger.log(
        `[${processingId}] Step 1/4: Creating Cloudflare DNS record...`,
      );
      const createSubdomainDto = new CreateSubdomainDto();
      createSubdomainDto.subdomain = slug;
      createSubdomainDto.content =
        'alb-allkons-490818639.ap-southeast-1.elb.amazonaws.com';
      const subdomain = await this.cloudflareService.createSubdomain(
        createSubdomainDto,
      );
      cloudflareRecordId = subdomain.id;
      this.logger.log(`[${processingId}] Step 1 completed`);
      this.logger.log(
        `[${processingId}] Step 2/4: Waiting for DNS propagation...`,
      );
      new Promise((resolve) => setTimeout(resolve, 2000));
      this.logger.log(
        `[${processingId}] Step 3/4: Creating Ingress routing...`,
      );
      await this.ingressService.createSubdomainIngress(slug);
      this.logger.log(`[${processingId}] Step 3 completed`);
    } catch (error) {
      this.logger.error(`[${processingId}] Error during processing:`, error);
      if (cloudflareRecordId) {
        try {
          this.logger.log(
            `[${processingId}] Cleaning up Cloudflare record: ${cloudflareRecordId}`,
          );
          await this.cloudflareService.deleteSubdomain(cloudflareRecordId);
          this.logger.log(`[${processingId}] Cloudflare cleanup successful`);
        } catch (cleanupError) {
          this.logger.error(
            `[${processingId}] Failed to cleanup Cloudflare record:`,
            cleanupError,
          );
        }
      }
      this.logger.error(`[${processingId}] Error bull queue process:`, error);
      throw error;
    }
  }

  async processSubdomainFail(id: number) {
    await this.merchantRepo.update(id, {
      subdomainStatus: SubDomainStatus.FAIL,
    });
  }
}
