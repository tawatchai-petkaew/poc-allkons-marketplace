'use client';

import Button from '@/components/Button';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import { getUserDataFromToken } from '@/utils/cookies';
import { removeLeadingZero } from '@/utils/format';
import { useMutation } from '@tanstack/react-query';
import { Divider } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import dayjs from 'dayjs';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import ResponsivePopup from '..';
import { IinvitationDetail, InvitationRespondPayload } from '@/common/interfaces/Invitation.interface';
import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from '@/common/enum/invitation.enum';
import { respondInvitation } from '@/common/api/customer-service/invitation.api';

interface InvitationPopupProps {
  invitationDetail: IinvitationDetail;
  visible: boolean;
  onClose: () => void;
  isFetching: boolean;
  onLogout: (e?: boolean) => void;
  setIsLoginInvitationVisible: (value: boolean) => void;
  notification: NotificationInstance;
  router: AppRouterInstance;
  refetch: () => void;
}

const InvitationPopup: React.FC<InvitationPopupProps> = ({
  visible,
  onClose,
  invitationDetail,
  isFetching,
  onLogout,
  setIsLoginInvitationVisible,
  notification,
  router,
  refetch,
}) => {
  const isExpired = dayjs().isAfter(dayjs(invitationDetail.expiresAt));
  const isAccepted = invitationDetail.status === 'ACCEPTED';

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const params = new URLSearchParams(searchParams?.toString());

  const { mutate: acceptInvitation } = useMutation({
    mutationFn: (payload: InvitationRespondPayload) => {
      return respondInvitation(payload);
    },
    onSuccess: () => {
      notification.success({
        message: 'เข้าร่วมสำเร็จ',
        description: 'เพิ่มรายชื่อเข้าองค์กรเรียบร้อย',
      });
      refetch();
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      });
    },
  });

  const handleAcceptInvitation = () => {
    acceptInvitation({
      refCode: invitationDetail?.refCode,
      respond: UserOrganizationInviteStatusApprove.APPROVE,
      response: UserOrganizationInviteStatus.ACCEPTED,
    });
  };

  const handleLogin = () => {
    const userData = getUserDataFromToken();
    if (!userData) {
      onClose();
      setIsLoginInvitationVisible(true);
    } else if (
      removeLeadingZero((userData as any).phoneNumber) !==
      removeLeadingZero(invitationDetail.phoneNumber)
    ) {
      onLogout(false);
      setIsLoginInvitationVisible(true);
    } else {
      onClose();
      params.delete('refcode');
      router.replace(`${pathname}?${params.toString()}`);
      notification.success({
        message: 'เข้าสู่ระบบสำเร็จ',
      });
    }
  };

  return (
    <ResponsivePopup
      visible={visible}
      onClose={onClose}
      modalTitle={<></>}
      modalProps={{
        width: 960,
        centered: true,
        destroyOnHidden: true,
      }}
      drawerProps={{
        height: 'auto',
        destroyOnClose: true,
      }}
    >
      <div className="flex flex-col justify-center items-center">
        <SectionIcon
          iconClass={`${
            isExpired ? 'ri-mail-forbid-fill' : 'ri-mail-open-fill'
          }`}
          type={`${isExpired ? 'error' : 'success'}`}
        />
        <div className="flex flex-col justify-center items-center max-w-[600px] w-full">
          <Typography variant="paragraph-small">
            ยินดีต้อนรับสู่ Allkons
          </Typography>
          <Typography variant="h3">
            สวัสดีคุณ {invitationDetail.firstName} {invitationDetail.lastName}
          </Typography>

          <div className="mt-4 bg-background-secondary p-6 rounded-lg w-full flex flex-col justify-center items-center">
            <Typography
              variant="paragraph-medium"
              className="!text-text-quinary"
            >
              คุณมีคำเชิญให้เข้าร่วม
              <span className="text-text-primary pl-2">
                {invitationDetail?.organization?.juristic?.prefix}{' '}
                {invitationDetail?.organization?.organizeName}{' '}
                {invitationDetail?.organization?.juristic?.subfix}
              </span>
            </Typography>
            <div>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary !mt-2"
              >
                ● บทบาทภายในองค์กร:
                <span className="text-text-primary pl-2">
                  {invitationDetail?.role?.displayName}
                </span>
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary"
              >
                ● รหัสคำขอ:
                <span className="text-text-primary pl-2">
                  {invitationDetail?.refCode}
                </span>
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-text-quinary"
              >
                ● ผู้เชิญ:
                <span className="text-text-primary pl-2">
                  {invitationDetail?.invitedByUser.firstNameTh}{' '}
                  {invitationDetail?.invitedByUser.lastNameTh}
                </span>
              </Typography>
            </div>
          </div>
          <Typography
            variant="paragraph-small"
            className="!text-text-quarternary !font-medium !my-3"
          >
            {isExpired
              ? 'สถานะคำเชิญ:'
              : isAccepted
                ? 'สถานะคำเชิญ:'
                : 'วันหมดอายุคำเชิญ:'}
            <span
              className={
                'pl-2 ' +
                (isExpired
                  ? '!text-error'
                  : isAccepted
                    ? '!text-success'
                    : '!text-primary')
              }
            >
              {isExpired
                ? 'หมดอายุแล้ว'
                : isAccepted
                  ? 'ยอมรับคำเชิญแล้ว'
                  : dayjs(invitationDetail?.expiresAt).format(
                      'DD/MM/YYYY HH:mm'
                    )}
            </span>
          </Typography>
          {isExpired ? (
            <div className="w-full flex flex-col justify-center items-center">
              <Divider className="w-full !my-2" />
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary !font-medium !mb-4"
              >
                ติดต่อเจ้าหน้าที่
              </Typography>
              <div className="flex flex-col md:flex-row gap-1 md:gap-8 justify-start items-start md:justify-center md:items-center w-full">
                <div className="flex flex-row items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full w-10 h-10 flex justify-center items-center">
                    <i className="ri-phone-line text-white text-xl"></i>
                  </div>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary !font-medium"
                  >
                    02-626-2999
                  </Typography>
                </div>
                <div className="flex flex-row  items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full w-10 h-10 flex justify-center items-center">
                    <i className="ri-mail-line text-white text-xl"></i>
                  </div>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary !font-medium"
                  >
                    support@allkons.com
                  </Typography>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full w-10 h-10 flex justify-center items-center">
                    <i className="ri-line-fill text-white text-xl"></i>
                  </div>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary !font-medium"
                  >
                    พูดคุย
                  </Typography>
                </div>
              </div>
            </div>
          ) : isAccepted ? (
            <Button
              className="mt-2"
              fullWidth
              icon={<i className="ri-arrow-right-line" />}
              iconPosition="end"
              onClick={handleLogin}
            >
              เข้าใช้งาน
            </Button>
          ) : (
            <Button
              className="mt-2"
              fullWidth
              onClick={handleAcceptInvitation}
              loading={isFetching}
            >
              ยอมรับคำเชิญ
            </Button>
          )}
        </div>
      </div>
    </ResponsivePopup>
  );
};

export default InvitationPopup;
