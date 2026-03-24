'use client';

import {
  createRolePermission,
  CreateRolePermissionPayload,
  updateRolePermission,
} from '@/api/role.api';
import { UpdatePermissionPayload } from '@/api/role.api';
import { getRoleDetail } from '@/api/role.api';
import { ErrorCode } from '@/constants/enum/error-code.enum';
import { IRole } from '@/interfaces/role.interface';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { useNotification } from '@/hooks/notification.hook';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { PopupParams, PopupType } from '@/hooks/usePopup';
import { useTab } from '@/hooks/useTab.hook';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tabs, TabsProps } from 'antd';
import { useState } from 'react';
import AddRoleSection from './components/AddRoleSection';
import PermissionTable from './components/Table/PermissionTable';
import RoleTable from './components/Table/RoleTable';

interface Props {
  organizeId: number;
  showPopup: (type: PopupType, params: PopupParams) => void;
}
export enum SubTabType {
  PERMISSION = 'permission',
  ROLE = 'role',
}

export default function RolePermission({ organizeId, showPopup }: Props) {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [changedPermissionList, setChangedPermissionList] = useState<{
    [key: number]: number[];
  }>({});

  const [isAddingRole, setIsAddingRole] = useState(false);
  const [roleDisplayName, setRoleDisplayName] = useState('');
  const [checkedPermissionList, setCheckedPermissionList] = useState<number[]>(
    []
  );
  const [currentAction, setCurrentAction] = useState<
    'create' | 'view' | 'edit' | undefined
  >('create');
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    undefined
  );
  const { showConfirm, confirmPopup } = useConfirmPopup();
  const [originalPermissionList, setOriginalPermissionList] = useState<
    number[]
  >([]);
  
  const isViewMode = currentAction === 'view';
  const isEditMode = currentAction === 'edit';
  const isCreateMode = currentAction === 'create';
  
  const { activeTab: subActiveTab, handleTabChange: handleSubTabChange } =
    useTab<SubTabType>(
      'subTab',
      SubTabType.PERMISSION,
      Object.values(SubTabType)
    );
  const [activeTab, setActiveTab] = useState(subActiveTab);
  const { notification } = useNotification();

  const { data: roleDetail, refetch: refetchRoleDetail } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: async () => {
      if (!selectedRoleId) return null;
      const data = await getRoleDetail({
        roleId: selectedRoleId.toString(),
      });
      const permissionIdLists = data?.permissionGroups.flatMap(
        (group) => group.permissions.filter(p => p.isSelected).map(p => p.id)
      );
      setCheckedPermissionList(permissionIdLists || []);
      setRoleDisplayName(data?.displayName || '');
      if (isEditMode) {
        setOriginalPermissionList(permissionIdLists || []);
      }
      return data;
    },
    enabled: !!selectedRoleId,
    staleTime: 0,
  });

  const isOwner =
    roleDetail?.name === 'OWNER' || roleDetail?.name === 'SUPER_ADMIN';

  const {
    mutate: updatePermissionMutation,
    isPending: isUpdatingRolesAndPermissions,
  } = useMutation({
    mutationFn: (payload: UpdatePermissionPayload) =>
      updateRolePermission(payload),
    onSuccess: () => {
      setCurrentAction(undefined);
      setSelectedRoleId(undefined);
      setIsAddingRole(false);
      notification.success({
        message: 'บันทึกสำเร็จ',
        description: 'บันทึกการเปลี่ยนแปลงบทบาทเรียบร้อย',
      });
    },
    onError: (e: Error | unknown) => {
      let errorMessage = 'ไม่สามารถบันทึกบทบาทได้ โปรดลองใหม่อีกครั้ง';
      const err = e as { response?: { data?: { error?: { code?: string } } } };
      if (err?.response?.data?.error?.code === ErrorCode.ROLE_DUPLICATE) {
        errorMessage = 'ไม่สามารถบันทึกบทบาทซ้ำได้ โปรดลองใหม่อีกครั้ง';
      }
      notification.error({
        message: 'บันทึกไม่สำเร็จ',
        description: errorMessage,
      });
    },
  });

  const { mutate: createRoleMutation, isPending: isCreatingRole } = useMutation(
    {
      mutationFn: (payload: CreateRolePermissionPayload) =>
        createRolePermission(organizeId, payload),
      onSuccess: () => {
        setIsAddingRole(false);
        setCheckedPermissionList([]);
        setRoleDisplayName('');
        setCurrentAction(undefined);
        notification.success({
          message: 'สร้างสำเร็จ',
          description: 'บทบาทถูกสร้างเรียบร้อย',
        });
      },
      onError: (e: Error | unknown) => {
        let errorMessage = 'ไม่สามารถสร้างบทบาทได้ โปรดลองใหม่อีกครั้ง';
        const err = e as { response?: { data?: { error?: { code?: string } } } };
        if (err?.response?.data?.error?.code === ErrorCode.ROLE_DUPLICATE) {
          errorMessage = 'ไม่สามารถสร้างบทบาทซ้ำได้ โปรดลองใหม่อีกครั้ง';
        }
        notification.error({
          message: 'สร้างไม่สำเร็จ',
          description: errorMessage,
        });
      },
    }
  );

  const handleUpdateRolesAndPermissions = () => {
    const roleIdsForUpdate = Object.entries(changedPermissionList)
      .filter(([_, permissions]) => permissions.length > 0)
      .map(([roleId]) => roleId);

    const payload = roleIdsForUpdate.map((roleId) => ({
      roleId: Number(roleId),
      permissions:
        roles
          .find((role) => role.id === Number(roleId))
          ?.permissionGroups.flatMap((group) =>
            group.permissions
              .filter((permission) => permission.isSelected)
              .map((permission) => permission.id)
          ) || [],
    }));

    updatePermissionMutation({
      organizationId: Number(organizeId),
      payload,
    });
    setChangedPermissionList({});
  };

  const handleActionChange = (
    action: 'create' | 'view' | 'edit',
    roleId?: number
  ) => {
    setCurrentAction(action);
    setSelectedRoleId(roleId);
    setIsAddingRole(true);
    setChangedPermissionList({});
  };

  const handleRoleAction = () => {
    if (isCreateMode) {
      createRoleMutation({
        displayName: roleDisplayName,
        permissions: checkedPermissionList,
      });
    } else if (isEditMode && selectedRoleId) {
      updatePermissionMutation({
        organizationId: organizeId,
        payload: [
          {
            displayName: roleDisplayName,
            roleId: selectedRoleId,
            permissions: checkedPermissionList,
          },
        ],
      });
    }
  };

  const handleCloseAddRole = () => {
    const isNotChanged =
      (originalPermissionList.sort().toString() ===
        checkedPermissionList.sort().toString() &&
        roleDetail?.displayName === roleDisplayName) ||
      (isCreateMode && roleDisplayName.trim() === '');

    if (isViewMode || isNotChanged) {
      setIsAddingRole(false);
      setCurrentAction('create');
      setSelectedRoleId(undefined);
      setCheckedPermissionList([]);
      setRoleDisplayName('');
      return;
    }

    showConfirm({
      title: 'ยกเลิกการเพิ่มบทบาท',
      detail: 'ข้อมูลที่กรอกจะไม่ถูกบันทึก ต้องการยกเลิกหรือไม่?',
      onConfirm: () => {
        setIsAddingRole(false);
        setCurrentAction('create');
        setSelectedRoleId(undefined);
        setCheckedPermissionList([]);
        setRoleDisplayName('');
      },
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: 'warn',
    });
  };

  const items: TabsProps['items'] = [
    {
      key: SubTabType.PERMISSION,
      label: 'สิทธิ์การเข้าถึง',
      children: (
        <PermissionTable
          setChangedPermissionList={setChangedPermissionList}
          roles={roles}
          setRoles={setRoles}
          showPopup={showPopup}
          activeTab={activeTab}
        />
      ),
    },
    {
      key: SubTabType.ROLE,
      label: 'บทบาท',
      children: <RoleTable onActionChange={handleActionChange} />,
    },
  ];

  return (
    <div className="w-full bg-white p-0 md:p-4 rounded-xl">
      {confirmPopup}
      <div className="mt-3">
        {isAddingRole ? (
          <AddRoleSection
            checkedPermissionList={checkedPermissionList}
            setCheckedPermissionList={setCheckedPermissionList}
            setRoleDisplayName={setRoleDisplayName}
            roleDisplayName={roleDisplayName}
            action={currentAction}
            roleId={selectedRoleId}
            setIsAddingRole={setIsAddingRole}
            handleClose={handleCloseAddRole}
          />
        ) : (
          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <Typography variant="h5" className="!text-text-secondary">
                  จัดการบทบาทและสิทธิ์
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  กำหนดสิทธิ์การเข้าถึง และแก้ไขข้อมูลบทบาท
                </Typography>
              </div>
              <Button
                variant="solid"
                icon={<i className="ri-add-line"></i>}
                onClick={() => handleActionChange('create')}
              >
                เพิ่มบทบาท
              </Button>
            </div>
            <div className="mt-6">
              <Tabs
                activeKey={activeTab}
                items={items}
                size="large"
                onChange={(key) => {
                  setChangedPermissionList({});
                  handleSubTabChange(key as SubTabType);
                  setActiveTab(key as SubTabType);
                }}
              />
            </div>
          </div>
        )}
        {(isAddingRole || activeTab === SubTabType.PERMISSION) && (
          <div className="bg-white py-4 z-10">
            <div className="flex justify-end">
              {isAddingRole ? (
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => handleCloseAddRole()}
                  >
                    ยกเลิก
                  </Button>
                  {isViewMode ? (
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={() => handleActionChange('edit', selectedRoleId)}
                      disabled={isOwner}
                    >
                      แก้ไข
                    </Button>
                  ) : (
                    <Button
                      variant="solid"
                      color="primary"
                      disabled={
                        roleDisplayName.trim() === '' ||
                        checkedPermissionList.length === 0 ||
                        (isEditMode &&
                          originalPermissionList.sort().toString() ===
                            checkedPermissionList.sort().toString() &&
                          roleDetail?.displayName === roleDisplayName)
                      }
                      onClick={handleRoleAction}
                      loading={isCreatingRole}
                    >
                      {isCreateMode ? 'เพิ่มบทบาท' : 'บันทึก'}
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant="solid"
                  disabled={
                    Object.keys(changedPermissionList).length === 0 ||
                    Object.values(changedPermissionList).every(
                      (el) => el.length === 0
                    )
                  }
                  onClick={() =>
                    showPopup('default', {
                      title: 'บันทึกการเปลี่ยนแปลงสิทธิ์',
                      description:
                        'สมาชิกที่เกี่ยวข้องจะได้รับหรือสูญเสียสิทธิ์การเข้าถึงตามที่คุณแก้ไข',
                      showCancel: true,
                      showConfirm: true,
                      onOk: handleUpdateRolesAndPermissions,
                    })
                  }
                  loading={isUpdatingRolesAndPermissions}
                >
                  บันทึก
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
