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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDetailRefCode,
  getInvitations,
  respondInvitation,
} from '@/api/invitation.api';
import { useNotification } from '@/hooks/notification.hook';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/user.store';
import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from '@/constants/enum/invitation.enum';
import { IApprovalInvitationsListResponse, IInvitation } from '@/interfaces/invitation/invitation.response.interface';
import InvitationDetailModal from '../../components/InvitationDetailModal';

enum InvitationSubTabType {
  PENDING = 'pending',
  HISTORY = 'history',
}

const Invitation = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const [activeSubTab, setActiveSubTab] = useState<InvitationSubTabType>(
    InvitationSubTabType.PENDING
  );
  const { notification } = useNotification();
  const queryClient = useQueryClient();
  const { organization } = useUserStore();
  const organizationUuid = organization?.uuid || '';
  const [hashedNameRowIds, setHashedNameRowIds] = useState<Set<number>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [invitationDetail, setInvitationDetail] = useState<IInvitation | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [currentDetailRecordId, setCurrentDetailRecordId] = useState<number | null>(null);
  const [isInviterHashedForDetail, setIsInviterHashedForDetail] = useState(true);

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

  // Fetch pending invitations (SENT status)
  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['invitations', organizationUuid, 'pending', paramValue],
    queryFn: () =>
      getInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.SENT],
      }),
    enabled: activeSubTab === InvitationSubTabType.PENDING && !!organizationUuid,
  });

  // Fetch history (EXPIRED + ACCEPTED statuses)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['invitations', organizationUuid, 'history', paramValue],
    queryFn: () =>
      getInvitations(organizationUuid, {
        page: paramValue.page,
        limit: paramValue.pageLimit,
        inviteStatus: [UserOrganizationInviteStatus.EXPIRED, UserOrganizationInviteStatus.ACCEPTED],
      }),
    enabled: activeSubTab === InvitationSubTabType.HISTORY && !!organizationUuid,
  });

   const { mutate: handleRespondInvitation } = useMutation({
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

  const pendingRawData = pendingData?.data;
  const pendingInvitations: IInvitation[] = Array.isArray(pendingRawData)
    ? pendingRawData
    : (pendingRawData as IApprovalInvitationsListResponse | null)?.items || [];
  const pendingTotalCount = Array.isArray(pendingRawData)
    ? pendingRawData.length
    : (pendingRawData as IApprovalInvitationsListResponse | null)?.meta?.totalItems || 0;

  const historyRawData = historyData?.data;
  const historyInvitations: IInvitation[] = Array.isArray(historyRawData)
    ? historyRawData
    : (historyRawData as IApprovalInvitationsListResponse | null)?.items || [];
  const historyTotalCount = Array.isArray(historyRawData)
    ? historyRawData.length
    : (historyRawData as IApprovalInvitationsListResponse | null)?.meta?.totalItems || 0;

  const invitations = activeSubTab === InvitationSubTabType.PENDING ? pendingInvitations : historyInvitations;
  const totalCount = activeSubTab === InvitationSubTabType.PENDING ? pendingTotalCount : historyTotalCount;
  const isLoading = activeSubTab === InvitationSubTabType.PENDING ? isLoadingPending : isLoadingHistory;

  // Reset pagination when changing sub-tab
  const handleSubTabChange = useCallback((subTab: InvitationSubTabType) => {
    setActiveSubTab(subTab);
    setParamValue({ page: 1, pageLimit: 10 });
    if (subTab === InvitationSubTabType.PENDING) {
      refetchPending();
    } else {
      refetchHistory();
    }
  }, [refetchPending, refetchHistory]);

  const handleRefetchAfterAccept = useCallback(() => {
    refetchPending();
    queryClient.invalidateQueries({ queryKey: ['organizationMembers'] });
  }, [refetchPending, queryClient]);

  const handleAccept = useCallback((record: IInvitation) => {
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
      setIsInviterHashedForDetail(!hashedNameRowIds.has(recordId));
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
  }, [notification, hashedNameRowIds]);

  const renderInviterColumn = useCallback((record: IInvitation) => {
    if (!record.invitedByUser) {
      return <Typography variant="paragraph-small" className="!text-text-secondary">-</Typography>;
    }

    const isHashed = !hashedNameRowIds.has(record.id);
    const displayName = formatFullName(
      record.invitedByUser.firstNameTh,
      record.invitedByUser.lastNameTh,
      undefined,
      isHashed
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
            maxWidth: isMobile || isTablet ? '150px' : 'none',
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
                <i className="ri-eye-off-line text-base pointer-events-none" />
              ) : (
                <i className="ri-eye-line text-base pointer-events-none" />
              )
            }
          />
        </div>
      </div>
    );
  }, [hashedNameRowIds, isMobile, isTablet]);

  const renderOrganizationColumn = useCallback((organizeName: string) => (
    <Typography variant="paragraph-small" className="!text-text-secondary">
      {organizeName || '-'}
    </Typography>
  ), []);

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

  const renderPendingActionsColumn = useCallback((_: unknown, record: IInvitation) => (
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
        className="!min-w-[96px] !px-3 !py-4"
        icon={<i className="ri-file-list-3-line" />}
        onClick={() => handleViewDetail(record.refCode, record.id)}
        loading={isLoadingDetail && currentDetailRecordId === record.id}
      >
        รายละเอียด
      </Button>
    </div>
  ), [handleViewDetail, isLoadingDetail, currentDetailRecordId, isMobile, isTablet]);

  const renderHistoryActionsColumn = useCallback((_: unknown, record: IInvitation) => (
    <div className="flex justify-end">
      <Button
        size="small"
        variant="outlined"
        color="neutral"
        className="!min-w-[76px] !px-3 !py-4"
        icon={<i className="ri-file-list-3-line" />}
        onClick={() => handleViewDetail(record.refCode, record.id)}
        loading={isLoadingDetail && currentDetailRecordId === record.id}
      >
        รายละเอียด
      </Button>
    </div>
  ), [handleViewDetail, isLoadingDetail, currentDetailRecordId]);

  const pendingColumns = useMemo(
    () => [
      {
        title: 'ผู้เชิญ',
        key: 'invitedByUser',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IInvitation) => renderInviterColumn(record),
      },
      {
        title: 'องค์กร',
        key: 'organizeName',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IInvitation) => renderOrganizationColumn(record.organization?.organizeName ?? '-'),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'roleDisplayName',
        width: isMobile || isTablet ? 150 : '15%',
        render: (_: unknown, record: IInvitation) => renderRoleColumn(record.role?.displayName ?? '-'),
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
        width: isMobile || isTablet ? 120 : '15%',
        render: (status: string) => renderStatusColumn(status),
      },
      {
        title: '',
        key: 'actions',
        width: isMobile || isTablet ? 'auto' : '25%',
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
        render: (_: unknown, record: IInvitation) => renderInviterColumn(record),
      },
      {
        title: 'องค์กร',
        key: 'organizeName',
        width: isMobile || isTablet ? 200 : '15%',
        render: (_: unknown, record: IInvitation) => renderOrganizationColumn(record.organization?.organizeName ?? '-'),
      },
      {
        title: 'บทบาทที่เชิญ',
        key: 'roleDisplayName',
        width: isMobile || isTablet ? 150 : '15%',
        render: (_: unknown, record: IInvitation) => renderRoleColumn(record.role?.displayName ?? '-'),
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
        width: isMobile || isTablet ? 120 : '15%',
        render: (status: string) => renderStatusColumn(status),
      },
      {
        title: '',
        key: 'actions',
        width: isMobile || isTablet ? 'auto' : '20%',
        fixed: 'right' as const,
        render: renderHistoryActionsColumn,
      },
    ],
    [isMobile, isTablet, renderInviterColumn, renderOrganizationColumn, renderRoleColumn, renderDateColumn, renderStatusColumn, renderHistoryActionsColumn]
  );

  const paginationConfig = useMemo(() => ({
    current: paramValue.page,
    pageSize: paramValue.pageLimit,
    total: totalCount,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (page: number, pageSize: number) => {
      setParamValue({ page, pageLimit: pageSize || paramValue.pageLimit });
    },
    locale: {
      items_per_page: ' / หน้า',
      prev_page: 'ย้อนกลับ',
      next_page: 'หน้าถัดไป',
    },
  }), [paramValue.page, paramValue.pageLimit, totalCount]);

  return (
    <>
      <InvitationDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setInvitationDetail(null);
          setCurrentDetailRecordId(null);
        }}
        invitationDetail={invitationDetail}
        refetch={handleRefetchAfterAccept}
        isInviterHashed={isInviterHashedForDetail}
      />

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
          <CustomTable<IInvitation>
            columns={activeSubTab === InvitationSubTabType.PENDING ? pendingColumns : historyColumns}
            dataSource={invitations}
            loading={isLoading}
            rowKey="id"
            size={isMobile ? 'small' : 'middle'}
            scroll={{
              x: isMobile || isTablet ? 'max-content' : '100%',
              scrollToFirstRowOnChange: true,
            }}
            emptyText={
              activeSubTab === InvitationSubTabType.PENDING
                ? 'ไม่มีคำเชิญที่รอตอบรับ'
                : 'ไม่มีประวัติคำเชิญ'
            }
            emptyStateHeight={400}
            pagination={paginationConfig}
            tableLayout="fixed"
          />
        </div>
      </div>
    </>
  );
};

export default Invitation;