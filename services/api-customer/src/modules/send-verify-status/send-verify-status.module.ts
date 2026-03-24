import { Module } from "@nestjs/common";
import { SendVerifyStatusService } from "./send-verify-status.service";
import { ThaiBulkSmsModule } from "../thai-bulk-sms/thai-bulk-sms.module";
import { SendVerifyStatusController } from "./send-verify-status.controller";
import { OrganizationModule } from "../organization/organization.module";
import { UserOrganizationModule } from "../user-organization/user-organization.module";

@Module({
  imports: [ThaiBulkSmsModule, OrganizationModule, UserOrganizationModule],
  controllers: [SendVerifyStatusController],
  providers: [SendVerifyStatusService],
  exports: [SendVerifyStatusService],
})
export class SendVerifyStatusModule {}