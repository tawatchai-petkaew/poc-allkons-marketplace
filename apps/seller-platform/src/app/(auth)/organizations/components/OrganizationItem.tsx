'use client';

import React from 'react';
import { Avatar, Grid, Popover } from 'antd';
import { IAuthOrganization } from '@/interfaces/auth/auth.response.interface';
import BadgeLabel from '@/components/BadgeLabel';
import Typography from '@/components/Typography';
import { getFirstChar, resolvedRoleDisplayName } from '@/utils/format';

const { useBreakpoint } = Grid;

interface OrganizationItemProps {
  item: IAuthOrganization;
  onMenuItemClick?: (org: IAuthOrganization, action: string) => void;
}

const getKycBadgeConfig = (status?: string) => {
  switch (status) {
    case 'APPROVE':
    case 'APPROVED':
      return {
        text: 'ยืนยันตัวตนแล้ว',
        color: 'success' as const,
        prefix: <i className="ri-verified-badge-fill text-[10px] text-success" />,
      };
    case 'WAIT_FOR_APPROVE':
    case 'PENDING':
      return {
        text: 'รอการอนุมัติ',
        color: 'warning' as const,
        prefix: <i className="ri-information-line text-[10px] text-warning" />,
      };
    case 'REJECT':
    case 'REJECTED':
      return {
        text: 'ไม่ได้รับการอนุมัติ',
        color: 'error' as const,
        prefix: <i className="ri-close-line text-[10px] text-error" />,
      };
    case 'REQUEST_MORE':
      return {
        text: 'ขอข้อมูลเพิ่มเติม',
        color: 'info' as const,
        prefix: <i className="ri-draft-line text-[10px] text-info" />,
      };
    default:
      return {
        text: 'ยังไม่ยืนยันองค์กร',
        color: 'error' as const,
        prefix: <i className="ri-information-line text-[10px] text-error" />,
      };
  }
};

const getOrganizationTypeLabel = (type?: string) => {
  switch (type) {
    case 'JURISTIC':
      return 'นิติบุคคล';
    case 'REGISTERED_INDIVIDUAL':
      return 'บุคคลธรรมดาจดทะเบียนพาณิชย์';
    default:
      return 'บุคคลธรรมดา';
  }
};

export const OrganizationItem: React.FC<OrganizationItemProps> = ({ item, onMenuItemClick }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleMenuItemClick = (action: string) => {
    if (!item.organization?.id) return;
    onMenuItemClick?.(item, action);
  };

  const ActionButton = (
    <Popover
      content={
        <div className="flex flex-col min-w-[120px]">
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick('info')}
          >
            <i className="ri-settings-4-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              ข้อมูลองค์กร
            </Typography>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick('members')}
          >
            <i className="ri-group-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              สมาชิก
            </Typography>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick('roles')}
          >
            <i className="ri-shield-user-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              บทบาทและสิทธิ์
            </Typography>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick('stores')}
          >
            <i className="ri-store-2-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              ข้อมูลร้านค้า
            </Typography>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors group/item"
            onClick={() => handleMenuItemClick('phones')}
          >
            <i className="ri-phone-line text-lg text-neutral-400 group-hover/item:text-primary transition-colors" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary group-hover/item:!text-primary transition-colors"
            >
              เบอร์โทรในนามองค์กร
            </Typography>
          </div>
        </div>
      }
      trigger="click"
      placement="bottomRight"
    >
      <div className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors border">
        <i className="ri-more-2-line text-xl text-icon-secondary" />
      </div>
    </Popover>
  );

  const AvatarComponent = (
    <Avatar
      shape="square"
      size={56}
      src={item.organization?.logo}
      className="!rounded-xl !bg-neutral-50 !border !border-neutral-100 shrink-0 !text-primary-dark !text-2xl !font-bold"
    >
      {getFirstChar(item.organization?.organizeName || '')}
    </Avatar>
  );

  const kycBadgeConfig = getKycBadgeConfig(item.organization?.kycStatus);

  const OrgInfo = (
    <div className="flex flex-col overflow-hidden">
      <Typography
        variant="paragraph-big-medium"
        className="!leading-normal truncate"
      >
        {item.organization?.organizeName || '-'}
      </Typography>
      <Typography
        variant="paragraph-small-regular"
        className="!text-text-quarternary !leading-normal mt-1"
      >
        {getOrganizationTypeLabel(item.organization?.organizationType)}
      </Typography>
      {isMobile && (
        <div className="mt-1 flex">
          <BadgeLabel
            variant="ghost"
            rounding="pill"
            {...kycBadgeConfig}
          />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 border border-neutral-100">
        <div className="flex gap-3 items-start">
          {AvatarComponent}
          <div className="flex-1 min-w-0">{OrgInfo}</div>
          {ActionButton}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center pr-[48px]">
            <div className="flex items-center gap-2">
              <i className="ri-user-line text-icon-tertiary text-lg" />
              <Typography
                variant="paragraph-middle-medium"
                className="!text-text-secondary"
              >
                {resolvedRoleDisplayName(item.role?.displayName || '-')}
              </Typography>
            </div>

            <div className="flex items-center gap-2">
              {item.isOwner ? (
                <>
                  <i className="ri-vip-crown-fill text-warning text-lg" />
                  <Typography
                    variant="paragraph-middle-regular"
                    className="!text-warning"
                  >
                    ผู้สร้างองค์กร
                  </Typography>
                </>
              ) : (
                <>
                  <i className="ri-user-shared-line text-neutral-60 text-lg" />
                  <Typography
                    variant="paragraph-middle-regular"
                    className="!text-neutral-60"
                  >
                    ผู้เข้าร่วมองค์กร
                  </Typography>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <i className="ri-group-line text-icon-tertiary text-lg" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-secondary"
            >
              {item.organization?.totalUsers || 0} ผู้ใช้
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr_48px] gap-4 items-center border border-neutral-100 hover:border-primary/50 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.03)] transition-all cursor-pointer group">
      {/* Profile */}
      <div className="flex items-center gap-4 min-w-0">
        {AvatarComponent}
        {OrgInfo}
      </div>

      {/* Role */}
      <Typography
        variant="paragraph-middle-medium"
        className="!text-text-secondary"
      >
        {resolvedRoleDisplayName(item.role?.displayName || '-')}
      </Typography>

      {/* Membership */}
      <div className="flex items-center gap-2">
        {item.isOwner ? (
          <>
            <i className="ri-vip-crown-fill text-warning text-lg" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-warning"
            >
              ผู้สร้างองค์กร
            </Typography>
          </>
        ) : (
          <>
            <i className="ri-user-shared-line text-neutral-60 text-lg" />
            <Typography
              variant="paragraph-middle-regular"
              className="!text-neutral-60"
            >
              ผู้เข้าร่วมองค์กร
            </Typography>
          </>
        )}
      </div>

      {/* Total Users */}
      <div className="flex items-center justify-center gap-2">
        <i className="ri-group-line text-text-tertiary text-lg bg-background-secondary rounded-md px-1" />
        <Typography
          variant="paragraph-middle-regular"
          className="!text-text-tertiary"
        >
          {item.organization?.totalUsers || 0}
        </Typography>
      </div>

      {/* KYC Status */}
      <div className="flex justify-center">
        <BadgeLabel
          variant="ghost"
          rounding="pill"
          {...kycBadgeConfig}
        />
      </div>

      {/* Action */}
      <div className="flex justify-end">{ActionButton}</div>
    </div>
  );
};
