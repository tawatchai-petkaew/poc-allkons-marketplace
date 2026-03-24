import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Grid, Popover } from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { Label } from '@/components/Label';
import CustomTable from '@/components/Table/CustomTable';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExitRequests,
  updateExitRequestStatus,
} from '@/common/api/customer-service/organization.api';
import { useNotification } from '@/hooks/notification.hook';
import usePopup from '@/hooks/usePopup';
import { formatFullName } from '@/utils/format';
import dayjs from 'dayjs';
import { getUserDataFromToken } from '@/utils/cookies';
import { IExitRequest } from '@/common/interfaces/Organization.interface';
import { IinvitationDetail } from '@/common/interfaces/Invitation.interface';
import { ExitRequestStatus } from '@/common/enum/organization.enum';

enum RequestSubTabType {
  PENDING = 'pending',
  HISTORY = 'history',
}

const RequestToLeaveOrg = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const [activeSubTab, setActiveSubTab] = useState<RequestSubTabType>(
    RequestSubTabType.PENDING
  );
  const { notification } = useNotification();
  const { showPopup, PopupComponent } = usePopup();
  const { organizeUuid: organizationUuid } = getUserDataFromToken() as any;
  const queryClient = useQueryClient();
  const [hashedNameRowIds, setHashedNameRowIds] = useState<Set<number>>(
    new Set()
  );

  const [paramValue, setParamValue] = useState({ page: 1, pageLimit: 10 });

  // Fetch pending requests
  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['exitRequests', organizationUuid, 'pending', paramValue],
    queryFn: () => 
      getExitRequests(organizationUuid, {
        ...paramValue,
        status: ExitRequestStatus.PENDING,
      }),
    enabled: activeSubTab === RequestSubTabType.PENDING,
  });

  // Fetch history requests (APPROVED + REJECTED)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['exitRequests', organizationUuid, 'history', paramValue],
    queryFn: () =>
      getExitRequests(organizationUuid, {
        ...paramValue,
        status: `${ExitRequestStatus.APPROVED},${ExitRequestStatus.REJECTED}`,
      }),
    enabled: activeSubTab === RequestSubTabType.HISTORY,
  });

  const exitRequests: IExitRequest[] = 
    activeSubTab === RequestSubTabType.PENDING 
      ? (pendingData?.data?.items || [])
      : (historyData?.data?.items || []);
  
  const totalCount = 
    activeSubTab === RequestSubTabType.PENDING
      ? (pendingData?.data?.meta?.totalItems || 0)
      : (historyData?.data?.meta?.totalItems || 0);

  const isLoading = 
    activeSubTab === RequestSubTabType.PENDING 
      ? isLoadingPending 
      : isLoadingHistory;

  // Reset pagination when changing sub-tab
  const handleSubTabChange = (subTab: RequestSubTabType) => {
    setActiveSubTab(subTab);
    setParamValue({ page: 1, pageLimit: 10 });
    // Refetch data when switching tabs to get latest data
    if (subTab === RequestSubTabType.PENDING) {
      refetchPending();
    } else {
      refetchHistory();
    }
  };

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
  const { mutate: handleUpdateStatus } = useMutation({
    mutationFn: ({
      exitRequestId,
      status,
    }: {
      exitRequestId: number;
      status: 'APPROVED' | 'REJECTED';
    }) => updateExitRequestStatus(organizationUuid, exitRequestId, status),
    onSuccess: (_, variables) => {
      notification.success({
        message: variables.status === 'APPROVED' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ',
        description:
          variables.status === 'APPROVED'
            ? 'สมาชิกถูกลบออกจากองค์กรแล้ว'
            : 'สมาชิกยังคงอยู่ในองค์กร',
        icon: <i className="ri-information-line text-success" />,
      });
      refetchPending();
      refetchHistory();
      queryClient.invalidateQueries({ queryKey: ['organizationMembers'] });
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
        icon: <i className="ri-information-line text-error" />,
      });
    },
  });

  const pendingRequests = exitRequests.map((item) => ({
    id: item.id,
    firstName: item.user.firstNameTh,
    lastName: item.user.lastNameTh,
    role: item.role.displayName,
    requestDate: dayjs(item.createdAt).add(543, 'year').format('DD MMMM YYYY'),
    status: item.leaveStatus.toLowerCase(),
    rawData: item,
  }));

  const historyRequests = exitRequests.map((item) => ({
    id: item.id,
    firstName: item.user.firstNameTh,
    lastName: item.user.lastNameTh,
    role: item.role.displayName,
    requestDate: dayjs(item.createdAt).add(543, 'year').format('DD MMMM YYYY'),
    status: item.leaveStatus.toLowerCase(),
    rawData: item,
  }));

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

  const renderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
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
      case 'approved':
        return (
          <Label
            text="อนุมัติแล้ว"
            color="success"
            rounding="pill"
            size="small"
            variant="ghost"
            prefix={
              <i className="ri-user-follow-line text-icon-brand-dark text-xs"></i>
            }
          />
        );
      case 'rejected':
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
      default:
        return null;
    }
  };

  const renderNameColumn = (record: IinvitationDetail) => {
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
  };

  const renderRoleColumn = (role: string) => (
    <div className="w-fit">
      <Label
        text={role}
        color="neutral"
        variant="outlined"
        rounding="pill"
        size="small"
      />
    </div>
  );

  const renderStatusColumn = (status: string) => (
    <div className="w-fit">{renderStatusLabel(status)}</div>
  );

  const handleApprove = useCallback((record: any) => {
    const displayName = getDisplayName(
      record.firstName,
      record.lastName,
      record.middleName,
      record.id,
      true
    );
    
    showPopup('approve', {
      title: 'อนุมัติการออกจากองค์กร',
      description: `สมาชิก "${displayName}" จะถูกลบออกจากองค์กร`,
      onOk: () => {
        handleUpdateStatus({
          exitRequestId: record.rawData.id,
          status: 'APPROVED',
        });
      },
      okText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus, getDisplayName]);

  const handleReject = useCallback((record: any) => { 
    showPopup('reject', {
      title: 'ยืนยันการปฏิเสธ',
      onOk: () => {
        handleUpdateStatus({
          exitRequestId: record.rawData.id,
          status: 'REJECTED',
        });
      },
      okText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      showConfirm: true,
      showCancel: true,
    });
  }, [showPopup, handleUpdateStatus]);

  const renderActionsColumn = (_: unknown, record: any) => (
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
  );

  const pendingColumns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        dataIndex: 'name',
        key: 'name',
        width: isMobile || isTablet ? 200 : '20%',
        render: (_: unknown, record: any) => renderNameColumn(record),
      },
      {
        title: 'บทบาท',
        dataIndex: 'role',
        key: 'role',
        width: isMobile || isTablet ? 150 : '20%',
        render: (role: string) => renderRoleColumn(role),
      },
      {
        title: 'วันที่',
        dataIndex: 'requestDate',
        key: 'requestDate',
        width: isMobile || isTablet ? 150 : '15%',
        render: (date: string) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {date}
          </Typography>
        ),
      },
      {
        title: 'สถานะคำขอ',
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
    [isMobile, isTablet, hashedNameRowIds]
  );

  const historyColumns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        dataIndex: 'name',
        key: 'name',
        width: isMobile || isTablet ? 200 : '25%',
        render: (_: unknown, record: any) => renderNameColumn(record),
      },
      {
        title: 'บทบาท',
        dataIndex: 'role',
        key: 'role',
        width: isMobile || isTablet ? 200 : '25%',
        render: (role: string) => renderRoleColumn(role),
      },
      {
        title: 'วันที่',
        dataIndex: 'requestDate',
        key: 'requestDate',
        width: isMobile || isTablet ? 200 : '25%',
        render: (date: string) => (
          <Typography variant="paragraph-small" className="!text-text-secondary">
            {date}
          </Typography>
        ),
      },
      {
        title: 'สถานะคำขอ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 'auto' : '25%',
        render: (status: string) => renderStatusColumn(status),
      },
    ],
    [isMobile, isTablet, hashedNameRowIds]
  );

  const PendingRequestsContent = () => (
    <CustomTable
      columns={pendingColumns}
      dataSource={pendingRequests}
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

  const HistoryRequestsContent = () => (
    <CustomTable
      columns={historyColumns}
      dataSource={historyRequests}
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
    if (activeSubTab === RequestSubTabType.PENDING) {
      return <PendingRequestsContent />;
    }
    return <HistoryRequestsContent />;
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
                activeSubTab === RequestSubTabType.PENDING
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => handleSubTabChange(RequestSubTabType.PENDING)}
            >
              รอตอบรับ
            </button>
            <button
              type="button"
              className={`flex-1 lg:flex-none px-4 py-2 text-sm font-normal rounded-md transition-colors ${
                activeSubTab === RequestSubTabType.HISTORY
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => handleSubTabChange(RequestSubTabType.HISTORY)}
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

export default RequestToLeaveOrg;
