import { IUser } from '@/common/interfaces/user.interface';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { Avatar, Divider } from 'antd';
import { Label } from '@/components/Label';
import { FC, useState } from 'react';
import { MobileCategoryMenu } from '../MobileCategoryMenu';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/store/global.store';
import { getFirstChar, resolvedRoleDisplayName } from '@/utils/format';
import { OrganizationType } from '@/common/interfaces/organization/user-with-org.response.interface';
import { KycOrganizationStatus } from '@/common/enum/organization.enum';

type MobileUserAuthMenuProps = {
  user: IUser | null;
  onLogout?: () => void;
  onLogin?: () => void;
  onClose: () => void;
};

const MobileUserAuthMenu: FC<MobileUserAuthMenuProps> = ({
  user,
  onLogout,
  onLogin,
  onClose,
}) => {
  const router = useRouter();
  const { currentOrganization, organizations } = useGlobalStore();
  const [currentView, setCurrentView] = useState<'main' | 'category'>('main');

  const organizationTypeLabel = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.JURISTIC:
        return 'นิติบุคคล';
      case OrganizationType.REGISTERED_INDIVIDUAL:
        return 'บุคคลธรรมดาจดทะเบียน';
      default:
        return 'บุคคลธรรมดา';
    }
  };

  const getKycBadgeConfig = (status?: string | KycOrganizationStatus) => {
    switch (status) {
      case KycOrganizationStatus.APPROVE:
      case 'APPROVED': // Handle both enum and API string
        return {
          text: 'ยืนยันตัวตนแล้ว',
          color: 'success' as const,
          prefix: (
            <i className="ri-verified-badge-fill text-[10px] text-success" />
          ),
        };
      case KycOrganizationStatus.WAIT_FOR_APPROVE:
      case 'WAIT_FOR_APPROVE':
      case 'PENDING':
        return {
          text: 'รอการอนุมัติ',
          color: 'warning' as const,
          prefix: (
            <i className="ri-information-line text-[10px] text-warning" />
          ),
        };
      case KycOrganizationStatus.REJECT:
      case 'REJECTED':
        return {
          text: 'ถูกปฎิเสธ',
          color: 'error' as const,
          prefix: <i className="ri-close-line text-[10px] text-error" />,
        };
      case KycOrganizationStatus.REQUEST_MORE:
      case 'REQUEST_MORE':
        return {
          text: 'ขอข้อมูลเพิ่มเติม',
          color: 'info' as const,
          prefix: <i className="ri-draft-line text-[10px] text-info" />,
        };
      default:
        return {
          text: 'ยังไม่ยืนยันตัวตน',
          color: 'error' as const,
          prefix: <i className="ri-information-line text-[10px] text-error" />,
        };
    }
  };

  const menuItems = [
    {
      icon: 'ri-list-check-2',
      label: 'หมวดหมู่ทั้งหมด',
      onClick: () => setCurrentView('category'),
      hasArrow: true,
      isPublic: true,
    },
    {
      icon: 'ri-shopping-bag-3-line',
      label: 'สินค้าทั้งหมด',
      onClick: () => {
        router.push('/search');
        onClose();
      },
      isPublic: true,
    },
    {
      icon: 'ri-truck-line',
      label: 'คำสั่งซื้อของฉัน',
      onClick: () => {
        router.push('/my-order');
        onClose();
      },
    },
    {
      icon: 'ri-newspaper-line',
      label: 'ใบเสนอราคา',
      onClick: () => {
        router.push('/quotation');
        onClose();
      },
    },
    {
      icon: 'ri-heart-line',
      label: 'ร้านค้าประจำและสินค้าที่ชอบ',
      onClick: () => {
        router.push('/favorites');
        onClose();
      },
      isPublic: true,
    },
    {
      icon: 'ri-map-pin-line',
      label: 'ที่อยู่จัดส่ง',
      onClick: () => {
        router.push('/address');
        onClose();
      },
    },
    {
      icon: 'ri-bank-card-line',
      label: 'การชำระเงิน',
      onClick: () => {
        router.push('/payment');
        onClose();
      },
    },
    {
      icon: 'ri-user-settings-line',
      label: 'ข้อมูลโปรไฟล์',
      onClick: () => {
        router.push('/user');
        onClose();
      },
      badgeConfig: getKycBadgeConfig(user?.kycStatus),
    },
  ];

  const settingItems = [
    {
      icon: 'ri-settings-4-line',
      label: 'ตั้งค่า',
      onClick: () => {
        router.push('/settings');
        onClose();
      },
    },
    {
      icon: 'ri-store-3-line',
      label: user ? 'ร้านค้าของฉัน' : 'ขายของกับเรา',
      onClick: () => {
        window.open('https://seller.allkons.com', '_blank');
      },
      chip: 'Seller Center',
      external: true,
      isPublic: true,
    },
    {
      icon: 'ri-file-text-line',
      label: 'นโยบาย',
      onClick: () => {
        router.push('/policy');
        onClose();
      },
      isPublic: true,
    },
    {
      icon: 'ri-headphone-line',
      label: 'ติดต่อเรา',
      onClick: () => {
        router.push('/contact');
        onClose();
      },
      isPublic: true,
    },
  ];

  const renderMainMenu = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* User Info */}
        {user && (
          <div className="px-4 py-4 flex items-center gap-3">
            <Avatar
              size={56}
              src={user?.imageUpload}
              className="!bg-primary-subtle"
            >
              {!user?.imageUpload && (
                <Typography
                  variant="paragraph-big-medium"
                  className="!text-primary-dark"
                >
                  {getFirstChar(user?.name || '')}
                </Typography>
              )}
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <Typography
                variant="paragraph-big-medium"
                className="!text-text-primary truncate"
              >
                {user?.name || '-'}
              </Typography>
              <Typography
                variant="paragraph-small"
                className="!text-text-quarternary truncate"
              >
                {user?.email || '-'}
              </Typography>
            </div>
          </div>
        )}

        {user && <Divider className="!m-0" />}

        {/* Organization Switcher */}
        {user && (
          <div className="px-4 py-4 bg-white">
            <div className="flex items-center gap-1 mb-3">
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary"
              >
                คุณกำลังซื้อของในนาม
              </Typography>
              <Typography variant="paragraph-small" className="!text-primary">
                {organizationTypeLabel(
                  currentOrganization?.organization?.organizationType ||
                    OrganizationType.PERSONAL
                )}
              </Typography>
            </div>

            <div
              className="flex items-center gap-3 py-3 rounded-xl cursor-pointer hover:bg-background-secondary transition-colors"
              onClick={() => {
                // Logic for switching org could go here, for now just show current
              }}
            >
              <div className="relative">
                <Avatar
                  size={44}
                  src={currentOrganization?.organization?.imageUpload}
                  className="!bg-primary-subtle !rounded-full"
                >
                  {!currentOrganization?.organization?.imageUpload && (
                    <Typography
                      variant="paragraph-middle-medium"
                      className="!text-primary-dark"
                    >
                      {getFirstChar(
                        currentOrganization?.organization?.organizeName || ''
                      )}
                    </Typography>
                  )}
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-info rounded-full border border-white flex items-center justify-center">
                  <i className="ri-building-line text-[10px] text-white"></i>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <Typography
                  variant="paragraph-small-medium"
                  className="!text-text-primary !truncate block"
                >
                  {currentOrganization?.organization?.organizeName ||
                    user?.name}
                </Typography>
                <div className="flex items-center gap-2 mt-0.5">
                  <Typography
                    variant="paragraph-extra-small"
                    className="!text-text-quarternary"
                  >
                    {resolvedRoleDisplayName(
                      currentOrganization?.role?.displayName || 'เจ้าของ'
                    )}
                  </Typography>
                  <Label
                    variant="ghost"
                    rounding="pill"
                    size="small"
                    {...getKycBadgeConfig(
                      currentOrganization?.organization?.kycStatus
                    )}
                  />
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-text-quarternary text-xl"></i>
            </div>
          </div>
        )}

        {user && <Divider className="!m-0" />}

        {/* Main Menu Items */}
        <div className="flex flex-col py-2">
          {menuItems
            .filter((item) => (user ? true : item.isPublic))
            .map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-background-secondary active:bg-background-tertiary transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-4">
                  <i className={`${item.icon} text-xl text-text-secondary`}></i>
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    {item.label}
                  </Typography>
                  {item.badgeConfig && (
                    <Label
                      variant="ghost"
                      rounding="pill"
                      size="small"
                      {...item.badgeConfig}
                    />
                  )}
                </div>
                {item.hasArrow && (
                  <i className="ri-arrow-right-s-line text-text-quarternary text-xl"></i>
                )}
              </div>
            ))}
        </div>

        <Divider className="!m-0" />

        {/* Setting Menu Items */}
        <div className="flex flex-col py-2">
          {settingItems
            .filter((item) => (user ? true : item.isPublic))
            .map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-background-secondary active:bg-background-tertiary transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-4">
                  <i className={`${item.icon} text-xl text-text-secondary`}></i>
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    {item.label}
                  </Typography>
                  {item.chip && (
                    <div className="px-2 py-0.5 bg-background-secondary rounded-full border border-border-primary">
                      <Typography
                        variant="paragraph-extra-small"
                        className="!text-text-secondary"
                      >
                        {item.chip}
                      </Typography>
                    </div>
                  )}
                </div>
                {item.external && (
                  <i className="ri-external-link-line text-text-quarternary"></i>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Logout/Login Button - Fixed At Bottom */}
      <div className="px-4 py-6 border-t border-border-primary bg-white">
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            color="neutral"
            className="!h-12 !rounded-xl !border-border-primary hover:!bg-background-secondary"
            onClick={onLogout}
          >
            <div className="flex items-center gap-3">
              <i className="ri-logout-box-r-line text-xl text-text-secondary"></i>
              <Typography
                variant="paragraph-middle-semibold"
                className="!text-text-secondary"
              >
                ออกจากระบบ
              </Typography>
            </div>
          </Button>
        ) : (
          <Button
            fullWidth
            variant="solid"
            className="!h-12 !rounded-xl"
            onClick={onLogin}
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      {currentView === 'category' ? (
        <MobileCategoryMenu
          setCurrentView={() => setCurrentView('main')}
          onClose={onClose}
        />
      ) : (
        renderMainMenu()
      )}
    </div>
  );
};

export default MobileUserAuthMenu;
