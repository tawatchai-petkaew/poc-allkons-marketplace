'use client';

import React, { useState } from 'react';
import { FormInstance, Form } from 'antd';
import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import { checkIdCard } from '@/common/api/customer-service/user.api';
import { idCardCheck } from '@/utils/validate';
import { OrganizationFormFields } from '../../types';
interface PersonalOrganizationFormProps {
  form: FormInstance<OrganizationFormFields>;
  isSuccessCheckIdCard: boolean;
  setIsSuccessCheckIdCard: (value: boolean) => void;
}

export const PersonalOrganizationForm: React.FC<
  PersonalOrganizationFormProps
> = ({ form, isSuccessCheckIdCard, setIsSuccessCheckIdCard }) => {
  const [isCheckingIdCard, setIsCheckingIdCard] = useState(false);

  const handleChangeIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ idCard: value });
    setIsSuccessCheckIdCard(false);
  };

  const handleCheckIdCard = async () => {
    const value = form.getFieldValue('idCard') || '';
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      form.setFields([
        {
          name: 'idCard',
          errors: ['เลขประจำตัวประชาชนไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckIdCard(false);
      return;
    }

    try {
      setIsCheckingIdCard(true);
      const { data } = await checkIdCard({ idCard: value });
      if (data && data.exists === true) {
        form.setFields([
          {
            name: 'idCard',
            errors: ['เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว'],
          },
        ]);
        setIsSuccessCheckIdCard(false);
      } else if (data && data.exists === false) {
        setIsSuccessCheckIdCard(true);
      }
    } catch (error) {
      setIsSuccessCheckIdCard(false);
      form.setFields([
        {
          name: 'idCard',
          errors: [
            'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี',
          ],
        },
      ]);
    } finally {
      setIsCheckingIdCard(false);
    }
  };

  const businessTypeValue = Form.useWatch('businessType', form);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-full">
          <TextField
            name="idCard"
            label="เลขประจำตัวประชาชน"
            placeholder="กรุณากรอกเลขประจำตัวประชาชน"
            onChange={handleChangeIdCard}
            rules={[
              {
                required: true,
                message: 'กรุณากรอกเลขประจำตัวประชาชน',
              },
            ]}
            maxLength={13}
            className={`${
              isSuccessCheckIdCard && !form.getFieldError('idCard').length
                ? 'border !border-primary'
                : ''
            }`}
            suffix={
              <>
                {form.getFieldError('idCard')[0] ===
                  'เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว' && (
                  <i className="ri-information-line text-error"></i>
                )}
                {isSuccessCheckIdCard &&
                  !form.getFieldError('idCard').length && (
                    <i className="ri-check-line text-primary"></i>
                  )}
              </>
            }
            validateStatus={
              form.getFieldError('idCard').length > 0
                ? 'error'
                : isSuccessCheckIdCard
                  ? 'success'
                  : ''
            }
            help={
              form.getFieldError('idCard').length > 0
                ? form.getFieldError('idCard')[0]
                : isSuccessCheckIdCard
                  ? 'สามารถใช้เลขประจำตัวประชาชนได้'
                  : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขประจำตัวประชาชน'
            }
          />
        </div>
        <div className="mt-2">
          <Button
            onClick={handleCheckIdCard}
            loading={isCheckingIdCard}
            disabled={isSuccessCheckIdCard}
          >
            {isSuccessCheckIdCard ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
          </Button>
        </div>
      </div>
    </div>
  );
};
