'use client';

import React, { useMemo, useState } from 'react';
import { Form, FormInstance, Checkbox } from 'antd';
import { useQuery } from '@tanstack/react-query';
import Button from '@/components/Button';
import Select from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import {
  checkTaxId,
  getJuristicTypeList,
} from '@/common/api/customer-service/organization.api';
import { isValidThaiJuristicId } from '@/utils/validate';
import { OrganizationFormFields } from '../../types';
import { businessTypeList } from '@/common/constants/organization';

const CheckboxGroup = Checkbox.Group;
interface JuristicOrganizationFormProps {
  form: FormInstance<OrganizationFormFields>;
  isSuccessCheckTaxId: boolean;
  setIsSuccessCheckTaxId: (value: boolean) => void;
}

export const JuristicOrganizationForm: React.FC<
  JuristicOrganizationFormProps
> = ({ form, isSuccessCheckTaxId, setIsSuccessCheckTaxId }) => {
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);
  const [isFieldsDisabled, setIsFieldsDisabled] = useState(false);

  const juristicTypeValue = Form.useWatch('juristicType', form);
  const businessTypeValue = Form.useWatch('businessType', form);

  const { data: juristicTypeList } = useQuery({
    queryKey: ['juristicTypeList'],
    queryFn: async () => {
      const response = await getJuristicTypeList();
      return response.data;
    },
  });

  const juristicTypeOptions = juristicTypeList
    ?.map((item: any) => ({
      label: item.label,
      value: item.value,
    }))
    .reverse()
    .filter((item: any) => item.value !== 'PERSONAL');

  const prefix = useMemo(() => {
    return juristicTypeList?.find(
      (item: any) => item.value === juristicTypeValue
    )?.prefix;
  }, [juristicTypeValue, juristicTypeList]);

  const suffix = useMemo(() => {
    return juristicTypeList?.find(
      (item: any) => item.value === juristicTypeValue
    )?.subfix;
  }, [juristicTypeValue, juristicTypeList]);

  const handleCheckTaxId = async () => {
    const taxIdValue = form.getFieldValue('taxId') || '';
    const isValid = isValidThaiJuristicId(taxIdValue);

    if (!isValid || taxIdValue.length !== 13) {
      form.setFields([
        {
          name: 'taxId',
          errors: ['เลขประจำตัวนิติบุคคลไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckTaxId(false);
      return;
    }

    try {
      setIsCheckingTaxId(true);
      const { data } = await checkTaxId({
        taxId: taxIdValue,
        organizeBranchNumber: '00000',
      });
      if (data.status === 'DISSOLVED') {
        setIsSuccessCheckTaxId(false);
        form.setFields([
          {
            name: 'taxId',
            errors: ['เลขประจำตัวนิติบุคคลนี้เลิกกิจการแล้ว'],
          },
        ]);
      } else {
        form.setFieldsValue({
          juristicType: data.juristicType.value,
          juristicTypeId: juristicTypeList.find(
            (juristic: any) => juristic.value === data.juristicType.value
          )?.id,
          juristicName: data.organizeName,
          remarkTypeOther:
            juristicTypeList.find(
              (juristic: any) => juristic.value === data.juristicType.value
            )?.value === 'OTHER'
              ? data.juristicType.otherValue
              : '',
          branchName: data.branchName || 'สำนักงานใหญ่',
          branchType: 'HEAD_OFFICE',
          branchNumber: '00000',
          // Store DBD address data for createOrganizationAddress API
          dbdAddress: data.address
            ? {
                address: data.address.address || '',
                subDistrictId: data.address.subdistrictId || '',
                districtId: data.address.districtId || '',
                provinceId: data.address.provinceId || '',
                zipCode: data.address.zipCode || '',
              }
            : undefined,
        });
        setIsSuccessCheckTaxId(true);
        setIsFieldsDisabled(true);
      }
    } catch (error: any) {
      if (error.response?.data?.data?.exists) {
        setIsSuccessCheckTaxId(false);
        form.setFields([
          {
            name: 'taxId',
            errors: ['เลขประจำตัวนิติบุคคลถูกใช้สมัครแล้ว'],
          },
        ]);
      } else {
        // Allow form submission when API error is not about duplicate tax ID
        setIsSuccessCheckTaxId(true);
      }
    } finally {
      setIsCheckingTaxId(false);
    }
  };

  const handleChangeTaxId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ taxId: value });

    // If was previously successful, reset the prefilled fields
    if (isSuccessCheckTaxId) {
      form.setFieldsValue({
        juristicType: 'LIMITED_COMPANY',
        juristicTypeId: undefined,
        juristicName: '',
        remarkTypeOther: '',
        branchName: 'สำนักงานใหญ่',
        branchType: 'HEAD_OFFICE',
        branchNumber: '00000',
        dbdAddress: undefined,
      });
    }
    setIsSuccessCheckTaxId(false);
    setIsFieldsDisabled(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Form.Item
        name="businessType"
        label="ประเภทธุรกิจ"
        rules={[
          {
            required: true,
            message: 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 รายการ',
          },
        ]}
        className="!mb-0"
        required={false}
      >
        <CheckboxGroup
          name="businessType"
          options={businessTypeList.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          className="flex flex-col gap-2"
        />
      </Form.Item>

      {businessTypeValue?.includes('OTHER') && (
        <TextField
          name="businessTypeDescription"
          label="ระบุประเภทธุรกิจอื่นๆ"
          placeholder="กรุณาระบุประเภทธุรกิจ"
          rules={[
            {
              required: true,
              message: 'กรุณาระบุประเภทธุรกิจอื่นๆ',
            },
            {
              max: 100,
              message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)',
            },
          ]}
        />
      )}
      <div className="flex items-center gap-2">
        <div className="w-full">
          <TextField
            name="taxId"
            label="เลขประจำตัวนิติบุคคล"
            placeholder="กรุณากรอกเลขประจำตัวนิติบุคคล"
            onChange={handleChangeTaxId}
            rules={[
              {
                required: true,
                message: 'กรุณากรอกเลขประจำตัวนิติบุคคล',
              },
            ]}
            maxLength={13}
            className={`${
              isSuccessCheckTaxId && !form.getFieldError('taxId').length
                ? 'border !border-primary'
                : ''
            }`}
            suffix={
              <>
                {form.getFieldError('taxId')[0] && (
                  <i className="ri-information-line text-error"></i>
                )}
                {isSuccessCheckTaxId && !form.getFieldError('taxId').length && (
                  <i className="ri-check-line text-primary"></i>
                )}
              </>
            }
            validateStatus={
              form.getFieldError('taxId').length > 0
                ? 'error'
                : isSuccessCheckTaxId
                  ? 'success'
                  : ''
            }
            help={
              form.getFieldError('taxId').length > 0
                ? form.getFieldError('taxId')[0]
                : isSuccessCheckTaxId
                  ? 'สามารถใช้เลขประจำตัวนิติบุคคลได้'
                  : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขประจำตัวนิติบุคคล'
            }
          />
        </div>
        <div className="mt-2">
          <Button
            onClick={handleCheckTaxId}
            loading={isCheckingTaxId}
            disabled={isSuccessCheckTaxId}
          >
            {isSuccessCheckTaxId ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
          </Button>
        </div>
      </div>
      {/* Hidden fields for branchType and branchNumber */}
      <Form.Item name="branchType" noStyle />
      <Form.Item name="branchNumber" noStyle />
      {/* {isSuccessCheckTaxId && ( */}
      <>
        <Select
          name="juristicType"
          label="ประเภทนิติบุคคล"
          options={juristicTypeOptions}
          placeholder="กรุณาเลือกประเภทนิติบุคคล"
          disabled={isFieldsDisabled}
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
          rules={[
            {
              required: true,
              message: 'กรุณาเลือกประเภทนิติบุคคล',
            },
          ]}
          onChange={(value) => {
            const juristicTypeId = juristicTypeList.find(
              (juristic: any) => juristic.value === value
            )?.id;
            form.setFieldsValue({
              juristicTypeId: juristicTypeId,
            });
          }}
        />
        <Form.Item name="juristicTypeId" noStyle />
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const juristicType = getFieldValue('juristicType');
            if (juristicType === 'OTHER') {
              return (
                <TextField
                  name="remarkTypeOther"
                  label="ประเภทนิติบุคคล"
                  placeholder="กรุณากรอกประเภทนิติบุคคล"
                  disabled={isFieldsDisabled}
                  rules={[
                    {
                      required: true,
                      message: 'กรุณากรอกประเภทนิติบุคคล',
                    },
                    {
                      pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                      message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                    },
                    {
                      max: 50,
                      message:
                        'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                    },
                    {
                      validator: (_: unknown, value: string) => {
                        if (value && value.trim() === '') {
                          return Promise.reject('กรุณากรอกประเภทนิติบุคคล');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.startsWith(' ')) {
                      target.value = target.value.trimStart();
                    }
                  }}
                />
              );
            }
            return null;
          }}
        </Form.Item>
        <TextField
          name="juristicName"
          label="ชื่อองค์กร"
          placeholder="กรุณากรอกชื่อองค์กร"
          addonBefore={prefix}
          addonAfter={suffix}
          disabled={isFieldsDisabled}
          rules={[
            {
              required: true,
              message: 'กรุณากรอกชื่อองค์กร',
            },
          ]}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.value.startsWith(' ')) {
              target.value = target.value.trimStart();
            }
          }}
        />
        {/* Hidden field for branchName - auto-set to สำนักงานใหญ่ */}
        <TextField
          label="ชื่อสาขา"
          name="branchName"
          disabled
          rules={[
            {
              required: true,
              message: 'กรุณากรอกชื่อสาขา',
            },
          ]}
        />
      </>
      <Form.Item name="dbdAddress" noStyle />
      {/* )} */}
    </div>
  );
};
