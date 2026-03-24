import Button from '@/components/Button';
import Typography from '@/components/Typography';
import usePopup from '@/hooks/usePopup';
import { useTab } from '@/hooks/useTab';
import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import InviteMemberPopup from '../components/InviteMemberPopup';
import MemberInfo from './MemberInfo';
import InvitationList from './InvitationList';
import RequestToLeaveOrg from './RequestToLeaveOrg';
import ApprovalList from './ApprovalList';

enum SubTabType {
  MEMBER = 'member',
  INVITATION = 'invitation',
  REQUEST_TO_LEAVE_ORG = 'requestToLeaveOrg',
  APPROVAL = 'approval',
}

// Query keys mapping for each tab
const TAB_QUERY_KEYS: Record<SubTabType, string[][]> = {
  [SubTabType.MEMBER]: [['organizationMembers']],
  [SubTabType.INVITATION]: [['invitations']],
  [SubTabType.REQUEST_TO_LEAVE_ORG]: [['exitRequests']],
  [SubTabType.APPROVAL]: [['approvalInvitations']],
};

const MemberManagement = () => {
  const { PopupComponent, showPopup } = usePopup();
  const queryClient = useQueryClient();

  const { activeTab, handleTabChange } = useTab<SubTabType>(
    'subTab',
    SubTabType.MEMBER,
    Object.values(SubTabType)
  );

  const params = useParams();
  const { id: organizationId } = params as { id: string };

  const tabItems: TabsProps['items'] = [
    {
      key: SubTabType.MEMBER,
      label: 'สมาชิก',
      children: <MemberInfo />,
    },
    {
      key: SubTabType.INVITATION,
      label: 'คำเชิญ',
      children: <InvitationList />,
    },
    {
      key: SubTabType.REQUEST_TO_LEAVE_ORG,
      label: 'คำขอออกจากองค์กร',
      children: <RequestToLeaveOrg />,
    },
    {
      key: SubTabType.APPROVAL,
      label: 'การอนุมัติ',
      children: <ApprovalList />,
    },
  ];

  const [showInvitePopup, setShowInvitePopup] = useState<boolean>(false);

  return (
    <div className="w-full bg-white p-0 md:p-4 rounded-xl">
      <InviteMemberPopup
        isVisible={showInvitePopup}
        onClose={() => setShowInvitePopup(false)}
        showPopup={showPopup}
      />
      <PopupComponent />

      <div className="mt-3 flex flex-col md:flex-row gap-2 justify-between items-start md:items-end">
        <div>
          <Typography variant="h5" className="!text-text-secondary">
            จัดการสมาชิก
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            แก้ไขข้อมูล และบทบาทของสมาชิก
          </Typography>
        </div>
        <Button
          icon={<i className="ri-user-add-line"></i>}
          onClick={() => setShowInvitePopup(true)}
        >
          เพิ่มสมาชิก
        </Button>
      </div>
      <div className="mt-6">
        <Tabs
          defaultActiveKey={activeTab}
          items={tabItems}
          size="large"
          className="member-tabs"
          onChange={(activeKey) => {
            handleTabChange(activeKey as SubTabType);            
            // Refetch data when switching main tabs to get latest data
            const queryKeys = TAB_QUERY_KEYS[activeKey as SubTabType];
            queryKeys?.forEach((queryKey) => {
              queryClient.refetchQueries({ queryKey });
            });
          }}
        />
      </div>
    </div>
  );
};

export default MemberManagement;
