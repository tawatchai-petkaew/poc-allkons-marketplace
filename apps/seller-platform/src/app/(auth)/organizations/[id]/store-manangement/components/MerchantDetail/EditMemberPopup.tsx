"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Form } from "antd";
import { getRoleList } from "@/api/role.api";
import SelectField from "@/components/DataEntry/Select";
import TextField from "@/components/DataEntry/TextField";
import CustomButton from "@/components/Button";
import Typography from "@/components/Typography";
import { IMerchantMember } from "@/interfaces/merchant/merchant.response.interface";
import { hashName, hashPhone, formatPhone } from "@/utils/format";
import { RoleType } from "@/constants/enum/role.enum";

export interface EditMemberPopupProps {
  member: IMerchantMember;
  onClose: () => void;
  onSubmit?: (payload: { userUuid: string; roleId: number }) => void;
  onDelete?: (userUuid: string) => void;
  isLoading?: boolean;
}

export default function EditMemberPopup({
  member,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
}: EditMemberPopupProps) {
  const [form] = Form.useForm();
  const [roleId, setRoleId] = useState<number>(member.role.id);
  const [visible, setVisible] = useState({
    firstName: false,
    middleName: false,
    lastName: false,
    phone: false,
    email: false,
  });

  const toggle = (field: keyof typeof visible) =>
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const { data: rolesData } = useQuery({
    queryKey: ["roleList"],
    queryFn: () => getRoleList({ page: 1, pageLimit: 100 }),
  });

  const roleOptions = (rolesData?.data?.roles ?? [])
    .filter((r) => r.name !== RoleType.OWNER)
    .map((r) => ({
      value: r.id,
      label: r.displayName,
    }));

  const { firstNameTh, middleNameTh, lastNameTh, phoneNumber, email } =
    member.users;

  const eyeIcon = (field: keyof typeof visible) => (
    <i
      className={`${visible[field] ? "ri-eye-line" : "ri-eye-off-line"} cursor-pointer text-icon-tertiary`}
      onClick={() => toggle(field)}
    />
  );

  const hashEmail = (val: string) => {
    const [local, domain] = val.split("@");
    if (!domain) return val;
    const hashed =
      local.charAt(0) +
      "*".repeat(Math.max(0, local.length - 2)) +
      (local.length > 1 ? local.charAt(local.length - 1) : "");
    return `${hashed}@${domain}`;
  };

  const isChanged = roleId !== member.role.id;

  return (
    <div className="flex flex-col gap-0 pb-[72px] relative min-h-full mt-3">
      <Form layout="vertical" form={form}>
        {/* ข้อมูลส่วนตัว */}
        <div className="mb-6">
          <Typography
            variant="paragraph-middle-medium"
            className="!text-text-secondary mb-3"
          >
            ข้อมูลส่วนตัว
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <TextField
              disabled
              label="ชื่อ"
              required
              value={
                firstNameTh
                  ? visible.firstName
                    ? firstNameTh
                    : hashName(firstNameTh)
                  : ""
              }
              suffix={eyeIcon("firstName")}
            />
            <TextField
              disabled
              label="ชื่อกลาง"
              value={
                middleNameTh
                  ? visible.middleName
                    ? middleNameTh
                    : hashName(middleNameTh)
                  : ""
              }
              placeholder="กรอกชื่อกลาง"
              suffix={middleNameTh ? eyeIcon("middleName") : undefined}
            />
            <TextField
              disabled
              label="นามสกุล"
              required
              value={
                lastNameTh
                  ? visible.lastName
                    ? lastNameTh
                    : hashName(lastNameTh)
                  : ""
              }
              suffix={eyeIcon("lastName")}
            />
          </div>
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="mb-6">
          <Typography
            variant="paragraph-middle-medium"
            className="!text-text-secondary mb-3"
          >
            ข้อมูลติดต่อ
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <TextField
              disabled
              label="หมายเลขโทรศัพท์"
              required
              value={
                phoneNumber
                  ? visible.phone
                    ? formatPhone(phoneNumber)
                    : hashPhone(phoneNumber)
                  : ""
              }
              suffix={eyeIcon("phone")}
            />
            <TextField
              disabled
              label="อีเมล"
              value={email ? (visible.email ? email : hashEmail(email)) : ""}
              suffix={email ? eyeIcon("email") : undefined}
            />
          </div>
        </div>

        {/* บทบาทสมาชิกในร้านค้า */}
        <div className="mb-6">
          <Typography
            variant="paragraph-middle-medium"
            className="!text-text-secondary mb-3"
          >
            บทบาทสมาชิกในร้านค้า
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <SelectField
              label="บทบาท"
              required
              value={roleId}
              options={roleOptions}
              onChange={(val) => setRoleId(val as number)}
            />
          </div>
        </div>
      </Form>

      {/* Footer */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-end py-4">
        <CustomButton
          loading={isLoading}
          disabled={!isChanged || isLoading}
          onClick={() => onSubmit?.({ userUuid: member.users.uuid, roleId })}
        >
          บันทึก
        </CustomButton>
      </div>
    </div>
  );
}
