'use client';

import { getMasterPermissionList } from '@/api/permission.api';
import { IPermission } from '@/interfaces/role.interface';
import Checkbox from '@/components/DataEntry/Checkbox';
import Typography from '@/components/Typography';
import { useQuery } from '@tanstack/react-query';
import { Table, TableColumnsType } from 'antd';
import { useEffect, useRef } from 'react';

interface DataType {
  key: React.Key;
  permission: React.ReactNode;
}

interface ExpandedDataType {
  key: React.Key;
  permission: React.ReactNode;
  [key: number]: React.ReactNode;
}

interface Props {
  checkedPermissionList: number[];
  setCheckedPermissionList: (
    value: number[] | ((prev: number[]) => number[])
  ) => void;
  action?: 'create' | 'view' | 'edit';
}

export default function AddRoleTable({
  checkedPermissionList,
  setCheckedPermissionList,
  action = 'create',
}: Props) {
  const isViewMode = action === 'view';
  const { data: masterPermissionListQuery } = useQuery({
    queryKey: ['master-permission-list'],
    queryFn: () => getMasterPermissionList(),
  });

  const masterPermissionList: IPermission[] =
    masterPermissionListQuery?.data || [];

  const permissionGroups = [
    {
      id: '1',
      groupName: 'ข้อมูลองค์กร',
      displayName: 'การจัดการองค์กร',
      permissions: [
        {
          id: '1-1',
          name: 'มีสิทธิ์ดูรายชื่อองค์กร',
          displayName: 'มีสิทธิ์ดูรายชื่อองค์กร',
        },
        {
          id: '1-2',
          name: 'มีสิทธิ์ดูรายละเอียดองค์กร',
          displayName: 'มีสิทธิ์ดูรายละเอียดองค์กร',
        },
        {
          id: '1-3',
          name: 'มีสิทธิ์แก้ไขรายละเอียดองค์กร',
          displayName: 'มีสิทธิ์แก้ไขรายละเอียดองค์กร',
        },
        {
          id: '1-4',
          name: 'มีสิทธิ์ขอยืนยันตัวตน (KYC)',
          displayName: 'มีสิทธิ์ขอยืนยันตัวตน (KYC)',
        },
      ],
    },
    {
      id: '2',
      groupName: 'จัดการสมาชิก',
      displayName: 'การจัดการสมาชิก',
      permissions: [
        {
          id: '2-1',
          name: 'มีสิทธิ์ดูรายชื่อสมาชิก',
          displayName: 'มีสิทธิ์ดูรายชื่อสมาชิก',
        },
        {
          id: '2-2',
          name: 'มีสิทธิ์ดูรายละเอียดสมาชิกขององค์กร',
          displayName: 'มีสิทธิ์ดูรายละเอียดสมาชิกขององค์กร',
        },
        {
          id: '2-3',
          name: 'มีสิทธิ์แก้ไขข้อมูลสมาชิกภายในองค์กร',
          displayName: 'มีสิทธิ์แก้ไขข้อมูลสมาชิกภายในองค์กร',
        },
        {
          id: '2-4',
          name: 'มีสิทธิ์เชิญสมาชิกเข้าองค์กร',
          displayName: 'มีสิทธิ์เชิญสมาชิกเข้าองค์กร',
        },
        {
          id: '2-5',
          name: 'มีสิทธิ์อนุมัติให้เข้าร่วมในองค์กรอื่น',
          displayName: 'มีสิทธิ์ในการอนุมัติคนเข้าองค์กร',
        },
        {
          id: '2-6',
          name: 'มีสิทธิ์ลบสมาชิกออกจากองค์กร',
          displayName: 'มีสิทธิ์ลบสมาชิกออกจากองค์กร',
        },
        {
          id: '2-7',
          name: 'มีสิทธิ์ในการอนุมัติคนออกจากองค์กร',
          displayName: 'มีสิทธิ์ในการอนุมัติคนออกจากองค์กร',
        },
        {
          id: '2-8',
          name: 'มีสิทธิ์ออกจากองค์กรด้วยตัวเอง',
          displayName: 'มีสิทธิ์ออกจากองค์กรด้วยตัวเอง',
        },
      ],
    },
    {
      id: '3',
      groupName: 'บทบาทและสิทธิ์การใช้งาน',
      displayName: 'บทบาทและสิทธิ์',
      permissions: [
        {
          id: '3-1',
          name: 'มีสิทธิ์ดูรายการบทบาทและสิทธิ์',
          displayName: 'มีสิทธิ์ดูรายการบทบาท',
        },
        {
          id: '3-2',
          name: 'มีสิทธิ์ดูรายละเอียดรายการบทบาทและสิทธิ์',
          displayName: 'มีสิทธิ์ดูรายละเอียดบทบาท',
        },
        {
          id: '3-3',
          name: 'มีสิทธิ์เพิ่มบทบาทและสิทธิ์',
          displayName: 'มีสิทธิ์เพิ่มบทบาท',
        },
        {
          id: '3-4',
          name: 'มีสิทธิ์ลบบทบาทและสิทธิ์',
          displayName: 'มีสิทธิ์ลบบทบาท',
        },
        {
          id: '3-5',
          name: 'มีสิทธิ์แก้ไขบทบาทและสิทธิ์',
          displayName: 'มีสิทธิ์แก้ไขบทบาท',
        },
      ],
    },
    {
      id: '4',
      groupName: 'จัดการข้อมูลเบอร์องค์กร',
      displayName: 'การจัดการข้อมูลเบอร์องค์กร',
      permissions: [
        {
          id: '4-1',
          name: 'มีสิทธิ์ดูรายละเอียดของเบอร์องค์กร',
          displayName: 'มีสิทธิ์ดูรายละเอียดเบอร์องค์กร',
        },
        {
          id: '4-2',
          name: 'มีสิทธิ์เพิ่มเบอร์องค์กร',
          displayName: 'มีสิทธิ์เพิ่มเบอร์องค์กร',
        },
      ],
    },
  ];

  const allPermissions = permissionGroups.flatMap((group) => group.permissions);

  const allPermissionsWithValues = allPermissions?.map((permission) => {
    const foundPermission = masterPermissionList?.find(
      (item) => item.descriptionTh === permission.name
    );

    return {
      ...permission,
      value: foundPermission?.id || 0,
    };
  });

  const allPermissionValues = allPermissionsWithValues
    .map((item) => item.value)
    .filter((value) => value !== 0);

  const isAllChecked =
    allPermissionValues.length > 0 &&
    allPermissionValues.every((value) => checkedPermissionList.includes(value));

  const handleToggleAll = () => {
    if (isAllChecked) {
      setCheckedPermissionList([]);
    } else {
      setCheckedPermissionList(allPermissionValues);
    }
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (action === 'create') {
      if (
        allPermissionsWithValues.some((item) => item.value !== 0) &&
        !initialized.current
      ) {
        setCheckedPermissionList(
          allPermissionsWithValues.map((item) => item.value)
        );
        initialized.current = true;
      }
    }
  }, [allPermissionsWithValues, action, setCheckedPermissionList]);

  const columns: TableColumnsType<DataType> = [
    {
      title: 'สิทธิ์ระดับองค์กร',
      dataIndex: 'permission',
      key: 'permission',
      width: 320,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllChecked}
            onChange={handleToggleAll}
            disabled={isViewMode}
            indeterminate={checkedPermissionList.length > 0 && !isAllChecked}
          />
          <Typography
            variant="paragraph-small"
            className="!font-semibold !mt-0"
          >
            {`ทั้งหมด`}
          </Typography>
        </div>
      ),
      dataIndex: 1,
      key: 1,
      width: 168,
    },
  ];

  const expandColumns: TableColumnsType<ExpandedDataType> = [
    {
      title: 'สิทธิ์ระดับองค์กร',
      dataIndex: 'permission',
      key: '1',
      width: 320,
    },
    {
      title: 'Member',
      dataIndex: 1,
      key: 1,
      width: 168,
    },
  ];

  const expandableData = allPermissionsWithValues.flatMap((permission) => {
    const permissionEntry: ExpandedDataType = {
      key: permission.id,
      permission: permission.displayName,
    };

    permissionEntry[1] = (
      <div
        className="flex items-center justify-start"
        key={`${permission.id}-${1}`}
      >
        <Checkbox
          checked={checkedPermissionList.includes(permission.value)}
          disabled={isViewMode}
          onChange={() => {
            if (checkedPermissionList.includes(permission.value)) {
              setCheckedPermissionList((prev) =>
                prev.filter((item) => item !== permission.value)
              );
            } else {
              setCheckedPermissionList((prev) => [...prev, permission.value]);
            }
          }}
        />
      </div>
    );

    return permissionEntry;
  });

  const dataSource = [
    {
      key: '1',
      permission: (
        <div className="flex items-center !text-text-brand-dark gap-1">
          <i className="ri-briefcase-2-line"></i>
          <Typography
            variant="paragraph-small"
            className="!font-semibold !text-inherit"
          >
            ข้อมูลองค์กร
          </Typography>
        </div>
      ),
    },
    {
      key: '2',
      permission: (
        <div className="flex items-center !text-text-brand-dark gap-1">
          <i className="ri-team-line"></i>
          <Typography
            variant="paragraph-small"
            className="!font-semibold !text-inherit"
          >
            จัดการสมาชิก
          </Typography>
        </div>
      ),
    },
    {
      key: '3',
      permission: (
        <div className="flex items-center !text-text-brand-dark gap-1">
          <i className="ri-user-follow-line"></i>
          <Typography
            variant="paragraph-small"
            className="!font-semibold !text-inherit"
          >
            บทบาทและสิทธิ์
          </Typography>
        </div>
      ),
    },
    {
      key: '4',
      permission: (
        <div className="flex items-center !text-text-brand-dark gap-1">
          <i className="ri-phone-line"></i>
          <Typography
            variant="paragraph-small"
            className="!font-semibold !text-inherit"
          >
            จัดการข้อมูลเบอร์องค์กร
          </Typography>
        </div>
      ),
    },
  ];

  return (
    <Table<DataType>
      columns={columns}
      scroll={{
        x: '100%',
        scrollToFirstRowOnChange: true,
      }}
      expandable={{
        showExpandColumn: false,
        expandedRowRender: (record) => {
          const groupPermissions = expandableData.filter((item) =>
            String(item.key).startsWith(`${String(record.key)}-`)
          );
          return (
            <Table
              columns={expandColumns}
              scroll={{
                x: '100%',
                scrollToFirstRowOnChange: true,
              }}
              dataSource={groupPermissions}
              pagination={false}
              showHeader={false}
              tableLayout="fixed"
              className="[&_.ant-table]:!border-none
                [&_.ant-table-cell]:!px-0
                [&_.ant-table-row-level-0>td]:!bg-white
                [&_.ant-table-row-level-0>td]:!px-2
              "
            />
          );
        },
        defaultExpandedRowKeys: permissionGroups.map((group) => group.id),
      }}
      dataSource={dataSource}
      size="middle"
      pagination={false}
      tableLayout="fixed"
      className="[&_.ant-table-thead>tr>th]:!bg-white
        [&_.ant-table]:!border [&_.ant-table]:!border-border-primary
        [&_.ant-table-row ant-table-row-level-0>td]:!bg-background-secondary
        [&_.ant-table]:!rounded-xl
        [&_.ant-table-cell::before]:!hidden
        [&_.ant-table-row-level-0]:!bg-background-secondary
        [&_.ant-table-expanded-row-level-1>td]:!px-0
        [&_.ant-table-expanded-row-level-1>td]:!bg-white
      "
    />
  );
}
