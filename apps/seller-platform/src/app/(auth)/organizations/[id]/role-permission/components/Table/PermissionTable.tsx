'use client';

import { getRolePermissionList } from '@/api/role.api';
import { PermissionCode, PermissionGroup } from '@/constants/enum/permission.enum';
import { IRole } from '@/interfaces/role.interface';
import Checkbox from '@/components/DataEntry/Checkbox';
import Typography from '@/components/Typography';
import { PopupParams, PopupType } from '@/hooks/usePopup';
import { useQuery } from '@tanstack/react-query';
import { Grid, Table, TableColumnsType } from 'antd';
import { useEffect } from 'react';
import { SubTabType } from '../../RolePermission';
import './custom.css';
import RoleTableSkeleton from './RoleTableSkeleton';

interface Props {
  setChangedPermissionList: (
    value: (prev: { [key: number]: number[] }) => { [key: number]: number[] }
  ) => void;
  roles: IRole[];
  setRoles: (value: IRole[]) => void;
  showPopup: (type: PopupType, params: PopupParams) => void;
  activeTab: string;
}

interface DataType {
  key: React.Key;
  permission: React.ReactNode;
  className?: string;
}

interface ExpandedDataType {
  key: React.Key;
  permission: React.ReactNode;
  [key: number]: React.ReactNode;
}

export default function PermissionTable({
  setChangedPermissionList,
  roles,
  setRoles,
  showPopup,
  activeTab,
}: Props) {
  const {
    data: permissionListData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['permission-list'],
    queryFn: () => getRolePermissionList(),
    enabled: activeTab === 'permission',
    gcTime: 0,
  });

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  useEffect(() => {
    if (permissionListData?.data?.roles && permissionListData.data.roles.length > 0) {
      setRoles(permissionListData.data.roles);
    }
  }, [permissionListData, setRoles]);

  useEffect(() => {
    if (isError) {
      showPopup('error', {
        title: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      });
    }
  }, [isError, showPopup]);

  useEffect(() => {
    if (activeTab === SubTabType.PERMISSION) {
      refetch();
    }
  }, [activeTab, refetch]);

  const permissionGroups = [
    {
      id: '1',
      groupName: 'ข้อมูลองค์กร',
      displayName: 'การจัดการองค์กร',
      width: '168px',
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

  const handlePermissionChange = (
    roleId: number,
    permissionId: number,
    isSelected: boolean
  ) => {
    const newRoleData = roles.map((role) => {
      if (role.id !== roleId) return role;

      return {
        ...role,
        permissionGroups: role.permissionGroups?.map((group) => ({
          ...group,
          permissions: group.permissions.map((permission) =>
            permission.id === +permissionId
              ? { ...permission, isSelected }
              : permission
          ),
        })),
      };
    });

    setRoles(newRoleData);
    setChangedPermissionList((prev: { [key: number]: number[] }) => {
      const currentPermissions = prev[roleId] || [];

      if (currentPermissions.includes(permissionId)) {
        return {
          ...prev,
          [roleId]: currentPermissions.filter(
            (id: number) => id !== permissionId
          ),
        };
      } else {
        return {
          ...prev,
          [roleId]: [...currentPermissions, permissionId],
        };
      }
    });
  };

  const expandableData = permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => {
      const permissionEntry: ExpandedDataType = {
        key: permission.id,
        permission: permission.displayName,
      };

      roles.forEach((role) => {
        const pGroup = role.permissionGroups?.find((g) => {
          return g.groupNameTh === group.groupName;
        });

        const foundPermission = pGroup?.permissions.find(
          (p) => p.descriptionTh === permission.name
        );

        const isChecked = foundPermission?.isSelected;

        permissionEntry[role.id] = (
          <div
            className="flex items-center justify-start w-[168px] px-2"
            key={`${permission.id}-${role.id}`}
          >
            <Checkbox
              checked={isChecked}
              onChange={(e) =>
                handlePermissionChange(
                  role.id,
                  foundPermission?.id || 0,
                  e.target.checked
                )
              }
              disabled={role.name === 'OWNER' || role.name === 'SUPER_ADMIN'}
            />
          </div>
        );
      });

      return permissionEntry;
    })
  );

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
      className: 'table-header-permission',
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
      className: 'table-header-permission',
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
      className: 'table-header-permission',
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
      className: 'table-header-permission',
    },
  ];

  const expandColumns: TableColumnsType<ExpandedDataType> = [
    {
      title: 'สิทธิ์ระดับองค์กร',
      dataIndex: 'permission',
      key: '1',
      width: 320,
      fixed: 'left',
    },
    ...roles?.map((role, idx) => ({
      title: role.displayName,
      dataIndex: role.id,
      key: idx + 2,
      width: 168,
    })),
    {
      title: '',
      key: 'expand-placeholder',
      width: 50,
      render: () => null,
    },
  ];

  const targetPermissionGroups = [
    PermissionGroup.ROLE_PERMISSION,
    PermissionGroup.ORGANIZATION_INFO,
    PermissionGroup.USER_ORGANIZATION,
    PermissionGroup.ORGANIZATION_PHONE,
  ];

  const targetPermissions = Object.values(PermissionCode);

  const columns: TableColumnsType<DataType> = [
    {
      title: 'สิทธิ์ระดับองค์กร',
      dataIndex: 'permission',
      key: 'permission',
      width: 320,
      fixed: 'left',
    },
    ...roles.map((role) => {
      const allPermissions = role.permissionGroups
        .filter((g) =>
          targetPermissionGroups.includes(g.group as PermissionGroup)
        )
        .map((group) =>
          group.permissions.filter((permission) =>
            targetPermissions.includes(permission.code as PermissionCode)
          )
        )
        .flat();

      const allPermissionsSelected = allPermissions.every(
        (permission) => permission.isSelected
      );

      const indeterminate =
        allPermissions.some((permission) => permission.isSelected) &&
        !allPermissionsSelected;

      const handleCheckAll = () => {
        const newRoleData = roles.map((r) => {
          if (r.id !== role.id) return r;

          return {
            ...r,
            permissionGroups: r.permissionGroups?.map((group) => {
              if (
                targetPermissionGroups.includes(group.group as PermissionGroup)
              ) {
                return {
                  ...group,
                  permissions: group.permissions.map((permission) => {
                    if (
                      targetPermissions.includes(
                        permission.code as PermissionCode
                      )
                    ) {
                      return {
                        ...permission,
                        isSelected: !allPermissionsSelected,
                      };
                    }
                    return permission;
                  }),
                };
              }
              return group;
            }),
          };
        });

        setRoles(newRoleData);
        setChangedPermissionList((prev: { [key: number]: number[] }) => {
          return {
            ...prev,
            [role.id]: allPermissions.map((p) => p.id),
          };
        });
      };

      return {
        title: (
          <div className="flex items-center">
            <Checkbox
              checked={allPermissionsSelected}
              indeterminate={indeterminate}
              onChange={handleCheckAll}
              disabled={role.name === 'OWNER' || role.name === 'SUPER_ADMIN'}
            />
            <Typography
              variant="paragraph-small"
              className="!font-semibold !-ml-3 !mt-1"
            >
              {role.displayName}
            </Typography>
          </div>
        ),
        dataIndex: role.id,
        key: role.id,
        width: 168,
      };
    }),
    Table.EXPAND_COLUMN,
  ];

  if (isLoading || isRefetching) {
    return <RoleTableSkeleton />;
  }

  return (
    <Table<DataType>
      columns={columns}
      scroll={{
        scrollToFirstRowOnChange: true,
        y: 600,
      }}
      expandable={{
        expandIcon: ({ expanded, onExpand, record }) => (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(record, e);
            }}
          >
            {expanded ? (
              <i className="ri-arrow-up-s-line text-icon-quinary text-lg"></i>
            ) : (
              <i className="ri-arrow-down-s-line text-icon-quinary text-lg"></i>
            )}
          </div>
        ),
        expandedRowRender: (record) => {
          const groupPermissions = expandableData.filter((item) =>
            String(item.key).startsWith(`${String(record.key)}-`)
          );
          return (
            <Table
              columns={expandColumns}
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
      rowClassName={(record) => record.className || ''}
      className={`[&_.ant-table-thead>tr>th]:!bg-white
            [&_.ant-table]:!border [&_.ant-table]:!border-border-primary
            [&_.ant-table]:!rounded-xl
            [&_.ant-table-cell::before]:!hidden
            [&_.ant-table-row-level-0]:!bg-background-secondary
            [&_.ant-table-expanded-row-level-1>td]:!px-0
            [&_.ant-table-expanded-row-level-1>td]:!bg-white
            [&_.ant-table-row ant-table-row-level-0]:!relative
            [&_.ant-table-row-expand-icon-cell]:!sticky
            [&_.ant-table-row-expand-icon-cell]:!right-0
            [&_th.ant-table-row-expand-icon-cell]:!z-[-20]
            ${isMobile ? 'hide-scrollbar' : ''}
          `}
    />
  );
}
