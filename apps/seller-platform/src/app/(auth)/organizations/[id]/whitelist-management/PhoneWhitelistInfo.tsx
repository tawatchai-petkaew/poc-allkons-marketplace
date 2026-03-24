'use client';

import {
  deletePhoneWhitelist,
  getAllPhoneWhitelistByOrganization,
} from '@/api/organization.api';
import Button from '@/components/Button';
import Label from '@/components/BadgeLabel';
import Typography from '@/components/Typography';
import { useNotification, useScreenWidth } from '@/hooks/index';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { useUserStore } from '@/store/user.store';
import { IPhoneWhitelist } from '@/interfaces/organization/organization.response.interface';
import { formatPhone, hashPhone } from '@/utils/format';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Grid, Pagination, Spin, Table } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const PhoneWhitelistInfo = () => {
  const params = useParams();
  const { id: organizeId } = params as { id: string };
  const { organization } = useUserStore();
  const organizeUuid = organization?.uuid;
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const { notification } = useNotification();
  const { showConfirm, confirmPopup } = useConfirmPopup();

  const [paramValue, setParamValue] = useState({ page: 1, limit: 10 });
  const [hashedPhoneRowIds, setHashedPhoneRowIds] = useState<Set<number>>(
    new Set()
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['getAllPhoneWhitelistByOrganization', organizeUuid, paramValue],
    queryFn: () => getAllPhoneWhitelistByOrganization(organizeUuid || '', paramValue),
    enabled: !!organizeUuid,
  });

  const { mutate: handleDeletePhone } = useMutation({
    mutationFn: ({
      organizeUuid,
      phoneId,
    }: {
      organizeUuid: string;
      phoneId: number;
    }) => deletePhoneWhitelist({ organizationUuid: organizeUuid, phoneId }),
    onSuccess: () => {
      notification.success({
        message: 'ลบสำเร็จ',
        description: 'ลบเบอร์โทรศัพท์ในนามองค์กรเรียบร้อย',
      });
      refetch();
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการลบหมายเลขโทรศัพท์ใน Whitelist',
      });
    },
  });

  const phoneList = data?.data?.phoneLists || [];
  const totalPhoneList = data?.data?.total || 0;

  const getDisplayPhone = (phone: string, recordId: number) => {
    const isHashed = hashedPhoneRowIds.has(recordId);
    return isHashed ? hashPhone(phone) : formatPhone(phone);
  };

  const toggleHashForPhone = (recordId: number) => {
    setHashedPhoneRowIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleDeletePhoneId = (phoneId: number) => {
    showConfirm({
      title: 'ลบเบอร์ออกจากองค์กร?',
      detail: 'หากลบแล้ว สมาชิกจะไม่สามารถใช้งานเบอร์นี้ในระบบได้อีก',
      onConfirm: () => handleDeletePhone({ organizeUuid: organizeUuid || '', phoneId }),
      confirmText: 'ลบ',
      type: 'warn',
    });
  };

  const columns = useMemo(() => {
    return [
      {
        title: 'เบอร์โทรศัพท์',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: isMobile || isTablet ? 'auto' : '35%',
        render: (_: unknown, record: IPhoneWhitelist) => {
          const isHashed = hashedPhoneRowIds.has(record?.id);
          return (
            <div className="flex items-center gap-2">
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary"
              >
                {getDisplayPhone(record?.phoneNumber, record?.id)}
              </Typography>
              <Button
                size="small"
                variant="ghost"
                color="neutral"
                className="!p-1 !min-w-0"
                icon={
                  isHashed ? (
                    <i className="ri-eye-off-line text-base"></i>
                  ) : (
                    <i className="ri-eye-line text-base"></i>
                  )
                }
                onClick={() => toggleHashForPhone(record?.id)}
              />
            </div>
          );
        },
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        width: isMobile || isTablet ? 'auto' : '45%',
        render: (_: unknown, record: IPhoneWhitelist) => {
          return (
            <div className="w-fit">
              <Label
                text={record?.isActive ? 'ใช้งาน' : 'ยังไม่ใช้งาน'}
                color={record?.isActive ? 'success' : 'neutral'}
                variant="outlined"
                rounding="pill"
                size="small"
              />
            </div>
          );
        },
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        width: 'auto',
        render: (_: unknown, record: IPhoneWhitelist) => {
          return (
            <div className="flex justify-end w-full">
              <Button
                variant="outlined"
                color="error"
                icon={<i className="ri-delete-bin-6-line text-base"></i>}
                onClick={() => {
                  handleDeletePhoneId(record?.id);
                }}
              />
            </div>
          );
        },
      },
    ];
  }, [isMobile, isTablet, hashedPhoneRowIds, organizeUuid]);

  const handlePageChange = (page: number, pageSize: number) => {
    setParamValue({ page, limit: pageSize });
  };

  useEffect(() => {
    if (phoneList && phoneList.length > 0) {
      setHashedPhoneRowIds((prev) => {
        const allUserIds = phoneList.map((user: IPhoneWhitelist) => user.id);
        const newSet = new Set(allUserIds);

        const areEqual = prev.size === newSet.size && 
          [...newSet].every(id => prev.has(id));

        if (areEqual) return prev;
        return newSet;
      });
    }
  }, [phoneList]);

  if (isLoading || isFetching) {
    return (
      <div className="min-h-[300px] flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="py-6 border flex flex-col justify-between min-h-auto md:min-h-[700px] gap-4 border-border-primary rounded-xl">
      {confirmPopup}
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex gap-4 items-center px-4">
          <Typography variant="paragraph-medium" className="!text-text-primary">
            หมายเลขโทรศัพท์
          </Typography>
          <Label
            text={`ทั้งหมด ${totalPhoneList} รายการ`}
            variant="ghost"
            rounding="pill"
            size="middle"
          />
        </div>
        <Table
          columns={columns}
          dataSource={phoneList}
          rowKey="id"
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
          scroll={{
            x: isMobile || isTablet ? 'max-content' : '100%',
            scrollToFirstRowOnChange: true,
          }}
          locale={{
            emptyText: (
              <div className="py-20">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-placeholder"
                >
                  ไม่มีข้อมูล
                </Typography>
              </div>
            ),
          }}
          className="
            [&_.ant-table]:!bg-background-secondary
             [&_.ant-table]:!rounded-none
              [&_.ant-table-thead>tr>th]:!border-none
              [&_.ant-table-thead>tr>th]:!bg-transparent
              [&_.ant-table-thead>tr>th]:!font-normal
              [&_.ant-table-thead>tr>th]:!z-10
              [&_.ant-table-thead>tr>th]:!bg-background-secondary
              [&_.ant-table-thead>tr>th::before]:!hidden
              [&_.ant-table-container]:!border-none
              [&_.ant-table-content]:!border-none
              [&_.ant-table-tbody>tr]:!border-none
              [&_td.ant-table-cell]:!bg-white
              [&_td.ant-table-cell]:!py-6
              [&_td.ant-table-cell]:!px-4
              [&_th.ant-table-cell]:!p-4
              [&_.ant-table-tbody_td]:!text-ellipsis
              [&_.ant-table-tbody_td]:!overflow-hidden
              !mt-2
              "
        />
      </div>
      <div className="flex justify-between px-4 py-4 md:py-0">
        <Typography variant="paragraph-medium" className="!text-text-secondary">
          ทั้งหมด {totalPhoneList} รายการ
        </Typography>
        <Pagination
          defaultCurrent={paramValue.page}
          current={paramValue.page}
          pageSize={paramValue.limit}
          total={totalPhoneList}
          onChange={(page, pageSize) => {
            handlePageChange(page, pageSize || paramValue.limit);
          }}
        />
      </div>
    </div>
  );
};
export default PhoneWhitelistInfo;
