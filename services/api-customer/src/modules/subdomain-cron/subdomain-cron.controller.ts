import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubdomainCronService } from './subdomain-cron.service';

@Controller('subdomain-cron')
@ApiTags('Subdomain Cron')
export class SubdomainCronController {
  constructor(private readonly subdomainCronService: SubdomainCronService) {}

  @Get('run')
  async runCreateSubdomain() {
    await this.subdomainCronService.createSubdomains();
    return 'Run Create Subdomain';
  }
}
