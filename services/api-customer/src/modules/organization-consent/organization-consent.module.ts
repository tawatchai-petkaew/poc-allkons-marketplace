import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationConsent } from '../../model/organization-consent.entity';
import { ConsentMessage } from '../../model/consent-message.entity';
import { OrganizationConsentService } from './organization-consent.service';
import { OrganizationConsentController } from './organization-consent.controller';
import { Organization } from '@/model/organization.entity';
import { UserConsentModule } from '../user-consent/user-consent.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationConsent, Organization, ConsentMessage]),UserConsentModule],
  controllers: [OrganizationConsentController],
  providers: [OrganizationConsentService],
  exports: [OrganizationConsentService]
})
export class OrganizationConsentModule {}
