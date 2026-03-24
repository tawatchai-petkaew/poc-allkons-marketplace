'use client';

import {
  deleteRole,
  getRoleList,
} from '@/api/role.api';
import { IRole } from '@/interfaces/role.interface';
import { RoleType } from '@/constants/enum/role.enum';
import Button from '@/components/Button';
import Label from '@/components/BadgeLabel';
import Typography from '@/components/Typography';
import { useNotification } from '@/hooks/notification.hook';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Pagination, Popover, Table } from 'antd';
import { useState } from 'react';
import './custom.css';
import RoleTableSkeleton from './RoleTableSkeleton';

interface DataType {
  key: React.Key;
  displayName: React.ReactNode;
  isDefault: React.ReactNode;
  action: React.ReactNode;
}

type RoleAction = 'create' | 'view' | 'edit';

interface RoleTableProps {
  onActionChange?: (action: RoleAction, roleId?: number) => void;
}

export default function RoleTable({ onActionChange }: RoleTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const { notification } = useNotification();
  const { showConfirm, confirmPopup } = useConfirmPopup();
  
  const { mutate: deleteRoleMutate } = useMutation({
    mutationFn: (roleId: number) => deleteRole(roleId),
    onSuccess: () => {
      notification.success({
        message: 'ลบสำเร็จ',
        description: 'ลบบทบาท เรียบร้อย',
      });
      refetch();
    },
    onError: () => {
      notification.error({
        message: 'ลบไม่สำเร็จ',
        description: 'ไม่สามารถลบบทบาทได้ โปรดลองใหม่อีกครั้ง',
      });
    },
  });

  const {
    data: roleListData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['role-list', page, limit],
    queryFn: () =>
      getRoleList({
        page,
        pageLimit: limit,
      }),
    gcTime: 0,
  });

  const columns = [
    {
      title: (
        <Typography
          variant="paragraph-medium"
          className="!text-icon-brand-dark !font-semibold"
        >
          รายการบทบาท
        </Typography>
      ),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 'auto',
    },
    {
      title: '',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 'auto',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      align: 'right' as const,
    },
  ];

  const getPopoverContent = (record: IRole) => {
    const isSystemRole =
      record.name === RoleType.OWNER || record.name === RoleType.SUPER_ADMIN;
    const canEdit = !isSystemRole;
    const canDelete = !isSystemRole && !record.isDefault;
    const canReset = !isSystemRole && record.isDefault;

    const handleViewDetails = () => {
      setOpenPopoverId(null);
      onActionChange?.('view', record.id);
    };

    const handleEdit = () => {
      setOpenPopoverId(null);
      onActionChange?.('edit', record.id);
    };

    const handleReset = () => {
      setOpenPopoverId(null);
      // TODO: Implement reset functionality if needed
    };

    const handleDelete = () => {
      setOpenPopoverId(null);
      showConfirm({
        title: 'ต้องการลบบทบาทนี้หรือไม่',
        detail:
          'หากลบแล้ว สมาชิกที่ถูกกำหนดบทบาทนี้จะไม่สามารถใช้งานสิทธิ์ได้อีก',
        onConfirm: () => deleteRoleMutate(record.id),
        type: 'warn',
      });
    };

    return (
      <div className="w-[160px] py-1 px-2">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="small"
            color="neutral"
            className="!justify-start !text-left"
            icon={<i className="ri-eye-line"></i>}
            onClick={handleViewDetails}
            bold="400"
          >
            ดูรายละเอียด
          </Button>

          {canEdit && (
            <Button
              variant="ghost"
              size="small"
              color="neutral"
              className="!justify-start !text-left"
              icon={<i className="ri-edit-line"></i>}
              onClick={handleEdit}
              bold="400"
            >
              แก้ไขรายการ
            </Button>
          )}

          {canReset && (
            <Button
              variant="ghost"
              size="small"
              color="neutral"
              className="!justify-start !text-left !text-error"
              icon={<i className="ri-restart-line"></i>}
              onClick={handleReset}
              bold="400"
            >
              รีเซ็ตบทบาท
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="small"
              color="error"
              className="!justify-start !text-left !text-error"
              icon={<i className="ri-delete-bin-6-line"></i>}
              onClick={handleDelete}
              bold="400"
            >
              ลบรายการ
            </Button>
          )}
        </div>
      </div>
    );
  };

  const dataSource = roleListData?.data?.roles?.map((role: IRole) => ({
    key: role.id,
    displayName: (
      <Typography variant="paragraph-medium" className="!text-text-secondary">
        {role.displayName}
      </Typography>
    ),
    isDefault: (
      <div className="w-fit">
        <Label
          text={role.isDefault ? 'บทบาทของระบบ' : 'กำหนดเอง'}
          rounding="pill"
          color={role.isDefault ? 'neutral' : 'success'}
        />
      </div>
    ),
    action: (
      <div className="flex justify-end w-full">
        <Popover
          content={getPopoverContent(role)}
          trigger="click"
          placement="bottomRight"
          open={openPopoverId === role?.id}
          onOpenChange={(visible) => {
            setOpenPopoverId(visible ? role?.id : null);
          }}
          styles={{
            body: { padding: 0 },
          }}
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              color="neutral"
              icon={<i className="ri-more-2-fill text-text-secondary"></i>}
            />
          </span>
        </Popover>
      </div>
    ),
  })) || [];

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center">
        <RoleTableSkeleton />
      </div>
    );
  }

  return (
    <>
      {confirmPopup}
      <div className="h-[656px] flex flex-col border border-border-primary rounded-lg overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table<DataType>
            pagination={false}
            columns={columns}
            dataSource={dataSource}
            sticky={{ offsetHeader: 0 }}
          />
        </div>

        <div className="bottom-0 left-0 right-0 bg-white px-2 py-5">
          <Pagination
            className="[&_.ant-pagination-total-text]:!mr-auto"
            current={page}
            pageSize={limit}
            total={(roleListData?.data as { totalItems?: number })?.totalItems || 0}
            onChange={(page, pageSize) => {
              setPage(page);
              setLimit(pageSize || 10);
            }}
            showTotal={(total) => (
              <div className="pl-1">ทั้งหมด {total} รายการ</div>
            )}
          />
        </div>
      </div>
    </>
  );
}
