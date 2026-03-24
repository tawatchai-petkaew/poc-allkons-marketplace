'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce.hook';
import { useQuery } from '@tanstack/react-query';
import Typography from '@/components/Typography';
import { formatFullName, hashPhone } from '@/utils/format';
import SelectField from '@/components/DataEntry/Select';
import SectionIcon from '@/components/Section/SectionIcon';
import { IAvailableMerchantMember } from '@/interfaces/merchant/merchant.response.interface';
import { getAvailableUsersForMerchant } from '@/api/merchant.api';
import { getRoleList } from '@/api/role.api';
import CustomButton from '@/components/Button';
import { Alert, Divider } from 'antd';
import { RoleType } from '@/constants/enum/role.enum';

export interface InviteMerchantMemberPopupProps {
  merchantUuid: string;
  onClose: () => void;
  onSubmit?: (selections: { id: number; roleId: number }[]) => void;
  isLoading?: boolean;
}

export default function InviteMerchantMemberPopup({
  merchantUuid,
  onClose,
  onSubmit,
  isLoading = false,
}: InviteMerchantMemberPopupProps) {
  const [selectedMembers, setSelectedMembers] = useState<IAvailableMerchantMember[]>([]);
  const [roleSelections, setRoleSelections] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 200);

  const { data: availableMembersData, isFetching: isFetchingMembers } = useQuery({
    queryKey: ['availableMerchantMembers', merchantUuid, debouncedSearch],
    queryFn: () => getAvailableUsersForMerchant(merchantUuid, 1, 100, debouncedSearch),
    enabled: !!merchantUuid,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roleList'],
    queryFn: () => getRoleList({ page: 1, pageLimit: 100 }),
  });

  const availableMembers: IAvailableMerchantMember[] = availableMembersData?.data?.items ?? [];

  const roleOptions = (rolesData?.data?.roles ?? [])
    .filter((r) => r.name !== RoleType.OWNER)
    .map((r) => ({
      value: r.id,
      label: r.displayName,
    }));

  const filteredOptions = availableMembers.filter(
    (m) => !selectedMembers.some((s) => s.id === m.id)
  );

  const handleSelect = (vals: number[]) => {
    const updatedRoleSelections: Record<number, number> = { ...roleSelections };
    const defaultRoleId = roleOptions[0]?.value;

    const updatedSelectedMembers = vals
      .map((id) => {
        const member =
          availableMembers.find((m) => m.id === id) ?? selectedMembers.find((m) => m.id === id);
        if (!updatedRoleSelections[id] && member) {
          updatedRoleSelections[id] = defaultRoleId;
        }
        return member!;
      })
      .filter(Boolean);
    setRoleSelections(updatedRoleSelections);
    setSelectedMembers(updatedSelectedMembers);
    setSearch('');
    setDropdownOpen(false);
  };

  const handleRemove = (id: number) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
    setRoleSelections((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setRoleSelections({});
    setSearch('');
    setDropdownOpen(false);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Search select */}
      <SelectField
        mode="multiple"
        showSearch
        autoClearSearchValue={false}
        filterOption={false}
        value={selectedMembers.map((m) => m.id)}
        searchValue={search}
        onSearch={(val) => {
          setSearch(val);
          setDropdownOpen(true);
        }}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        onChange={handleSelect}
        prefix={<i className="ri-search-line text-base" />}
        placeholder="ค้นหา ชื่อหรือเบอร์โทรศัพท์"
        tagRender={() => <></>}
        className="[&_.ant-select-selection-placeholder]:!flex [&_.ant-select-selection-placeholder]:!items-center"
        loading={isFetchingMembers}
        notFoundContent={
          isFetchingMembers ? (
            <div className="py-4 text-center">
              <Typography variant="paragraph-small-regular" className="!text-text-placeholder">
                กำลังค้นหา...
              </Typography>
            </div>
          ) : search ? (
            <div className="py-4 text-center">
              <Typography variant="paragraph-small-regular" className="!text-text-placeholder">
                ไม่พบสมาชิก
              </Typography>
            </div>
          ) : null
        }
        options={filteredOptions.map((m) => ({
          value: m.id,
          label: formatFullName(
            m.users.firstNameTh,
            m.users.lastNameTh,
            m.users.middleNameTh ?? undefined
          ),
        }))}
      />

      {/* Body */}
      <div className="h-[400px] overflow-y-auto">
        {selectedMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-[3rem]">
            <div className="w-14 h-14 rounded-full bg-background-secondary flex items-center justify-center">
              <SectionIcon iconClass="ri-search-line" />
            </div>
            <Typography
              variant="paragraph-middle-regular"
              className="!text-text-placeholder !-mt-2"
            >
              เริ่มพิมพ์เพื่อค้นหาสมาชิก
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col">
            {selectedMembers.length >= 10 && (
              <Alert description="เพิ่มพร้อมกันสูงสุด 10 รายการ" type="warning" showIcon />
            )}
            <Divider className="my-3" />
            {selectedMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                {/* Left: name + phone */}
                <div className="flex flex-col">
                  <Typography variant="paragraph-small-medium" className="!text-text-primary">
                    {formatFullName(
                      m.users.firstNameTh,
                      m.users.lastNameTh,
                      m.users.middleNameTh ?? undefined
                    )}
                  </Typography>
                  <Typography variant="paragraph-small-regular" className="!text-text-tertiary">
                    {hashPhone(m.users.phoneNumber)}
                  </Typography>
                </div>

                {/* Right: role select + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <SelectField
                    value={roleSelections[m.id]}
                    onChange={(val) =>
                      setRoleSelections((prev) => ({
                        ...prev,
                        [m.id]: val as number,
                      }))
                    }
                    options={roleOptions}
                    size="middle"
                    style={{ width: 260 }}
                  />
                  <CustomButton
                    variant="outlined"
                    color="error"
                    size="small"
                    icon={<i className="ri-subtract-line text-base" />}
                    onClick={() => handleRemove(m.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <CustomButton variant="outlined" color="neutral" onClick={handleClose}>
          ยกเลิก
        </CustomButton>
        <CustomButton
          variant="solid"
          color="primary"
          loading={isLoading}
          disabled={selectedMembers.length === 0 || isLoading}
          onClick={() =>
            onSubmit?.(
              selectedMembers.map((m) => ({
                id: m.users.id,
                roleId: roleSelections[m.id],
              }))
            )
          }
        >
          เพิ่มสมาชิก
        </CustomButton>
      </div>
    </div>
  );
}
