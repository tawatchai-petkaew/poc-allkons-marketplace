import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { SubdomainCronService } from './subdomain-cron.service';
import { Logger } from '@nestjs/common';

@Processor('subdomain-consumer')
export class SubdomainConsumer {
  constructor(private readonly subdomainCronService: SubdomainCronService) {}
  private readonly logger = new Logger(SubdomainConsumer.name);

  @Process({
    name: 'create-subdomain',
    concurrency: 5,
  })
  async processSubdomainCreation(job: Job<any>) {
    const { merchantId } = job.data;
    this.logger.log(
      `Processing store ${merchantId} (Bull attempt: ${job.attemptsMade}/${job.opts.attempts})`,
    );
    await this.subdomainCronService.processSubdomainCreation(job);
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`,
    );

    if (job.attemptsMade == 4) {
      await this.subdomainCronService.processSubdomainFail(job.data.merchantId);
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }
}
