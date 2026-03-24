import { MailService } from '@/mail/mail.service';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('approve-member-consumer')
export class ApproveMemberConsumer {
  constructor(private readonly mailService: MailService) {}
  private readonly logger = new Logger(ApproveMemberConsumer.name);

  @Process('send-email')
  async sendEmailInviteMember(job: Job<any>) {
    await this.mailService.sendApproveMember(
      job.data.email,
      job.data.approverName,
      job.data.inviteeName,
      job.data.contact,
      job.data.targetOrg,
      job.data.roleName,
      job.data.expiresAt,
      job.data.refCode,
      job.data.link,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`,
    );
  }
}
