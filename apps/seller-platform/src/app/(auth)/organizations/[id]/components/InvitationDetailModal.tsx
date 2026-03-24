import { Divider, Grid } from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import dayjs from 'dayjs';
import ResponsivePopup from '@/components/Popup';
import { useMutation } from '@tanstack/react-query';
import { useNotification } from '@/hooks/notification.hook';
import { formatFullName } from '@/utils/format';
import { UserOrganizationInviteStatusApprove, UserOrganizationInviteStatus } from '@/constants/enum/invitation.enum';
import { IInvitation } from '@/interfaces/invitation/invitation.response.interface';
import { InvitationRespondPayload } from '@/interfaces/invitation/invitation.request.interface';
import { respondInvitation } from '@/api/invitation.api';
import SectionIcon from '@/components/Section/SectionIcon';

interface InvitationDetailModalProps {
  open: boolean;
  onClose: () => void;
  invitationDetail: IInvitation | null;
  refetch: () => void;
  isInviterHashed?: boolean;
}

const InvitationDetailModal: React.FC<InvitationDetailModalProps> = ({
  open,
  onClose,
  invitationDetail,
  refetch,
  isInviterHashed = false,
}) => {
  const { notification } = useNotification();
  const { md } = Grid.useBreakpoint();
  const isMobile = !md;

  const { mutate: acceptInvitation, isPending } = useMutation({
    mutationFn: (payload: InvitationRespondPayload) => {
      return respondInvitation(payload);
    },
    onSuccess: () => {
      refetch();
      notification.success({
        message: 'ยอมรับคำเชิญสำเร็จ',
        description: 'ระบบเพิ่มเข้าองค์กรแล้ว',
      });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
      });
    },
  });
  
  if (!invitationDetail) return null;
  
  const isExpired = invitationDetail.status === 'EXPIRED';
  const isAccepted = invitationDetail.status === 'ACCEPTED';

  const handleAcceptInvitation = () => {
    onClose();
    acceptInvitation({
      refCode: invitationDetail?.refCode,
      respond: UserOrganizationInviteStatusApprove.APPROVE,
      response: UserOrganizationInviteStatus.ACCEPTED,
    });
  };

  return (
    <>
      {/* Main Invitation Modal */}
      <ResponsivePopup
        visible={open}
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
            iconClass={isExpired ? 'ri-mail-forbid-fill' : 'ri-mail-open-fill'}
            type={isExpired ? 'error' : 'success'}
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
                    {formatFullName(
                      invitationDetail?.invitedByUser?.firstNameTh || '',
                      invitationDetail?.invitedByUser?.lastNameTh || '',
                      undefined,
                      isInviterHashed
                    )}
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
                  <div className="flex flex-row items-center gap-3">
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
                {isMobile && (
                  <Button
                    className="mt-4"
                    fullWidth
                    variant="outlined"
                    color="neutral"
                    onClick={onClose}
                  >
                    ปิด
                  </Button>
                )}
              </div>
            ) : isAccepted ? (
              <>
                <div className='my-9'></div>
                {isMobile && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="neutral"
                    onClick={onClose}
                  >
                    ปิด
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  className="mt-2"
                  fullWidth
                  onClick={handleAcceptInvitation}
                  loading={isPending}
                >
                  ยอมรับคำเชิญ
                </Button>
                {isMobile && (
                  <Button
                    className="mt-2"
                    fullWidth
                    variant="outlined"
                    color="neutral"
                    onClick={onClose}
                  >
                    ปิด
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </ResponsivePopup>

      {/* Progress Modal */}
      <ResponsivePopup
        visible={isPending}
        onClose={() => {}}
        modalTitle={<></>}
        modalProps={{
          width: 600,
          centered: true,
          destroyOnHidden: true,
          closable: false,
          maskClosable: false,
        }}
        drawerProps={{
          height: 'auto',
          destroyOnClose: true,
          closable: false,
        }}
      >
        <div className="flex flex-col justify-center items-center py-8">
          <SectionIcon loading={true} />
          <Typography variant="h3" className="!text-text-primary !font-bold mt-4 mb-2">
            กำลังเพิ่มเข้าองค์กร
          </Typography>
          <Typography variant="paragraph-medium" className="!text-text-secondary text-center mb-6">
            โปรดรอสักครู่ ระบบกำลังเพิ่มเข้าองค์กร
          </Typography>
        </div>
      </ResponsivePopup>
    </>
  );
};

export default InvitationDetailModal;
