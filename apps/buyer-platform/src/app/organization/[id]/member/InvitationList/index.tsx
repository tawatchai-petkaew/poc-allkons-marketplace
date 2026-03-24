import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Grid, Popover } from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { Label } from '@/components/Label';
import CustomTable from '@/components/Table/CustomTable';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { formatFullName } from '@/utils/format';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDetailRefCode,
  getInvitations,
  respondInvitation,
} from '@/common/api/customer-service/invitation.api';
import { useNotification } from '@/hooks/notification.hook';
import dayjs from 'dayjs';
import { getUserDataFromToken } from '@/utils/cookies';
import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from '@/common/enum/invitation.enum';
import InvitationDetailModal from './InvitationDetailModal';
import { IinvitationDetail, IApprovalInvitation } from '@/common/interfaces/Invitation.interface';
import ResponsivePopup from '@/components/Popup';
import SectionIcon from '@/components/Sections/SectionIcon';

enum InvitationSubTabType {
  PENDING = 'pending',
  HISTORY = 'history',
}

const InvitationList = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const [activeSubTab, setActiveSubTab] = useState<InvitationSubTabType>(
    InvitationSubTabType.PENDING
  );
  const { notification } = useNotification();
  const queryClient = useQueryClient();
  const { organizeUuid: organizationUuid } = getUserDataFromToken() as { organizeUuid: string };
  const [hashedNameRowIds, setHashedNameRowIds] = useState<Set<number>>(
    new Set()
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [invitationDetail, setInvitationDetail] = useState<IinvitationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [currentDetailRecordId, setCurrentDetailRecordId] = useState<number | null>(null);

  const [paramValue, setParamValue] = useState({ page: 1, pageLimit: 10 });

  // Reset pagination when changing sub-tab
  const handleSubTabChange = (subTab: InvitationSubTabType) => {
    setActiveSubTab(subTab);
    setParamValue({ page: 1, pageLimit: 10 });
    
    // Refetch data when switching tabs to get latest data
    if (subTab === InvitationSubTabType.PENDING) {
      refetchPending();
    } else {
      refetchHistory();
    }
  };

  // Fetch pending invitations (SENT status)
  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['invitations', organizationUuid, 'pending', paramValue],
    queryFn: () =>
      getInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.SENT],
      }),
    enabled: activeSubTab === InvitationSubTabType.PENDING,
  });

  // Fetch history (all statuses)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['invitations', organizationUuid, 'history', paramValue],
    queryFn: () =>
      getInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.EXPIRED, UserOrganizationInviteStatus.ACCEPTED],
      }),
    enabled: activeSubTab === InvitationSubTabType.HISTORY,
  });

  const pendingInvitations: IApprovalInvitation[] = pendingData?.data?.items || [];
  const pendingTotalCount = pendingData?.data?.meta?.totalItems || 0;

  const historyInvitations: IApprovalInvitation[] = historyData?.data?.items || [];
  const historyTotalCount = historyData?.data?.meta?.totalItems || 0;

  const invitations = activeSubTab === InvitationSubTabType.PENDING ? pendingInvitations : historyInvitations;
  const totalCount = activeSubTab === InvitationSubTabType.PENDING ? pendingTotalCount : historyTotalCount;
  const isLoading = activeSubTab === InvitationSubTabType.PENDING ? isLoadingPending : isLoadingHistory;

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

  const { mutate: handleRespondInvitation, isPending: isResponding } = useMutation({
    mutationFn: ({
      refCode,
      respond,
      response,
    }: {
      refCode: string;
      respond: UserOrganizationInviteStatusApprove;
      response: UserOrganizationInviteStatus;
    }) => respondInvitation({ refCode, respond, response }),
    onSuccess: () => {
      notification.success({
        message: 'ยอมรับคำเชิญสำเร็จ',
        description: 'ระบบเพิ่มเข้าองค์กรแล้ว',
        icon: <i className="ri-information-line text-success" />
      });
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ['organizationMembers'] });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
        icon: <i className="ri-information-line text-error" />,
      });
    },
  });

  const handleAccept = useCallback((record: IApprovalInvitation) => {
    handleRespondInvitation({
      refCode: record.refCode!,
      respond: UserOrganizationInviteStatusApprove.APPROVE,
      response: UserOrganizationInviteStatus.ACCEPTED,
    });
  }, [handleRespondInvitation]);

  const handleViewDetail = useCallback(async (refCode: string, recordId: number) => {
    try {
      setIsLoadingDetail(true);
      setCurrentDetailRecordId(recordId);
      const response = await getDetailRefCode(refCode);
      setInvitationDetail(response.data);
      setShowDetailModal(true);
    } catch (error) {
        console.error('Error fetching invitation detail:', error);
        notification.error({
            message: 'เกิดข้อผิดพลาด',
            description: 'กรุณาลองใหม่ภายหลัง',
            icon: <i className="ri-information-line text-error" />,
        });
    } finally {
      setIsLoadingDetail(false);
    }
  }, [notification]);

  const renderStatusLabel = (status: string) => {
    switch (status) {
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
      default:
        return null;
    }
  };

  const renderInviterColumn = useCallback((record: IApprovalInvitation) => {
    if (!record.invitedByUser) return <Typography variant="paragraph-small" className="!text-text-secondary">-</Typography>;
    
    const isHashed = !hashedNameRowIds.has(record.id);
    const displayName = formatFullName(
      record.invitedByUser.firstNameTh,
      record.invitedByUser.lastNameTh,
      undefined,
      isHashed
    );
    const fullName = formatFullName(
      record.invitedByUser.firstNameTh,
      record.invitedByUser.lastNameTh,
      undefined,
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
  }, [hashedNameRowIds, isMobile, isTablet]);

  const renderOrganizationColumn = useCallback((organizeName: string) => (
    <Typography variant="paragraph-small" className="!text-text-secondary">
      {organizeName || '-'}
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

  const renderPendingActionsColumn = useCallback((_: unknown, record: IApprovalInvitation) => (
    <div className={`flex ${isMobile || isTablet ? 'flex-col' : 'justify-end'} gap-2`}>
      <Button
        size="small"
        variant="solid"
        color="primary"
        className="!min-w-[76px] !pr-3 !py-4"
        icon={<i className="ri-check-fill"></i>}
        onClick={() => handleAccept(record)}
      >
        ยอมรับ
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="neutral"
        className="!min-w-[76px] !px-3 !py-4"
        icon={<i className="ri-file-list-3-line"></i>}
        onClick={() => handleViewDetail(record.refCode!, record.id)}
        loading={isLoadingDetail}
      >
        รายละเอียด
      </Button>
    </div>
  ), [handleAccept, handleViewDetail, isLoadingDetail, isMobile, isTablet]);

  const renderHistoryActionsColumn = useCallback((_: unknown, record: IApprovalInvitation) => (
    <div className="flex justify-end gap-2">
      <Button
        size="small"
        variant="outlined"
        color="neutral"
        className="!min-w-[76px] !px-3 !py-4"
        icon={<i className="ri-file-list-3-line"></i>}
        onClick={() => handleViewDetail(record.refCode!, record.id)}
        loading={isLoadingDetail}
      >
        รายละเอียด
      </Button>
    </div>
  ), [handleViewDetail, isLoadingDetail]);

  const pendingColumns = useMemo(
    () => [
      {
        title: 'ผู้เชิญ',
        key: 'invitedByUser',
        width: isMobile || isTablet ? 200 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderInviterColumn(record),
      },
      {
        title: 'องค์กร',
        key: 'organizeName',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IApprovalInvitation) => renderOrganizationColumn(record.organization?.organizeName ?? '-'),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'roleDisplayName',
        width: isMobile || isTablet ? 150 : '15%',
        render: (_: unknown, record: IApprovalInvitation) => renderRoleColumn(record.role?.displayName ?? '-'),
      },
      {
        title: 'วันที่ส่งคำเชิญ',
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
        width: isMobile || isTablet ? 'auto' : '30%',
        fixed: 'right' as const,
        render: renderPendingActionsColumn,
      },
    ],
    [isMobile, isTablet, renderInviterColumn, renderOrganizationColumn, renderRoleColumn, renderDateColumn, renderStatusColumn, renderPendingActionsColumn]
  );

  const historyColumns = useMemo(
    () => [
      {
        title: 'ผู้เชิญ',
        key: 'invitedByUser',
        width: isMobile || isTablet ? 200 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderInviterColumn(record),
      },
      {
        title: 'องค์กร',
        key: 'organizeName',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IApprovalInvitation) => renderOrganizationColumn(record.organization?.organizeName ?? '-'),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'roleDisplayName',
        width: isMobile || isTablet ? 150 : '20%',
        render: (_: unknown, record: IApprovalInvitation) => renderRoleColumn(record.role?.displayName ?? '-'),
      },
      {
        title: 'วันที่ส่งคำเชิญ',
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
        render: renderHistoryActionsColumn,
      },
    ],
    [isMobile, isTablet, renderInviterColumn, renderOrganizationColumn, renderRoleColumn, renderDateColumn, renderStatusColumn, renderHistoryActionsColumn]
  );

  const PendingInvitationsContent = () => (
    <CustomTable<IApprovalInvitation>
      columns={pendingColumns}
      dataSource={invitations}
      loading={isLoading}
      rowKey="id"
      size={isMobile ? 'small' : 'middle'}
      scroll={{
        x: isMobile || isTablet ? 'max-content' : '100%',
        scrollToFirstRowOnChange: true,
      }}
      emptyText="ไม่มีคำเชิญที่รอตอบรับ"
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

  const HistoryInvitationsContent = () => (
    <CustomTable<IApprovalInvitation>
      columns={historyColumns}
      dataSource={invitations}
      loading={isLoading}
      rowKey="id"
      size={isMobile ? 'small' : 'middle'}
      scroll={{
        x: isMobile || isTablet ? 'max-content' : '100%',
        scrollToFirstRowOnChange: true,
      }}
      emptyText="ไม่มีประวัติคำเชิญ"
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
    if (activeSubTab === InvitationSubTabType.PENDING) {
      return <PendingInvitationsContent />;
    }
    return <HistoryInvitationsContent />;
  };

  return (
    <>
      {/* Detail Modal */}
      <InvitationDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        invitationDetail={invitationDetail}
        refetch={refetchPending}
        isInviterHashed={currentDetailRecordId !== null ? !hashedNameRowIds.has(currentDetailRecordId) : true}
      />

      {/* Progress Modal for Accept Invitation */}
      <ResponsivePopup
        visible={isResponding}
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
          <Typography variant="paragraph-medium" className="!text-text-quarternary text-center mb-6">
            โปรดรอสักครู่ ระบบกำลังเพิ่มเข้าองค์กร
          </Typography>
        </div>
      </ResponsivePopup>

      <div className="py-6 border flex flex-col min-h-auto md:min-h-[620px] gap-4 border-border-primary rounded-xl">
      <div className="flex flex-col flex-1 gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
            <div className="flex items-center gap-2">
              <Typography
                variant="paragraph-medium"
                className="!text-text-primary !font-bold"
              >
                รายการคำเชิญ
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
                  activeSubTab === InvitationSubTabType.PENDING
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => handleSubTabChange(InvitationSubTabType.PENDING)}
              >
                รอตอบรับ
              </button>
              <button
                type="button"
                className={`flex-1 lg:flex-none px-4 py-2 text-sm font-normal rounded-md transition-colors ${
                  activeSubTab === InvitationSubTabType.HISTORY
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => handleSubTabChange(InvitationSubTabType.HISTORY)}
              >
                ประวัติคำเชิญ
              </button>
            </div>
          </div>
          {renderContent()}
      </div>
    </div>
    </>
  );
};

export default InvitationList;
