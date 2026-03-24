'use client';

import { getDraftOrganization } from '@/common/api/customer-service/organization.api';
import { KycOrganizationStatus } from '@/common/enum/organization.enum';
import Button from '@/components/Button';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { useGlobalStore } from '@/store/global.store';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { FC } from 'react';

import usePopup, { PopupParams, PopupType } from '@/hooks/usePopup';
// import { useTab } from '@/hooks/useTab.hook';
import MemberManagement from './member/Member';
import OrganizeManagement from './organize-management/OrganizeManagement';
// import RolePermission from './role-permission/RolePermission';
import WhilelistManagement from './whilelist-management/WhilelistManagement';
import { useTab } from '@/hooks/useTab';
// import useTab from '@/hooks/useTab';

enum TabType {
  ORG_MANAGEMENT = 'orgManagement',
  MEMBER = 'member',
  ROLES_PERMISSIONS = 'rolesPermissions',
  TEL_MANAGEMENT = 'telManagement',
}

const tabList = [
  {
    key: TabType.ORG_MANAGEMENT,
    label: 'ข้อมูลองค์กร',
    icon: <i className="ri-briefcase-2-line"></i>,
  },
  {
    key: TabType.MEMBER,
    label: 'จัดการสมาชิก',
    icon: <i className="ri-team-line"></i>,
  },
  {
    key: TabType.ROLES_PERMISSIONS,
    label: 'บทบาทและการอนุญาต',
    icon: <i className="ri-user-follow-line"></i>,
  },
  {
    key: TabType.TEL_MANAGEMENT,
    label: 'จัดการเบอร์องค์กร',
    icon: <i className="ri-phone-line"></i>,
  },
];

const renderLabelByStatus = (status: KycOrganizationStatus) => {
  switch (status) {
    case KycOrganizationStatus.NONE:
      return (
        <Label
          prefix={<i className="ri-information-line text-error"></i>}
          variant="ghost"
          color="error"
          text="ยังไม่ยืนยันตัวตน"
          rounding="pill"
        />
      );
    case KycOrganizationStatus.WAIT_FOR_APPROVE:
      return (
        <Label
          prefix={<i className="ri-information-line text-warning"></i>}
          variant="ghost"
          color="warning"
          text="รอการอนุมัติ"
          rounding="pill"
        />
      );
    case KycOrganizationStatus.REQUEST_MORE:
      return (
        <Label
          prefix={<i className="ri-draft-line text-[#508EB9]"></i>}
          variant="ghost"
          color="info"
          text="ขอข้อมูลเพิ่มเติม"
          rounding="pill"
        />
      );
    case KycOrganizationStatus.APPROVE:
      return (
        <Label
          prefix={<i className="ri-verified-badge-line text-success"></i>}
          variant="ghost"
          color="success"
          text="ยืนยันตัวตนแล้ว"
          rounding="pill"
        />
      );
    case KycOrganizationStatus.REJECT:
      return (
        <Label
          prefix={<i className="ri-close-line text-error"></i>}
          variant="ghost"
          color="error"
          text="ไม่ได้รับการอนุมัติ"
          rounding="pill"
        />
      );
  }
};

const OrganizationDetailPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const { id: organizeId } = params as { id: string };
  const { profile } = useGlobalStore();
  const { md } = Grid.useBreakpoint();
  const isTablet = !md;
  const { activeTab, handleTabChange } = useTab<TabType>(
    'tab',
    TabType.ORG_MANAGEMENT,
    Object.values(TabType)
  );

  const { data } = useQuery({
    queryKey: ['draft-organization', organizeId],
    queryFn: () => getDraftOrganization(Number(organizeId)),
    enabled: !!organizeId,
  });

  const { PopupComponent, showPopup } = usePopup();

  return (
    <div className="bg-background-secondary mb-[88px] min-h-[calc(100vh_-_88px)]">
      <PopupComponent />
      <div className="container mx-auto p-4 md:px-0 py-6">
        <div className="flex  md:flex-row justify-between gap-4 md:gap-2 items-center rounded-xl ">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row gap-1 md:gap-3 h-full items-start md:items-center">
              <Typography variant="page-title">{profile?.name}</Typography>
              {renderLabelByStatus(
                data?.data?.kycStatus || KycOrganizationStatus.NONE
              )}
            </div>
          </div>
          {activeTab === TabType.ORG_MANAGEMENT && (
            <Button
              variant="solid"
              onClick={() =>
                router.push(`/organization/${organizeId}/verify-kyc`)
              }
              disabled={
                data?.data?.kycStatus === KycOrganizationStatus.WAIT_FOR_APPROVE
              }
            >
              {(data?.data?.kycStatus || KycOrganizationStatus.NONE) ===
              KycOrganizationStatus.APPROVE
                ? 'ขอเปลี่ยนแปลงข้อมูล'
                : 'ยืนยันองค์กร'}
            </Button>
          )}
        </div>
      </div>
      <div className="container bg-white md:bg-background-secondary mx-auto flex flex-col md:flex-row gap-4 md:gap-8 rounded-xl md:rounded-none md:shadow-none p-0">
        {isTablet ? (
          <div className="px-3 flex gap-2 overflow-y-auto border-b border-b-border-primary p-4 sticky top-0 z-20 bg-white">
            {tabList.map((tab) => (
              <div key={tab.key}>
                <Button
                  variant={activeTab === tab.key ? 'solid' : 'outlined'}
                  className="flex-1"
                  onClick={() => handleTabChange(tab.key)}
                  color={activeTab === tab.key ? 'primary' : 'neutral'}
                  bold="400"
                >
                  <div className="flex items-center justify-center">
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className=" flex flex-col gap-2 w-[300px] bg-white h-fit sticky top-4 rounded-xl p-4">
            {tabList.map((tab) => (
              <div
                key={tab.key}
                className={`w-full rounded-xl py-3 px-4 cursor-pointer transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary'
                    : 'bg-white hover:bg-primary/10'
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                <Typography
                  variant="paragraph-small"
                  className={`${
                    activeTab === tab.key ? '!text-white' : '!text-text-primary'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-1">{tab.label}</span>
                </Typography>
              </div>
            ))}
          </div>
        )}

        <div className="w-full md:w-[calc(100%_-_332px)] px-4 md:px-0 ">
          {activeTab === TabType.ORG_MANAGEMENT && <OrganizeManagement />}

          {activeTab === TabType.MEMBER && <MemberManagement />}

          {/* {activeTab === TabType.ROLES_PERMISSIONS && (
            <RolePermission
              organizeId={Number(organizeId)}
              showPopup={(type: PopupType, params: PopupParams) =>
                showPopup(type, params)
              }
            />
          )} */}

          {activeTab === TabType.TEL_MANAGEMENT && <WhilelistManagement />}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;
