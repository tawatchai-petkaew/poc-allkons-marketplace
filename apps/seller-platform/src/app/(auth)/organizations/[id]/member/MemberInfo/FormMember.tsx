'use client';

import { getRoleList } from '@/api/role.api';
import { IRole } from '@/interfaces/role.interface';
import Button from '@/components/Button';
import Select from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import Typography from '@/components/Typography';
import { formatPhone, hashName, hashPhone } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { Form, FormInstance, Grid } from 'antd';
import { useParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
// Adding missing import for permission
import { customerAPI } from '@/libs/axios';
import { ApiResponse } from '@/types/common.type';

interface PermissionData {
  role?: { name: string };
  isOwner?: boolean;
}

const getMyPermissionOrganization = async (organizeId: number) => {
  const response = await customerAPI.get<ApiResponse<PermissionData>>(`/organizations/${organizeId}/my-permissions`);
  return response.data;
};

export interface IMemberForm {
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  id?: number;
  uuid: string;
}

type FormMemberProps = {
  form: FormInstance<IMemberForm>;
  mode?: 'view' | 'edit';
  onSubmit?: (data: IMemberForm) => void;
  onDelete?: (uuid: string) => void;
  onClose?: () => void;
};

const FormMember: FC<FormMemberProps> = ({
  onClose,
  form,
  mode = 'view',
  onSubmit,
  onDelete,
}) => {
  const params = useParams();
  const { id: organizeId } = params as { id: string };
  const { data } = useQuery({
    queryKey: ['roles-organize'],
    queryFn: () => getRoleList({ page: 1, pageLimit: 9999 }),
  });
  const { data: permissionData } = useQuery({
    queryKey: ['my-permissions-organize'],
    queryFn: () => getMyPermissionOrganization(Number(organizeId)),
  });

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isDisabled = mode === 'view';
  const [isHashed, setIsHashed] = useState({
    firstName: true,
    lastName: true,
    middleName: true,
    phone: true,
    email: true,
  });

  const [, forceUpdate] = useState({});
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [initialValues, setInitialValues] = useState<IMemberForm | null>(null);

  const toggleHash = (
    field: 'firstName' | 'lastName' | 'middleName' | 'phone' | 'email'
  ) => {
    setIsHashed((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    forceUpdate({});
  };
  const roleList = data?.data?.roles || [];

  const currentUserRole = permissionData?.data?.role?.name;

  // Define role hierarchy (higher number = higher privilege)
  const roleHierarchy = roleList.reduce(
    (acc: Record<string, number>, role: IRole) => {
      if (role.name === 'OWNER') {
        acc[role.name] = 4;
      } else if (role.name === 'SUPER_ADMIN') {
        acc[role.name] = 3;
      } else if (role.name === 'ADMIN') {
        acc[role.name] = 2;
      } else {
        acc[role.name] = 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const roleIdValue = Form.useWatch('roleId', form);
  const isOwnerRole = permissionData?.data?.isOwner;
  const isDisabledRole =
    roleList.find((role: IRole) => role.id === roleIdValue)?.name === 'OWNER';
  
  // Filter roles based on current user's role hierarchy
  const getFilteredRoles = () => {
    if (!currentUserRole) return [];

    const currentUserLevel =
      roleHierarchy[currentUserRole as keyof typeof roleHierarchy];

    return roleList.filter((role: IRole) => {
      const roleLevel = roleHierarchy[role.name as keyof typeof roleHierarchy];
      return roleLevel <= currentUserLevel;
    });
  };

  const filteredRoleList = isDisabledRole ? roleList : getFilteredRoles();

  const roleOptions = filteredRoleList.map((role: IRole) => ({
    label: role.displayName,
    value: role.id,
  }));

  useEffect(() => {
    const firstNameValue = form.getFieldValue('firstName');
    const lastNameValue = form.getFieldValue('lastName');
    const middleNameValue = form.getFieldValue('middleName');
    const phoneValue = form.getFieldValue('phone');
    const emailValue = form.getFieldValue('email');
    
    setIsHashed({
      firstName: !!firstNameValue,
      lastName: !!lastNameValue,
      middleName: !!middleNameValue,
      phone: !!phoneValue,
      email: !!emailValue,
    });
  }, [form]);

  // Track form changes to enable/disable submit button
  useEffect(() => {
    if (!initialValues) {
      const currentValues = form.getFieldsValue();
      setInitialValues(currentValues);
    }
  }, [form, initialValues]);

  return (
    <Form
      layout="vertical"
      className="relative"
      form={form}
      scrollToFirstError
      onFinish={(val) => {
        if (onSubmit) onSubmit(val);
      }}
      onValuesChange={() => {
        if (initialValues) {
          const currentValues = form.getFieldsValue();
          const hasChanged = Object.keys(initialValues).some((key) => {
            const initialValue = initialValues[key as keyof IMemberForm];
            const currentValue = currentValues[key as keyof IMemberForm];
            return initialValue !== currentValue;
          });
          setIsFormChanged(hasChanged);
        }
      }}
    >
      <div className="flex md:hidden justify-end">
        <Button
          onClick={() => {
            if (onClose) onClose();
          }}
          variant="outlined"
          className="!px-0"
          color="neutral"
          bold="400"
          icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
        />
      </div>
      <div
        style={{
          paddingBottom: '70px',
        }}
      >
        <div>
          <Typography variant="h4" className="!text-text-primary !mt-3">
            ข้อมูลสมาชิก
          </Typography>
        </div>
        <div className="mt-6">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ข้อมูลส่วนตัว
          </Typography>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Form.Item name="id" noStyle shouldUpdate />
            <Form.Item name="uuid" noStyle shouldUpdate />
            <TextField
              name="firstName"
              label="ชื่อ"
              required
              disabled={isDisabled}
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกชื่อ',
                },
              ]}
              readOnly={isHashed.firstName}
              getValueProps={(value) => ({
                value: isHashed.firstName && value ? hashName(value) : value,
              })}
              placeholder="กรอกชื่อ"
              type="textOnly"
              suffix={
                <i
                  className={
                    isHashed.firstName
                      ? 'ri-eye-off-line cursor-pointer'
                      : 'ri-eye-line cursor-pointer'
                  }
                  onClick={() => toggleHash('firstName')}
                />
              }
            />
            <TextField
              name="middleName"
              label="ชื่อกลาง"
              placeholder="กรอกชื่อกลาง"
              type="textOnly"
              disabled={isDisabled}
              readOnly={isHashed.middleName}
              getValueProps={(value) => ({
                value: isHashed.middleName && value ? hashName(value) : value,
              })}
              suffix={
                <i
                  className={
                    isHashed.middleName
                      ? 'ri-eye-off-line cursor-pointer'
                      : 'ri-eye-line cursor-pointer'
                  }
                  onClick={() => toggleHash('middleName')}
                />
              }
            />

            <TextField
              name="lastName"
              label="นามสกุล"
              required
              disabled={isDisabled}
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกนามสกุล',
                },
              ]}
              getValueProps={(value) => ({
                value: isHashed.lastName && value ? hashName(value) : value,
              })}
              placeholder="กรอกนามสกุล"
              type="textOnly"
              readOnly={isHashed.lastName}
              suffix={
                <i
                  className={
                    isHashed.lastName
                      ? 'ri-eye-off-line cursor-pointer'
                      : 'ri-eye-line cursor-pointer'
                  }
                  onClick={() => toggleHash('lastName')}
                />
              }
            />
          </div>
        </div>
        <div className="mt-6">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ข้อมูลติดต่อ
          </Typography>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <TextField
              placeholder="กรอกหมายเลขโทรศัพท์"
              type="tel"
              disabled
              name="phone"
              label="หมายเลขโทรศัพท์"
              required
              getValueProps={(value) => ({
                value:
                  isHashed.phone && value
                    ? hashPhone(value)
                    : value
                    ? formatPhone(value)
                    : value,
              })}
              suffix={
                <i
                  className={
                    isHashed.phone
                      ? 'ri-eye-off-line cursor-pointer'
                      : 'ri-eye-line cursor-pointer'
                  }
                  onClick={() => toggleHash('phone')}
                />
              }
            />
            <TextField
              name="email"
              label="อีเมล"
              placeholder="กรอกอีเมล"
              type="email"
              disabled={isDisabled}
              readOnly={isHashed.email}
              rules={[
                {
                  type: 'email',
                  message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                },
              ]}
              getValueProps={(value) => {
                if (!value) return { value };
                if (isHashed.email) {
                  const [localPart, domain] = value.split('@');
                  if (!domain) return { value };
                  const hashedLocal =
                    localPart.charAt(0) +
                    '*'.repeat(Math.max(0, localPart.length - 2)) +
                    (localPart.length > 1
                      ? localPart.charAt(localPart.length - 1)
                      : '');
                  return { value: `${hashedLocal}@${domain}` };
                }
                return { value };
              }}
              suffix={
                <i
                  className={
                    isHashed.email
                      ? 'ri-eye-off-line cursor-pointer'
                      : 'ri-eye-line cursor-pointer'
                  }
                  onClick={() => toggleHash('email')}
                />
              }
            />
          </div>
        </div>
        <div className="mt-6">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            บทบาทสมาชิก
          </Typography>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Select
              label="บทบาท"
              name="roleId"
              placeholder="เลือกบทบาท"
              options={roleOptions}
              required
              disabled={isDisabled || (isOwnerRole ? false : isDisabledRole)}
              rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
            />
          </div>
        </div>
      </div>
      {mode === 'edit' && (
        <div className="fixed md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex gap-3 justify-end bg-white py-4 pr-4 md:pr-0">
          {!isOwnerRole && (
            <Button
              color="error"
              variant="ghost"
              icon={<i className="ri-delete-bin-6-line"></i>}
              fullWidth={isMobile}
               onClick={() => {
                if (onDelete && form.getFieldValue('uuid'))
                  onDelete(form.getFieldValue('uuid'));
              }}
            >
              ลบออกจากองค์กร
            </Button>
          )}
          <Form.Item noStyle>
            <Button
              htmlType="submit"
              bold="600"
              fullWidth={isMobile}
              disabled={!isFormChanged}
            >
              บันทึก
            </Button>
          </Form.Item>
        </div>
      )}
    </Form>
  );
};

export default FormMember;
