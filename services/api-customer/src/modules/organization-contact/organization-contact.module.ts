import { OrganizationContact } from '@/model/organization-contact.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationContactService } from './organization-contact.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationContact]),
  ],
  providers: [OrganizationContactService],
  exports: [OrganizationContactService],
})
export class OrganizationContactModule {}
