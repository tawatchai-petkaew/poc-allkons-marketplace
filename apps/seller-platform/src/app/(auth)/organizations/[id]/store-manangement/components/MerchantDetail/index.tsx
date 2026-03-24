'use client';

import { useMemo, useState, useCallback } from 'react';
import { Divider, Form, Grid, Pagination, Table } from 'antd';
import BadgeLabel from '@/components/BadgeLabel';
import CustomButton from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import Typography from '@/components/Typography';
import { IMerchantItem, IMerchantMember } from '@/interfaces/merchant/merchant.response.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMerchantMembers,
  getMerchantMembers,
  removeMerchantMember,
  updateMerchantMemberRole,
} from '@/api/merchant.api';
import { formatPhone, formatFullName, hashPhone } from '@/utils/format';
import ResponsivePopup from '@/components/Popup';
import InviteMerchantMemberPopup from './InviteMerchantMemberPopup';
import EditMemberPopup from './EditMemberPopup';
import { useNotification, useScreenWidth } from '@/hooks';
import Cookies from 'js-cookie';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';

const { useBreakpoint } = Grid;

interface MerchantDetailProps {
  store: IMerchantItem;
  onBack: () => void;
}

export const MerchantDetail: React.FC<MerchantDetailProps> = ({ store: merchant, onBack }) => {
  const screens = useBreakpoint();
  const isTablet = useScreenWidth() <= 1024;
  const [form] = Form.useForm();
  const { notification } = useNotification();
  const { confirmPopup, showConfirm } = useConfirmPopup();
  const displayName = merchant.merchantTranslations?.[0]?.name ?? merchant.name ?? '-';
  const branchName = merchant.merchantName ?? '-';

  const [isActive, setIsActive] = useState(merchant.status === 'active');
  const [visibleNames, setVisibleNames] = useState<Set<string>>(new Set());
  const [visiblePhones, setVisiblePhones] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const organizeUuid = Cookies.get('organizeUuid') || '';
  const [isOpenInvitePopup, setIsOpenInvitePopup] = useState(false);
  const [invitePopupKey, setInvitePopupKey] = useState(0);

  const handleCloseInvitePopup = () => {
    setIsOpenInvitePopup(false);
    setInvitePopupKey((k) => k + 1);
  };

  const [editingMember, setEditingMember] = useState<IMerchantMember | null>(null);
  const [editPopupKey, setEditPopupKey] = useState(0);

  const handleCloseEditPopup = () => {
    setEditingMember(null);
    setEditPopupKey((k) => k + 1);
  };

  const toggleNameVisibility = useCallback((uuid: string) => {
    setVisibleNames((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }, []);

  const togglePhoneVisibility = useCallback((uuid: string) => {
    setVisiblePhones((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }, []);
  const pageSize = 10;

  const { data: merchantMembersData } = useQuery({
    queryKey: ['merchantMembers', merchant.uuid, page],
    queryFn: () => getMerchantMembers(merchant.uuid, page, pageSize),
    enabled: !!merchant.uuid,
    staleTime: 0,
  });

  const { mutate: addMembers, isPending: isAddingMembers } = useMutation({
    mutationFn: async (payload: {
      merchantId: number;
      members: { userId: number; roleId: number }[];
    }) => {
      const response = await addMerchantMembers(payload.merchantId, payload.members);
      return response;
    },
    onSuccess: () => {
      handleCloseInvitePopup();
      queryClient.invalidateQueries({
        queryKey: ['merchantMembers', merchant.uuid, page],
      });
      queryClient.invalidateQueries({
        queryKey: ['getMerchantByOrganization', organizeUuid],
      });
      notification.success({
        message: 'เพิ่มสำเร็จ',
        description: 'สมาชิกถูกเพิ่มเรียบร้อย',
      });
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      });
    },
  });

  const { mutate: updateMember, isPending: isUpdatingMember } = useMutation({
    mutationFn: (payload: { userUuid: string; roleId: number }) =>
      updateMerchantMemberRole(merchant.uuid, {
        userUuid: payload.userUuid,
        roleId: payload.roleId,
      }),
    onSuccess: () => {
      handleCloseEditPopup();
      queryClient.invalidateQueries({
        queryKey: ['merchantMembers', merchant.uuid],
      });
      notification.success({
        message: 'บันทึกสำเร็จ',
      });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
      });
    },
  });

  const { mutate: deleteMember, isPending: isDeletingMember } = useMutation({
    mutationFn: (userUuid: string) => removeMerchantMember(merchant.uuid, userUuid),
    onSuccess: () => {
      handleCloseEditPopup();
      queryClient.invalidateQueries({
        queryKey: ['merchantMembers', merchant.uuid],
      });
      queryClient.invalidateQueries({
        queryKey: ['getMerchantByOrganization', organizeUuid],
      });
      notification.success({
        message: 'ลบสำเร็จ',
      });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
      });
    },
  });

  const merchantMembers: IMerchantMember[] = merchantMembersData?.data?.items ?? [];
  const totalMembers = merchantMembersData?.data?.allMembers ?? 0;
  const totalPages = merchantMembersData?.data?.pagination?.total ?? 0;

  const columns = useMemo(
    () => [
      {
        title: 'ชื่อ นามสกุล',
        key: 'displayName',
        render: (_: unknown, record: IMerchantMember) => {
          const uuid = record.users.uuid;
          const isVisible = visibleNames.has(uuid);
          const displayValue = formatFullName(
            record.users.firstNameTh,
            record.users.lastNameTh,
            record.users.middleNameTh ?? undefined,
            !isVisible
          );
          return (
            <div className="flex items-center gap-2">
              <Typography variant="paragraph-small-regular" className="!text-text-secondary">
                {displayValue}
              </Typography>
              <i
                className={`${
                  isVisible ? 'ri-eye-line' : 'ri-eye-off-line'
                } text-icon-tertiary text-base cursor-pointer`}
                onClick={() => toggleNameVisibility(uuid)}
              />
            </div>
          );
        },
      },
      {
        title: 'เบอร์โทรศัพท์',
        key: 'phone',
        render: (_: unknown, record: IMerchantMember) => {
          const uuid = record.users.uuid;
          const isVisible = visiblePhones.has(uuid);
          const rawPhone = record.users.phoneNumber;
          const displayValue = isVisible ? formatPhone(rawPhone) : hashPhone(rawPhone);
          return (
            <div className="flex items-center gap-2">
              <Typography variant="paragraph-small-regular" className="!text-text-secondary">
                {displayValue}
              </Typography>
              <i
                className={`${
                  isVisible ? 'ri-eye-line' : 'ri-eye-off-line'
                } text-icon-tertiary text-base cursor-pointer`}
                onClick={() => togglePhoneVisibility(uuid)}
              />
            </div>
          );
        },
      },
      {
        title: 'บทบาท',
        key: 'role',
        render: (_: unknown, record: IMerchantMember) => (
          <BadgeLabel
            text={record.role.displayName}
            color="neutral"
            variant="modern"
            rounding="pill"
            size="small"
          />
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 100,
        render: (_: unknown, record: IMerchantMember) => {
          const isOwner = record.role.name === 'OWNER';
          return (
            <div className="flex items-center justify-end gap-2">
              <CustomButton
                variant="link"
                color="neutral"
                size="small"
                disabled={isOwner}
                icon={<i className="ri-edit-line text-base" />}
                onClick={() => setEditingMember(record)}
              />
              <CustomButton
                variant="link"
                color="error"
                size="small"
                disabled={isOwner}
                icon={<i className="ri-delete-bin-6-line text-base" />}
                onClick={() =>
                  showConfirm({
                    type: 'warn',
                    title: 'ยืนยันลบสมาชิก',
                    onConfirm: () => deleteMember(record.users.uuid),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [visibleNames, visiblePhones, toggleNameVisibility, togglePhoneVisibility, setEditingMember]
  );

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log('save store', values, { isActive });
    });
  };

  const SectionRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className={`flex ${isTablet ? 'flex-col gap-4' : 'flex-row gap-8'} py-6`}>
      <div className="w-full md:w-[260px] shrink-0">
        <Typography variant="paragraph-middle-medium" className="!text-text-primary">
          {label}
        </Typography>
        <Typography variant="paragraph-small-regular" className="!text-text-tertiary mt-0.5">
          {description}
        </Typography>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0">
      {confirmPopup}
      <ResponsivePopup
        visible={isOpenInvitePopup}
        onClose={handleCloseInvitePopup}
        drawerTitle={
          <div className="flex flex-col">
            <Typography variant="h4">เพิ่มสมาชิกเข้าสาขา</Typography>
            <Typography variant="paragraph-small-regular" className="!text-text-secondary mt-0.5">
              {`ร้าน${displayName} ${branchName}`}
            </Typography>
          </div>
        }
        modalTitle={
          <div className="flex flex-col">
            <Typography variant="h4">เพิ่มสมาชิกเข้าสาขา</Typography>
            <Typography variant="paragraph-middle-regular" className="!text-text-tertiary mt-0.5">
              {`ร้าน${displayName} ${branchName}`}
            </Typography>
          </div>
        }
        modalProps={{
          width: '50%',
          className: '!min-w-[700px]',
        }}
      >
        <InviteMerchantMemberPopup
          key={invitePopupKey}
          merchantUuid={merchant.uuid}
          onClose={handleCloseInvitePopup}
          isLoading={isAddingMembers}
          onSubmit={(selections) =>
            addMembers({
              merchantId: merchant.id,
              members: selections.map(({ id, roleId }) => ({
                userId: id,
                roleId,
              })),
            })
          }
        />
      </ResponsivePopup>
      {/* Edit member popup */}
      <ResponsivePopup
        visible={!!editingMember}
        onClose={handleCloseEditPopup}
        drawerTitle={<Typography variant="h4">ข้อมูลสมาชิก</Typography>}
        modalTitle={<Typography variant="h4">ข้อมูลสมาชิก</Typography>}
        modalProps={{
          width: '960px',
        }}
        drawerProps={{
          height: '90%',
          destroyOnClose: true,
        }}
      >
        {editingMember && (
          <EditMemberPopup
            key={editPopupKey}
            member={editingMember}
            onClose={handleCloseEditPopup}
            isLoading={isUpdatingMember || isDeletingMember}
            onSubmit={(payload) => updateMember(payload)}
            onDelete={(userUuid) =>
              showConfirm({
                type: 'warn',
                title: 'ยืนยันลบสมาชิก',
                onConfirm: () => deleteMember(userUuid),
              })
            }
          />
        )}
      </ResponsivePopup>
      {/* Header */}
      <div className="flex items-start justify-between pb-6">
        <div>
          <Typography variant="h5" className="!text-text-primary">
            {displayName}
          </Typography>
          <Typography variant="paragraph-middle-regular" className="!text-text-tertiary mt-0.5">
            {branchName}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <CustomButton variant="outlined" color="neutral" onClick={onBack}>
            ยกเลิก
          </CustomButton>
          <CustomButton variant="solid" color="primary" onClick={handleSave}>
            บันทึก
          </CustomButton>
        </div>
      </div>

      <Divider className="!my-0" />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          storeName: merchant.merchantTranslations?.[0]?.name ?? '-',
          branchName: merchant.merchantName ?? '',
        }}
      >
        {/* Status */}
        <SectionRow label="สถานะร้านค้า" description="คุณสามารถแก้ไขสถานะร้านค้าได้ที่นี่">
          <ToggleSwitch
            isChecked={isActive}
            onChange={setIsActive}
            type="text"
            showLabel={false}
            title={'เปิดใช้งาน'}
            supportingText="เป็นร้านค้าสาธารณะ"
          />
        </SectionRow>

        <Divider className="!my-0" />

        {/* Store name & branch */}
        <SectionRow label="ชื่อร้านค้าและสาขา" description="คุณสามารถแก้ไขข้อมูลร้านค้าได้ที่นี่">
          <div className={`grid ${isTablet ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <TextField
              disabled
              name="storeName"
              label={<span>ชื่อร้าน</span>}
              placeholder="ชื่อร้าน"
              required
            />
            <TextField
              name="branchName"
              label={<span>สาขา</span>}
              required
              rules={[{ required: true, message: 'กรุณากรอกชื่อสาขา' }]}
              placeholder="สาขา"
            />
          </div>
        </SectionRow>

        <Divider className="!my-0" />

        {/* Members */}
        <SectionRow label="สมาชิกในร้านค้า" description="คุณสามารถจัดการสมาชิกร้านค้าได้ที่นี่">
          <div className="border border-border-primary rounded-xl flex flex-col justify-between min-h-[500px] gap-4 overflow-x-auto">
            <div className="flex flex-col gap-0 flex-1">
              {/* Table header label */}
              <div className="flex w-full justify-between items-center bg-white py-4">
                <div className="flex items-center gap-3 px-4 pt-4">
                  <Typography variant="paragraph-middle-medium" className="!text-text-primary">
                    รายการสมาชิก
                  </Typography>
                  <BadgeLabel
                    text={`ทั้งหมด ${totalMembers} คน`}
                    variant="ghost"
                    rounding="pill"
                    size="middle"
                  />
                </div>
                <CustomButton
                  className="ml-auto mr-4 mt-2"
                  color="primary"
                  size="small"
                  variant="outlined"
                  icon={<i className="ri-user-add-line text-base" />}
                  onClick={() => setIsOpenInvitePopup(true)}
                >
                  เพิ่มสมาชิก
                </CustomButton>
              </div>

              <Table
                columns={columns}
                dataSource={merchantMembers}
                rowKey={(record) => record.users.uuid}
                pagination={false}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <div className="py-16">
                      <Typography
                        variant="paragraph-middle-regular"
                        className="!text-text-placeholder"
                      >
                        ไม่มีข้อมูลสมาชิก
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
                  [&_.ant-table-thead>tr>th]:!bg-background-secondary
                  [&_.ant-table-thead>tr>th::before]:!hidden
                  [&_.ant-table-container]:!border-none
                  [&_.ant-table-content]:!border-none
                  [&_.ant-table-tbody>tr]:!border-none
                  [&_td.ant-table-cell]:!bg-white
                  [&_td.ant-table-cell]:!px-4
                  [&_td.ant-table-cell]:!py-4
                "
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 pb-4">
              <Typography variant="paragraph-small-regular" className="!text-text-secondary">
                แสดง {totalPages === 0 ? 0 : Math.min((page - 1) * pageSize + 1, totalPages)}-
                {Math.min(page * pageSize, totalPages)} จาก {totalPages} รายการ
              </Typography>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalPages}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          </div>
        </SectionRow>
      </Form>
    </div>
  );
};
