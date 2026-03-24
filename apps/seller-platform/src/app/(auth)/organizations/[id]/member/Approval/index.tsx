'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Grid } from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import BadgeLabel from '@/components/BadgeLabel';
import MemberStatusBadge from '../../components/MemberStatusBadge';
import CustomTable from '@/components/Table';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { formatFullName } from '@/utils/format';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/hooks/notification.hook';
import usePopup from '@/hooks/usePopup';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/user.store';
import { approveInvitation, getApprovalInvitations } from '@/api/invitation.api';
import { UserOrganizationInviteStatusApprove } from '@/constants/enum/invitation.enum';
import { UserOrganizationInviteStatus } from '@/constants/enum/organization.enum';
import { IApprovalInvitationsListResponse, IInvitation } from '@/interfaces/invitation/invitation.response.interface';

enum ApprovalSubTabType {
  WAIT_FOR_APPROVE = 'waitForApprove',
  HISTORY = 'history',
}

const Approval = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const [activeSubTab, setActiveSubTab] = useState<ApprovalSubTabType>(
    ApprovalSubTabType.WAIT_FOR_APPROVE
  );
  const [hashedNameRowIds, setHashedNameRowIds] = useState<Set<number>>(
    new Set()
  );
  const { notification } = useNotification();
  const { showPopup, PopupComponent } = usePopup();
  const queryClient = useQueryClient();
  const { organization } = useUserStore();
  const organizationUuid = organization?.uuid || '';

  const [paramValue, setParamValue] = useState({ page: 1, pageLimit: 10 });

  const pressedNameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleGlobalRelease = () => {
      if (pressedNameIdRef.current !== null) {
        setHashedNameRowIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pressedNameIdRef.current!);
          return newSet;
        });
        pressedNameIdRef.current = null;
      }
    };
    document.addEventListener('mouseup', handleGlobalRelease);
    document.addEventListener('touchend', handleGlobalRelease);
    return () => {
      document.removeEventListener('mouseup', handleGlobalRelease);
      document.removeEventListener('touchend', handleGlobalRelease);
    };
  }, []);

  // Fetch wait for approve data
  const { data: waitForApproveData, isLoading: isLoadingWaitForApprove, refetch: refetchWaitForApprove } = useQuery({
    queryKey: ['approvalInvitations', organizationUuid, 'waitForApprove', paramValue],
    queryFn: () =>
      getApprovalInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.WAIT_FOR_APPROVE],
      }),
    enabled: activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE && !!organizationUuid,
  });

  // Fetch history data
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['approvalInvitations', organizationUuid, 'history', paramValue],
    queryFn: () =>
      getApprovalInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [
          UserOrganizationInviteStatus.ACCEPTED,
          UserOrganizationInviteStatus.REJECTED,
          UserOrganizationInviteStatus.EXPIRED,
          UserOrganizationInviteStatus.SENT,
        ],
      }),
    enabled: activeSubTab === ApprovalSubTabType.HISTORY && !!organizationUuid,
  });

  const waitForApproveRaw = waitForApproveData?.data;
  const waitForApproveUsers: IInvitation[] = Array.isArray(waitForApproveRaw)
    ? waitForApproveRaw
    : (waitForApproveRaw as IApprovalInvitationsListResponse | null)?.items || [];
  const waitForApproveTotalCount = Array.isArray(waitForApproveRaw)
    ? waitForApproveRaw.length
    : (waitForApproveRaw as IApprovalInvitationsListResponse | null)?.meta?.totalItems || 0;

  const historyRaw = historyData?.data;
  const historyUsers: IInvitation[] = Array.isArray(historyRaw)
    ? historyRaw
    : (historyRaw as IApprovalInvitationsListResponse | null)?.items || [];
  const historyTotalCount = Array.isArray(historyRaw)
    ? historyRaw.length
    : (historyRaw as IApprovalInvitationsListResponse | null)?.meta?.totalItems || 0;

  const approvals = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? waitForApproveUsers : historyUsers;
  const totalCount = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? waitForApproveTotalCount : historyTotalCount;
  const isLoading = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? isLoadingWaitForApprove : isLoadingHistory;

  // Reset pagination when changing sub-tab
  const handleSubTabChange = useCallback((subTab: ApprovalSubTabType) => {
    setActiveSubTab(subTab);
    setParamValue({ page: 1, pageLimit: 10 });
    if (subTab === ApprovalSubTabType.WAIT_FOR_APPROVE) {
      refetchWaitForApprove();
    } else {
      refetchHistory();
    }
  }, [refetchWaitForApprove, refetchHistory]);

  const { mutate: handleUpdateStatus } = useMutation({
    mutationFn: ({
      refCode,
      respond,
    }: {
      refCode: string;
      respond: UserOrganizationInviteStatusApprove;
    }) => approveInvitation({ refCode, respond }, organizationUuid),
    onSuccess: (_, variables) => {
      notification.success({
        message: variables.respond === UserOrganizationInviteStatusApprove.APPROVE ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ',
        description:
          variables.respond === UserOrganizationInviteStatusApprove.APPROVE
            ? 'อนุมัติคำขอเข้าร่วมองค์กรอื่นเรียบร้อย'
            : 'ปฏิเสธคำขอเข้าร่วมองค์กรอื่นเรียบร้อย',
        icon: <i className="ri-information-line text-success" />
      });
      refetchWaitForApprove();
      refetchHistory();
      queryClient.invalidateQueries({ queryKey: ['approvalInvitations'] });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'กรุณาลองใหม่ภายหลัง',
        icon: <i className="ri-information-line text-error" />,
      });
    },
  });

  const getDisplayName = useCallback((
    firstName: string,
    lastName: string,
    recordId: number,
    forceHashed?: boolean
  ) => {
    const isHashed = forceHashed ?? !hashedNameRowIds.has(recordId);
    return formatFullName(
      firstName,
      lastName,
      undefined,
      isHashed
    );
  }, [hashedNameRowIds]);

  const handleApprove = useCallback((record: IInvitation) => {
    const displayName = getDisplayName(
      record.firstName,
      record.lastName,
      record.id,
      true
    );
    showPopup('approve', {
      title: 'อนุมัติให้เข้าร่วมองค์กรอื่น',
      description: `สมาชิก "${displayName}" จะเข้าร่วมในองค์กรอื่น`,
      onOk: () => {
        handleUpdateStatus({ refCode: record.refCode, respond: UserOrganizationInviteStatusApprove.APPROVE });
      },
      okText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus, getDisplayName]);

  const handleReject = useCallback((record: IInvitation) => {
    showPopup('reject', {
      title: 'ยืนยันปฏิเสธ',
      onOk: () => {
        handleUpdateStatus({ refCode: record.refCode, respond: UserOrganizationInviteStatusApprove.REJECTED });
      },
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus]);

  const renderNameColumn = useCallback((record: IInvitation) => {
    const isHashed = !hashedNameRowIds.has(record.id);
    const displayName = getDisplayName(
      record.firstName,
      record.lastName,
      record.id
    );
    
    return (
      <div className="flex items-center gap-2">
        <Typography 
          variant="paragraph-small" 
          className="!text-text-secondary min-w-0"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: isMobile || isTablet ? '150px' : 'none'
          }}
        >
          {displayName}
        </Typography>
        <div
          onMouseDown={() => {
            pressedNameIdRef.current = record.id;
            setHashedNameRowIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(record.id);
              return newSet;
            });
          }}
          onTouchStart={() => {
            pressedNameIdRef.current = record.id;
            setHashedNameRowIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(record.id);
              return newSet;
            });
          }}
        >
          <Button
            size="small"
            variant="ghost"
            color="neutral"
            className="!p-1 !min-w-0 flex-shrink-0 !w-6 !h-6"
            icon={
              isHashed ? (
                <i className="ri-eye-off-line text-base pointer-events-none"></i>
              ) : (
                <i className="ri-eye-line text-base pointer-events-none"></i>
              )
            }
          />
        </div>
      </div>
    );
  }, [hashedNameRowIds, getDisplayName, isMobile, isTablet]);

  const renderRoleColumn = useCallback((roleDisplayName: string) => (
    <div className="w-fit">
      <BadgeLabel
        text={roleDisplayName || '-'}
        color="neutral"
        variant="outlined"
        rounding="pill"
        size="small"
      />
    </div>
  ), []);

  const renderDateColumn = useCallback((date: string) => (
    <Typography variant="paragraph-small" className="!text-text-secondary">
      {dayjs(date).add(543, 'year').format('DD MMMM YYYY')}
    </Typography>
  ), []);

  const renderStatusColumn = useCallback((status: string) => (
    <div className="w-fit"><MemberStatusBadge status={status} /></div>
  ), []);

  const renderActionsColumn = useCallback((_: unknown, record: IInvitation) => (
    <div className="flex justify-end gap-2">
      <Button
        size="small"
        variant="solid"
        color="primary"
        className="!min-w-[76px] !pr-3 !py-4"
        icon={<i className="ri-check-fill"></i>}
        onClick={() => handleApprove(record)}
      >
        อนุมัติ
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="neutral"
        className="!min-w-[76px] !pr-3 !py-4"
        icon={<i className="ri-close-fill"></i>}
        onClick={() => handleReject(record)}
      >
        ปฏิเสธ
      </Button>
    </div>
  ), [handleApprove, handleReject]);

  const waitForApproveColumns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        dataIndex: 'name',
        key: 'name',
        width: isMobile || isTablet ? 200 : '25%',
        render: (_: unknown, record: IInvitation) => renderNameColumn(record),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'role',
        width: isMobile || isTablet ? 150 : '20%',
        render: (_: unknown, record: IInvitation) => renderRoleColumn(record.role?.displayName || '-'),
      },
      {
        title: 'วันที่ส่งคำขอ',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: isMobile || isTablet ? 150 : '20%',
        render: (date: string) => renderDateColumn(date),
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 120 : '15%',
        render: (status: UserOrganizationInviteStatus) => renderStatusColumn(status),
      },
      {
        title: '',
        key: 'actions',
        width: isMobile || isTablet ? 'auto' : '20%',
        fixed: 'right' as const,
        render: renderActionsColumn,
      },
    ],
    [isMobile, isTablet, renderNameColumn, renderRoleColumn, renderDateColumn, renderStatusColumn, renderActionsColumn]
  );

  const historyColumns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        dataIndex: 'name',
        key: 'name',
        width: isMobile || isTablet ? 200 : '25%',
        render: (_: unknown, record: IInvitation) => renderNameColumn(record),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'role',
        width: isMobile || isTablet ? 150 : '25%',
        render: (_: unknown, record: IInvitation) => renderRoleColumn(record.role?.displayName || '-'),
      },
      {
        title: 'วันที่ส่งคำขอ',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: isMobile || isTablet ? 150 : '25%',
        render: (date: string) => renderDateColumn(date),
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 'auto' : '25%',
        render: (status: UserOrganizationInviteStatus) => renderStatusColumn(status),
      },
    ],
    [isMobile, isTablet, renderNameColumn, renderRoleColumn, renderDateColumn, renderStatusColumn]
  );

  const WaitForApproveContent = () => (
    <CustomTable<IInvitation>
      columns={waitForApproveColumns}
      dataSource={approvals}
      loading={isLoading}
      rowKey="id"
      size={isMobile ? 'small' : 'middle'}
      scroll={{
        x: isMobile || isTablet ? 'max-content' : '100%',
        scrollToFirstRowOnChange: true,
      }}
      emptyText="ไม่มีคำขอที่รออนุมัติ"
      emptyStateHeight={400}
      pagination={{
        current: paramValue.page,
        pageSize: paramValue.pageLimit,
        total: totalCount,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        onChange: (page, pageSize) => {
          setParamValue({ page, pageLimit: pageSize || paramValue.pageLimit });
        },
        locale: {
          items_per_page: " / หน้า",
          prev_page: "ย้อนกลับ",
          next_page: "หน้าถัดไป",
        },
      }}
      tableLayout="fixed"
    />
  );

  const HistoryContent = () => (
    <CustomTable<IInvitation>
      columns={historyColumns}
      dataSource={approvals}
      loading={isLoading}
      rowKey="id"
      size={isMobile ? 'small' : 'middle'}
      scroll={{
        x: isMobile || isTablet ? 'max-content' : '100%',
        scrollToFirstRowOnChange: true,
      }}
      emptyText="ไม่มีประวัติคำขอ"
      emptyStateHeight={400}
      pagination={{
        current: paramValue.page,
        pageSize: paramValue.pageLimit,
        total: totalCount,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        onChange: (page, pageSize) => {
          setParamValue({ page, pageLimit: pageSize || paramValue.pageLimit });
        },
        locale: {
          items_per_page: " / หน้า",
          prev_page: "ย้อนกลับ",
          next_page: "หน้าถัดไป",
        },
      }}
      tableLayout="fixed"
    />
  );

  const renderContent = () => {
    if (activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE) {
      return <WaitForApproveContent />;
    }
    return <HistoryContent />;
  };

  return (
    <div className="py-6 border flex flex-col min-h-auto md:min-h-[620px] gap-4 border-border-primary rounded-xl">
      <PopupComponent />
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary !font-bold"
            >
              รายการคำขออนุมัติ
            </Typography>
            <Typography
              variant="paragraph-small"
              className="!text-text-tertiary bg-background-secondary rounded-full px-3 py-1"
            >
              ทั้งหมด {totalCount} รายการ
            </Typography>
          </div>
          <div className="flex items-center gap-2 bg-background-secondary rounded-lg p-1 w-full lg:w-auto">
            <button
              type="button"
              className={`flex-1 lg:flex-none px-4 py-2 text-sm font-normal rounded-md transition-colors ${
                activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => handleSubTabChange(ApprovalSubTabType.WAIT_FOR_APPROVE)}
            >
              รออนุมัติ
            </button>
            <button
              type="button"
              className={`flex-1 lg:flex-none px-4 py-2 text-sm font-normal rounded-md transition-colors ${
                activeSubTab === ApprovalSubTabType.HISTORY
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => handleSubTabChange(ApprovalSubTabType.HISTORY)}
            >
              ประวัติคำขอ
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Approval;