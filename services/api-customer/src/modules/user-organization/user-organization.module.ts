import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrganizationService } from './user-organization.service';
import { UserOrganization } from '@/model/user-organization.entity';
import { OrganizationLeaveLog } from '@/model/organization-leave-log.entity';
import { Invitation } from '@/model/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrganization, OrganizationLeaveLog, Invitation]),
  ],
  providers: [UserOrganizationService],
  exports: [UserOrganizationService],
})
export class UserOrganizationModule {}
