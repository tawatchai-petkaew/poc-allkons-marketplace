import { Module} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from '@/model/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization
    ]),
  ],
  providers: [
    OrganizationService,
  ],
  exports: [OrganizationService,],
})
export class OrganizationModule {}
