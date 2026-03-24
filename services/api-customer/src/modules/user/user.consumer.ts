import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { UserService } from './user.service';
import { MailService } from '@/mail/mail.service';
import { Job } from 'bull';

@Processor('user-consumer')
export class UserConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Process('approve')
  async approveOrganization(job: Job<any>) {
    await this.userService.approveCis(job);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: any) {
    if (job.attemptsMade == 4) {
      await this.mailService.sendErrorToAdminCis(
        "POST",
        error.url,
        job.data.body,
        error.response,
      );
    }
  }
}
