"use client";

import {
  createExitOrganizationRequest,
  getUserByOrganizationId,
  IReqUpdateUser,
  updateUserByOrganization,
  updateUserByOrganizationRole,
} from "@/api/organization.api";
import { UserOrganizationInviteStatus } from "@/constants/enum/organization.enum";
import { IUserOrganization } from "@/interfaces/organization/organization.response.interface";
import Button from "@/components/Button";
import BadgeLabel from "@/components/BadgeLabel";
import MemberStatusBadge from "../../components/MemberStatusBadge";
import ResponsivePopup from "@/components/Popup";
import Typography from "@/components/Typography";
import { useNotification } from "@/hooks/notification.hook";
import { formatFullName, formatPhone, hashPhone } from "@/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Grid, Popover } from "antd";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FormMember, { IMemberForm } from "./FormMember";
import { useUserStore } from "@/store/user.store";
import { useConfirmPopup } from "@/hooks/useConfirmPopup";
import CustomTable from "@/components/Table";
import { useScreenWidth } from "@/hooks/useScreenWidth";

const MemberInfo = () => {
  const params = useParams();
  const { id: organizeId } = params as { id: string };
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isTablet = useScreenWidth() <= 1024;
  const queryClient = useQueryClient();
  const [hashedNameRowIds, setHashedNameRowIds] = useState<Set<number>>(
    new Set(),
  );
  const [hashedPhoneRowIds, setHashedPhoneRowIds] = useState<Set<number>>(
    new Set(),
  );
  const [isOpenFormMember, setIsOpenFormMember] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit">("view");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [oldRoleId, setOldRoleId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [memberForm] = Form.useForm<IMemberForm>();
  const { notification } = useNotification();
  const { showConfirm, confirmPopup } = useConfirmPopup();
  const pressedNameIdRef = useRef<number | null>(null);
  const pressedPhoneIdRef = useRef<number | null>(null);

  const [paramValue, setParamValue] = useState({ page: 1, limit: 10 });
  const { organization } = useUserStore();
  const organizeProfileUuid = organization?.uuid;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["organizationMembers", organizeProfileUuid, paramValue],
    queryFn: () => getUserByOrganizationId(organizeProfileUuid!, paramValue),
    enabled: !!organizeProfileUuid,
  });

  const rawUsers = data?.data?.users;
  const users: IUserOrganization[] = Array.isArray(rawUsers) ? rawUsers : [];
  const totalCount = data?.data?.pagination?.totalItems || 0;
  const totalUsers = totalCount;

  const { mutate: updateUser } = useMutation({
    mutationFn: ({
      payload,
      userUuid,
    }: {
      payload: IReqUpdateUser;
      userUuid: string;
    }) => {
      return updateUserByOrganization(organizeProfileUuid!, userUuid, payload);
    },
    onSuccess: (response) => {
      const newUserId = response.data?.data?.id ?? (response.data as unknown as { id?: number })?.id;
      if (newUserId) {
        updateUserRole({
          payload: { roleId: memberForm.getFieldValue("roleId") as number },
          userId: newUserId,
        });
      }
    },
    onError: () => {
      notification.error({
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
      });
    },
  });

  const { mutate: updateUserRole } = useMutation({
    mutationFn: ({
      payload,
      userId,
    }: {
      payload: { roleId: number };
      userId: number;
    }) => {
      if (payload.roleId === oldRoleId) return Promise.resolve();
      return updateUserByOrganizationRole(
        Number(organizeId),
        userId,
        payload,
      ).then(() => {});
    },
    onSuccess: () => {
      notification.success({
        message: "บันทึกสำเร็จ",
        description: "บันทึกการเปลี่ยนแปลงสิทธ์เรียบร้อย",
        duration: 3,
      });
      refetch();
      setIsOpenFormMember(false);
    },
    onError: () => {
      notification.error({
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
      });
    },
  });

  const { mutate: handleDeleteUser } = useMutation({
    mutationFn: (userId: number) =>
      createExitOrganizationRequest(organizeProfileUuid!, userId),
    onSuccess: () => {
      notification.success({
        message: "ส่งคำขอสำเร็จ",
        description: "ส่งคำขอนำสมาชิกออกจากองค์กรเรียบร้อยแล้ว",
        icon: <i className="ri-information-line text-success" />,
      });
      setOpenPopoverId(null);
      setIsOpenFormMember(false);
      memberForm.resetFields();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['exitRequests'] });
    },
    onError: () => {
      notification.error({
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำขอได้",
        icon: <i className="ri-information-line text-error" />,
      });
    },
  });

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
      if (pressedPhoneIdRef.current !== null) {
        setHashedPhoneRowIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pressedPhoneIdRef.current!);
          return newSet;
        });
        pressedPhoneIdRef.current = null;
      }
    };
    document.addEventListener('mouseup', handleGlobalRelease);
    document.addEventListener('touchend', handleGlobalRelease);
    return () => {
      document.removeEventListener('mouseup', handleGlobalRelease);
      document.removeEventListener('touchend', handleGlobalRelease);
    };
  }, []);

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
      isHashed,
    );
  }, [hashedNameRowIds]);

  const getDisplayPhone = useCallback((phone: string, recordId: number) => {
    const isHashed = !hashedPhoneRowIds.has(recordId);
    return isHashed ? hashPhone(phone) : formatPhone(phone);
  }, [hashedPhoneRowIds]);

  const handleViewMember = useCallback((record: IUserOrganization) => {
    setFormMode("view");
    setFormKey((prev) => prev + 1);
    setIsOpenFormMember(true);
    setOpenPopoverId(null);
    memberForm.setFieldsValue({
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      phone: record.phone,
      email: record.email,
      roleId: record.roleId,
      id: record.id,
      uuid: record.uuid,
    });
  }, [memberForm]);

  const handleEditMember = useCallback((record: IUserOrganization) => {
    setFormMode("edit");
    setFormKey((prev) => prev + 1);
    setIsOpenFormMember(true);
    setOpenPopoverId(null);
    memberForm.setFieldsValue({
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      phone: record.phone,
      email: record.email,
      roleId: record.roleId,
      id: record.id,
      uuid: record.uuid,
    });
    setOldRoleId(record.roleId);
  }, [memberForm]);

  const handleDeleteMember = useCallback((record: IUserOrganization) => {
    setOpenPopoverId(null);

    showConfirm({
      title: "ส่งคำขอออกจากองค์กร",
      detail:
        "คำขอออกจากองค์กรจะถูกส่งไปยังผู้ดูแลระบบเพื่อพิจารณา",
      onConfirm: () => handleDeleteUser(record.id),
      confirmText: "ส่งคำขอ",
      type: "warn",
    });
  }, [showConfirm, handleDeleteUser]);

  const createPopoverContent = useCallback((record: IUserOrganization) => {
    const isSystemRole =
      record.roleName === "OWNER" || record.roleName === "SUPER_ADMIN";
    const isWaitingLeave = record.isRequest;
    const isSent =
      record.membershipStatus === UserOrganizationInviteStatus.SENT ||
      record.membershipStatus === UserOrganizationInviteStatus.WAIT_FOR_APPROVE;
    const canDelete = !isSystemRole && !isWaitingLeave && !isSent;

    return (
      <div className="w-[160px] py-1 px-2">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="small"
            color="neutral"
            className="!justify-start !text-left"
            icon={<i className="ri-file-text-line"></i>}
            onClick={() => handleViewMember(record)}
            bold="400"
          >
            ดูรายละเอียด
          </Button>
          <Button
            variant="ghost"
            size="small"
            color="neutral"
            className="!justify-start !text-left"
            icon={<i className="ri-edit-line"></i>}
            onClick={() => handleEditMember(record)}
            bold="400"
            disabled={isSent}
          >
            แก้ไขรายการ
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="small"
              color="error"
              className="!justify-start !text-left !text-error"
              icon={<i className="ri-delete-bin-6-line"></i>}
              onClick={() => handleDeleteMember(record)}
              bold="400"
            >
              ลบรายการ
            </Button>
          )}
        </div>
      </div>
    );
  }, [handleViewMember, handleEditMember, handleDeleteMember]);

  const renderNameColumn = useCallback((record: IUserOrganization) => {
    const isHashed = !hashedNameRowIds.has(record.id);
    const displayName = getDisplayName(
      record.firstName,
      record.lastName,
      record.middleName,
      record.id
    );
    return (
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
    );
  }, [hashedNameRowIds, getDisplayName, isMobile, isTablet]);

  const renderPhoneColumn = useCallback((record: IUserOrganization) => {
    const isHashed = !hashedPhoneRowIds.has(record.id);
    const displayPhone = getDisplayPhone(record.phone, record.id);
    
    return (
      <div className="flex items-center gap-2">
        <Typography 
          variant="paragraph-small" 
          className="!text-text-secondary min-w-0"
          ellipsis={!isHashed}
          style={{
            overflow: 'hidden',
            textOverflow: isHashed ? 'clip' : 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {displayPhone}
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
            pressedPhoneIdRef.current = record.id;
            setHashedPhoneRowIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(record.id);
              return newSet;
            });
          }}
          onTouchStart={() => {
            pressedPhoneIdRef.current = record.id;
            setHashedPhoneRowIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(record.id);
              return newSet;
            });
          }}
        />
      </div>
    );
  }, [hashedPhoneRowIds, getDisplayPhone]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "ชื่อ นามสกุล",
        dataIndex: "fullName",
        key: "fullName",
        width: isMobile || isTablet ? 200 : "20%",
        render: (_: unknown, record: IUserOrganization) =>
          renderNameColumn(record),
      },
      {
        title: "บทบาท",
        dataIndex: "role",
        key: "role",
        width: isMobile || isTablet ? 200 : "20%",
        render: (_: unknown, record: IUserOrganization) => (
          <div className="w-fit">
            <BadgeLabel
              text={record.roleDisplayName || "-"}
              color="neutral"
              variant="outlined"
              rounding="pill"
              size="small"
            />
          </div>
        ),
      },
      {
        title: "สถานะ",
        dataIndex: "status",
        key: "status",
        width: isMobile || isTablet ? 200 : "20%",
        render: (_: unknown, record: IUserOrganization) => (
          <div className="w-fit">
            <MemberStatusBadge status={record.membershipStatus} />
          </div>
        ),
      },
    ];

    const phoneColumn = {
      title: "หมายเลขโทรศัพท์",
      dataIndex: "phone",
      key: "phone",
      width: isTablet ? 200 : "25%",
      render: (_: unknown, record: IUserOrganization) =>
        renderPhoneColumn(record),
    };

    const actionsColumn = {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: isMobile || isTablet ? 'auto' : "15%",
      fixed: "right" as const,
      render: (_: unknown, record: IUserOrganization) => (
        <div className="flex justify-end w-full">
          <Popover
            content={createPopoverContent(record)}
            trigger="click"
            placement="bottomRight"
            open={openPopoverId === record.id}
            onOpenChange={(visible) => {
              setOpenPopoverId(visible ? record.id : null);
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
    };

    return [...baseColumns, ...(isMobile ? [] : [phoneColumn]), actionsColumn];
  }, [isMobile, isTablet, openPopoverId, renderNameColumn, renderPhoneColumn, createPopoverContent]);

  return (
    <div className="py-6 border flex flex-col min-h-auto md:min-h-[620px] gap-4 border-border-primary rounded-xl">
      {confirmPopup}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex items-end gap-2 px-4">
          <Typography variant="paragraph-medium" className="!text-text-primary">
            สมาชิกในองค์กร
          </Typography>
          <BadgeLabel
            text={`ทั้งหมด ${totalUsers} คน`}
            color="neutral"
            rounding="pill"
            variant="outlined"
          />
        </div>
        <CustomTable<IUserOrganization>
          columns={columns}
          dataSource={users}
          loading={isLoading || isFetching}
          rowKey="id"
          size={isMobile ? "small" : "middle"}
          scroll={{
            x: isMobile || isTablet ? "max-content" : "100%",
            scrollToFirstRowOnChange: true,
          }}
          emptyText="ไม่มีสมาชิกในองค์กร"
          emptyStateHeight={400}
          pagination={{
            current: paramValue.page,
            pageSize: paramValue.limit,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setParamValue({
                page,
                limit: pageSize || paramValue.limit,
              });
            },
            locale: {
              items_per_page: " / หน้า",
              prev_page: "ย้อนกลับ",
              next_page: "หน้าถัดไป",
            },
          }}
          tableLayout="fixed"
        />
      </div>
      <ResponsivePopup
        visible={isOpenFormMember}
        onClose={() => {
          setIsOpenFormMember(false);
          memberForm.resetFields();
        }}
        modalProps={{
          width: "960px",
        }}
        drawerProps={{
          height: "90%",
          destroyOnClose: true,
        }}
      >
        <FormMember
          key={formKey}
          form={memberForm}
          mode={formMode}
          onClose={() => {
            setIsOpenFormMember(false);
            memberForm.resetFields();
          }}
          onSubmit={(val) => {
            updateUser({
              userUuid: val.uuid,
              payload: {
                firstName: val.firstName,
                middleName: val.middleName || "",
                lastName: val.lastName,
                email: val.email,
                roleId: val.roleId,
              },
            });
          }}
          onDelete={() => {
            const userId = memberForm.getFieldValue('id');
            if (userId) {
              handleDeleteUser(userId);
            }
          }}
        />
      </ResponsivePopup>
    </div>
  );
};

export default MemberInfo;
