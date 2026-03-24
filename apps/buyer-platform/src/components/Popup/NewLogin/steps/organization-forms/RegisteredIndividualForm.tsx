'use client';

import React, { useState } from 'react';
import { FormInstance, Form, Checkbox } from 'antd';
import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import Typography from '@/components/Typography';
import { checkRegisNumber } from '@/common/api/customer-service/user.api';
import { idCardCheck } from '@/utils/validate';
import { OrganizationFormFields } from '../../types';
import { businessTypeList } from '@/common/constants/organization';

const CheckboxGroup = Checkbox.Group;
interface RegisteredIndividualFormProps {
  form: FormInstance<OrganizationFormFields>;
  isSuccessCheckRegistrationNumber: boolean;
  setIsSuccessCheckRegistrationNumber: (value: boolean) => void;
}

export const RegisteredIndividualForm: React.FC<
  RegisteredIndividualFormProps
> = ({
  form,
  isSuccessCheckRegistrationNumber,
  setIsSuccessCheckRegistrationNumber,
}) => {
  const [isCheckingRegistrationNumber, setIsCheckingRegistrationNumber] =
    useState(false);

  const businessTypeValue = Form.useWatch('businessType', form);

  const handleChangeRegistrationNumber = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    form.setFieldsValue({ registrationNumber: value });
    setIsSuccessCheckRegistrationNumber(false);
  };

  const handleCheckRegistrationNumber = async () => {
    const value = form.getFieldValue('registrationNumber') || '';
    // const isValid = idCardCheck(value);

    // if (!isValid || value.length !== 13) {
    //   form.setFields([
    //     {
    //       name: 'registrationNumber',
    //       errors: ['เลขทะเบียนพาณิชย์ไม่ถูกต้อง'],
    //     },
    //   ]);
    //   setIsSuccessCheckRegistrationNumber(false);
    //   return;
    // }

    try {
      setIsCheckingRegistrationNumber(true);
      const { data } = await checkRegisNumber({ registrationNumber: value });
      if (data && data.exists === true) {
        form.setFields([
          {
            name: 'registrationNumber',
            errors: ['เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว'],
          },
        ]);
        setIsSuccessCheckRegistrationNumber(false);
      } else if (data && data.exists === false) {
        setIsSuccessCheckRegistrationNumber(true);
      }
    } catch (error) {
      setIsSuccessCheckRegistrationNumber(false);
      form.setFields([
        {
          name: 'registrationNumber',
          errors: ['เลขทะเบียนพาณิชย์ไม่ถูกต้อง'],
        },
      ]);
    } finally {
      setIsCheckingRegistrationNumber(false);
    }
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
            name="registrationNumber"
            label="เลขทะเบียนพาณิชย์"
            placeholder="กรุณากรอกเลขทะเบียนพาณิชย์"
            onChange={handleChangeRegistrationNumber}
            rules={[
              {
                required: true,
                message: 'กรุณากรอกเลขทะเบียนพาณิชย์',
              },
            ]}
            maxLength={13}
            className={`${
              isSuccessCheckRegistrationNumber &&
              !form.getFieldError('registrationNumber').length
                ? 'border !border-primary'
                : ''
            }`}
            suffix={
              <>
                {form.getFieldError('registrationNumber')[0] ===
                  'เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว' && (
                  <i className="ri-information-line text-error"></i>
                )}
                {isSuccessCheckRegistrationNumber &&
                  !form.getFieldError('registrationNumber').length && (
                    <i className="ri-check-line text-primary"></i>
                  )}
              </>
            }
            validateStatus={
              form.getFieldError('registrationNumber').length > 0
                ? 'error'
                : isSuccessCheckRegistrationNumber
                  ? 'success'
                  : ''
            }
            help={
              form.getFieldError('registrationNumber').length > 0
                ? form.getFieldError('registrationNumber')[0]
                : isSuccessCheckRegistrationNumber
                  ? 'สามารถใช้เลขทะเบียนพาณิชย์ได้'
                  : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขทะเบียนพาณิชย์'
            }
          />
        </div>
        <div className="mt-2">
          <Button
            onClick={handleCheckRegistrationNumber}
            loading={isCheckingRegistrationNumber}
            disabled={isSuccessCheckRegistrationNumber}
          >
            {isSuccessCheckRegistrationNumber ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
          </Button>
        </div>
      </div>
      <TextField
        name="idCard"
        label={'เลขประจำตัวประชาชน'}
        placeholder={'กรุณากรอกเลขประจำตัวประชาชน'}
        rules={[
          {
            required: true,
            message: 'กรุณากรอกเลขประจำตัวประชาชน',
          },
          {
            validator: (_: unknown, value: string) => {
              if (!value) return Promise.resolve();

              if (!idCardCheck(value)) {
                return Promise.reject('เลขประจำตัวประชาชนไม่ถูกต้อง');
              }
              return Promise.resolve();
            },
          },
        ]}
        maxLength={13}
      />
      <TextField
        name="registrationName"
        label="ชื่อที่ใช้ในการประกอบพาณิชยกิจ"
        placeholder="กรอกชื่อร้าน"
        addonBefore="ร้าน"
        rules={[
          {
            required: true,
            message: 'กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ',
          },
        ]}
      />
    </div>
  );
};
