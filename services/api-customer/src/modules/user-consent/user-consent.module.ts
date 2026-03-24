import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConsent } from '../../model/user-consent.entity';
import { User } from '../../model/user.entity';
import { ConsentMessage } from '../../model/consent-message.entity';
import { UserConsentService } from './user-consent.service';
import { UserConsentController } from './user-consent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserConsent, User, ConsentMessage])],
  controllers: [UserConsentController],
  providers: [UserConsentService],
  exports: [UserConsentService]
})
export class UserConsentModule {}
