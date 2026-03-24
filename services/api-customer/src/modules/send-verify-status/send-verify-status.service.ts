import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { KycStatusCIS } from '../cis/enum/cis.enum';
import {
  messageTemplate,
  SendVerifyStatusInfo,
  SendVerifyStatusResponse,
} from './interfaces/send-verify-status.interface';
import { ThaiBulkSmsService } from '../thai-bulk-sms/thai-bulk-sms.service';
import { OrganizationService } from '../organization/organization.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { UserOrganizationRole } from '../user/enum/user.enum';

@Injectable()
export class SendVerifyStatusService {
  constructor(
    private readonly thaiBulkSMSService: ThaiBulkSmsService,
    private readonly organizationService: OrganizationService,
    private readonly userOrganizationService: UserOrganizationService,
  ) {}
  async sendVerifyStatusViaSMS(
    info: SendVerifyStatusInfo,
  ): Promise<SendVerifyStatusResponse> {
    if (
      info.kycStatus === KycStatusCIS.NONE ||
      info.kycStatus === KycStatusCIS.WAIT_FOR_APPROVE
    ) {
      return;
    }

    if (!info.cisNumber || info.cisNumber === '') {
      throw new HttpException('Cis number is missing', HttpStatus.BAD_REQUEST);
    }

    const org = await this.organizationService.findOrgByCisNumber(
      info.cisNumber,
    );

    if (!org) {
      throw new HttpException(
        'Organization is not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const orgMembers = await this.userOrganizationService.findUsersByOrgId(
      org.id,
    );
    const receivers = orgMembers?.filter(
      (user) =>
        user.role?.name === UserOrganizationRole.SUPER_ADMIN ||
        user.role?.name === UserOrganizationRole.OWNER,
    );

    if (!receivers?.length) {
      throw new HttpException(
        'Organization has no members to send sms',
        HttpStatus.NOT_FOUND,
      );
    }

    const messageTemplate = this.getMessageTemplate({
      orgName: org.organizeName,
      kycStatus: info.kycStatus,
      reason: info.reason,
    });

    if (!messageTemplate || messageTemplate === '') {
      throw new HttpException(
        'Message template is empty. Invalid Kyc status',
        HttpStatus.BAD_REQUEST,
      );
    }

    await Promise.all(
      receivers.map(async (receiver) => {
        try {
          await this.thaiBulkSMSService.sendSms({
            phoneNumber: receiver.user.countryCode + receiver.user.tel,
            message: messageTemplate,
          });
        } catch (err) {
          throw new HttpException(
            `Fail to send sms with Thaibulk: ${err}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );
    return {
      status: 'SUCCESS',
      message: 'Send sms to all members who have rights successfully',
    };
  }

  getMessageTemplate(info: messageTemplate): string {
    let smsMessage = '';
    switch (info.kycStatus) {
      case KycStatusCIS.APPROVE:
        smsMessage = `องค์กร ${info.orgName} ได้รับการอนุมัติแล้ว คุณสามารถเข้าสู่ระบบ เพื่อเริ่มใช้งาน Allkons ตามสิทธิ์ที่ได้รับทันที`;
        break;
      case KycStatusCIS.REQUEST_MORE:
      case KycStatusCIS.REJECT:
        if (!info.reason || info.reason === '') {
          throw new HttpException(
            'Failed Reason is empty',
            HttpStatus.BAD_REQUEST,
          );
        }
        smsMessage = `องค์กร ${info.orgName} ของท่านไม่ได้รับการอนุมัติ เนื่องจาก ${info.reason} โปรดตรวจสอบข้อมูล และดำเนินการขอยืนยันตัวตนอีกครั้ง`;
        break;
      default:
        break;
    }
    return smsMessage;
  }
}
