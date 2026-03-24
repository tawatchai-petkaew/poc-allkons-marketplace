import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Grid, Popover } from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { Label } from '@/components/Label';
import CustomTable from '@/components/Table/CustomTable';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { formatFullName } from '@/utils/format';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/hooks/notification.hook';
import usePopup from '@/hooks/usePopup';
import dayjs from 'dayjs';
import { getUserDataFromToken } from '@/utils/cookies';
import { approveInvitation, getApprovalInvitations } from '@/common/api/customer-service/invitation.api';
import { UserOrganizationInviteStatusApprove, UserOrganizationInviteStatus } from '@/common/enum/invitation.enum';
import { IApprovalInvitation } from '@/common/interfaces/Invitation.interface';

enum ApprovalSubTabType {
  WAIT_FOR_APPROVE = 'waitForApprove',
  HISTORY = 'history',
}

const ApprovalList = () => {
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
  const { organizeUuid: organizationUuid } = getUserDataFromToken() as { organizeUuid: string };

  const [paramValue, setParamValue] = useState({ page: 1, pageLimit: 10 });

  // Fetch wait for approve data
  const { data: waitForApproveData, isLoading: isLoadingWaitForApprove, refetch: refetchWaitForApprove } = useQuery({
    queryKey: ['approvalInvitations', organizationUuid, 'waitForApprove', paramValue],
    queryFn: () =>
      getApprovalInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.WAIT_FOR_APPROVE],
      }),
    enabled: activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE,
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
    enabled: activeSubTab === ApprovalSubTabType.HISTORY,
  });

  const waitForApproveUsers: IApprovalInvitation[] = waitForApproveData?.data?.items || [];
  const waitForApproveTotalCount = waitForApproveData?.data?.meta?.totalItems || 0;

  const historyUsers: IApprovalInvitation[] = historyData?.data?.items || [];
  const historyTotalCount = historyData?.data?.meta?.totalItems || 0;

  // Reset pagination when changing sub-tab
  const handleSubTabChange = (subTab: ApprovalSubTabType) => {
    setActiveSubTab(subTab);
    setParamValue({ page: 1, pageLimit: 10 });
    // Refetch data when switching tabs to get latest data
    if (subTab === ApprovalSubTabType.WAIT_FOR_APPROVE) {
      refetchWaitForApprove();
    } else {
      refetchHistory();
    }
  };

  const approvals = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? waitForApproveUsers : historyUsers;
  const totalCount = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? waitForApproveTotalCount : historyTotalCount;
  const isLoading = activeSubTab === ApprovalSubTabType.WAIT_FOR_APPROVE ? isLoadingWaitForApprove : isLoadingHistory;

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

  const { mutate: handleUpdateStatus } = useMutation({
    mutationFn: ({
      refCode,
      respond,
    }: {
      refCode: string;
      respond: UserOrganizationInviteStatusApprove;
    }) => approveInvitation({ refCode, respond }),
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

  const handleApprove = useCallback((record: IApprovalInvitation) => {
    const displayName = formatFullName(
      record.firstName,
      record.lastName,
      record.middleName || undefined,
      true
    );
    showPopup('approve', {
      title: 'อนุมัติให้เข้าร่วมองค์กรอื่น',
      description: `สมาชิก "${displayName}" จะเข้าร่วมใน "${record.organization?.organizeName || '-'}"`,
      onOk: () => {
        handleUpdateStatus({ refCode: record.refCode!, respond: UserOrganizationInviteStatusApprove.APPROVE });
      },
      okText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus]);

  const handleReject = useCallback((record: IApprovalInvitation) => {
    showPopup('reject', {
      title: 'ยืนยันปฏิเสธ',
      onOk: () => {
        handleUpdateStatus({ refCode: record.refCode!, respond: UserOrganizationInviteStatusApprove.REJECTED });
      },
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus]);

  const getDisplayName = useCallback((
    firstName: string,
    lastName: string,
    middleName: string | null,
    recordId: number,
    forceHashed?: boolean
  ) => {
    const isHashed = forceHashed ?? !hashedNameRowIds.has(recordId);
    return formatFullName(
      firstName,
      lastName,
      middleName || undefined,
      isHashed
    );
  }, [hashedNameRowIds]);

  const renderStatusLabel = (status: string) => {
    switch (status) {
      case 'WAIT_FOR_APPROVE':
        return (
          <Label
            text="รออนุมัติ"
            color="warning"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-user-search-line text-warning-p20 text-xs"></i>
            }
          />
        );
      case 'ACCEPTED':
        return (
          <Label
            text="เข้าร่วมแล้ว"
            color="success"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-user-follow-line text-icon-brand-dark text-xs"></i>
            }
          />
        );
      case 'REJECTED':
        return (
          <Label
            text="ปฏิเสธ"
            color="neutral"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-close-line text-text-secondary text-xs"></i>
            }
          />
        );
      case 'EXPIRED':
        return (
          <Label
            text="หมดอายุ"
            color="error"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-history-line text-error text-xs"></i>
            }
          />
        );
      case 'SENT':
        return (
          <Label
            text="ส่งคำเชิญแล้ว"
            color="warning"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-user-search-line text-warning-p20 text-xs"></i>
            }
          />
        );
      default:
        return (
          <Label
            text={status}
            color="neutral"
            rounding="pill"
            size="small"
            variant="ghost"
          />
        );
    }
  };

  const renderNameColumn = useCallback((record: IApprovalInvitation) => {
    const isHashed = !hashedNameRowIds.has(record.id);
    const displayName = getDisplayName(
      record.firstName,
      record.lastName,
      record.middleName || null,
      record.id
    );
    const fullName = formatFullName(
      record.firstName,
      record.lastName,
      record.middleName || undefined,
      false
    );
    
    return (
      <Popover
        content={
          <Typography variant="paragraph-small">
            {fullName}
          </Typography>
        }
        open={!isHashed}
        placement="top"
      >
        <div className="flex items-center gap-2">
          <Typography 
            variant="paragraph-small" 
            className="!text-text-secondary min-w-0"
            ellipsis={!isHashed}
            style={{
              overflow: 'hidden',
              textOverflow: isHashed ? 'clip' : 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: isMobile || isTablet ? '150px' : 'none'
            }}
          >
            {displayName}
          </Typography>
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
          />
        </div>
      </Popover>
    );
  }, [hashedNameRowIds, getDisplayName, isMobile, isTablet]);

  const renderOrganizationColumn = useCallback((record: IApprovalInvitation) => (
    <Typography variant="paragraph-small" className="!text-text-secondary">
      {record.organization?.organizeName || '-'}
    </Typography>
  ), []);

  const renderRoleColumn = useCallback((roleDisplayName: string) => (
    <div className="w-fit">
      <Label
        text={roleDisplayName}
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
    <div className="w-fit">{renderStatusLabel(status)}</div>
  ), []);

  const renderActionsColumn = useCallback((_: unknown, record: IApprovalInvitation) => (
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
        width: isMobile || isTablet ? 200 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderNameColumn(record),
      },
      {
        title: 'องค์กรที่เชิญ',
        key: 'organization',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IApprovalInvitation) =>
          renderOrganizationColumn(record),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'role',
        width: isMobile || isTablet ? 150 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderRoleColumn(record.role?.displayName || '-'),
      },
      {
        title: 'วันที่ส่งคำขอ',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: isMobile || isTablet ? 150 : '15%',
        render: (date: string) => renderDateColumn(date),
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 120 : '20%',
        render: (status: string) => renderStatusColumn(status),
      },
      {
        title: '',
        key: 'actions',
        width: isMobile || isTablet ? 'auto' : '25%',
        fixed: 'right' as const,
        render: renderActionsColumn,
      },
    ],
    [isMobile, isTablet, renderNameColumn, renderOrganizationColumn, renderRoleColumn, renderDateColumn, renderStatusColumn, renderActionsColumn]
  );

  const historyColumns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        dataIndex: 'name',
        key: 'name',
        width: isMobile || isTablet ? 200 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderNameColumn(record),
      },
      {
        title: 'องค์กรที่เชิญ',
        key: 'organization',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IApprovalInvitation) =>
          renderOrganizationColumn(record),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'role',
        width: isMobile || isTablet ? 150 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderRoleColumn(record.role?.displayName || '-'),
      },
      {
        title: 'วันที่ส่งคำขอ',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: isMobile || isTablet ? 150 : '15%',
        render: (date: string) => renderDateColumn(date),
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 120 : '20%',
        render: (status: string) => renderStatusColumn(status),
      },
      {
        title: '',
        key: 'actions',
        width: isMobile || isTablet ? 'auto' : '25%',
        fixed: 'right' as const,
        render: () => <></>,
      },
    ],
    [isMobile, isTablet, renderNameColumn, renderOrganizationColumn, renderRoleColumn, renderDateColumn, renderStatusColumn]
  );

  const WaitForApproveContent = () => (
    <CustomTable<IApprovalInvitation>
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
        onChange: (page, pageSize) => {
          setParamValue({ page, pageLimit: pageSize || paramValue.pageLimit });
        },
      }}
      tableLayout="fixed"
    />
  );

  const HistoryContent = () => (
    <CustomTable<IApprovalInvitation>
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
        onChange: (page, pageSize) => {
          setParamValue({ page, pageLimit: pageSize || paramValue.pageLimit });
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
    <>
      <PopupComponent />
      <div className="py-6 border flex flex-col min-h-auto md:min-h-[620px] gap-4 border-border-primary rounded-xl">
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
    </>
  );
};

export default ApprovalList;
