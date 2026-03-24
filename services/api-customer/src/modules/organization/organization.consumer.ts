import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { OrganizationService } from './organization.service';
import { MailService } from '@/mail/mail.service';

@Processor('organization-consumer')
export class OrganizationConsumer {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly mailService: MailService,
  ) {}

  @Process('approve')
  async approveOrganization(job: Job<any>) {
    await this.organizationService.approveOrganizeInfo(
      job.data.id,
      job.data.step,
      job,
    );
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    if (job.attemptsMade == 3) {
      await this.mailService.sendErrorToAdminCis(
        "POST",
        job.data.url,
        job.data.body,
        job.data.error,
      );
    }
  }
}
