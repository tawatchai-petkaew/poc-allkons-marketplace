'use client';

import React from 'react';
import { Form, FormInstance } from 'antd';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import TextField from '@/components/DataEntry/TextField';
import Checkbox from '@/components/DataEntry/Checkbox';
import { Label } from '@/components/Label';
import { ProfileFormFields } from '../types';

export interface SetProfileStepProps {
  profileForm: FormInstance<ProfileFormFields>;
  loading?: boolean;
  onFinish: (values: ProfileFormFields) => void;
  onBack?: () => void;
  telNumber?: string;
}

const SetProfileStep: React.FC<SetProfileStepProps> = ({
  profileForm,
  loading,
  onFinish,
  telNumber,
}) => {
  return (
    <Form
      form={profileForm}
      className="w-full md:w-[600px] h-full relative"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        telNumber: telNumber || '',
        consent: false,
      }}
    >
      <div className="flex justify-between sticky top-0">
        <div>
          <Typography
            variant="h4"
            className="!text-text-primary !text-xl md:!text-2xl"
          >
            ลงทะเบียน
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-tertiary"
          >
            กรุณากรอกข้อมูลเกี่ยวกับคุณ
          </Typography>
        </div>
        <Label
          text="ขั้นตอน 1/2"
          size="small"
          variant="ghost"
          rounding="pill"
        />
      </div>

      <div className="mt-6">
        <div className="max-h-[calc(100vh_-_350px)] md:max-h-[462px] overflow-y-auto mt-6 px-0 md:px-4">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
          >
            ข้อมูลส่วนตัว
          </Typography>
          <div className="flex flex-col mt-2 gap-4">
            <TextField
              name="firstName"
              label="ชื่อ"
              placeholder="กรุณากรอกชื่อ"
              rules={[
                { required: true, message: 'กรุณากรอกชื่อ' },
                {
                  max: 50,
                  message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                },
                {
                  pattern: /^[a-zA-Zก-๙\s]+$/,
                  message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                },
              ]}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\s/g, '');
              }}
            />
            <TextField
              name="midName"
              label="ชื่อกลาง (ถ้ามี)"
              placeholder="กรุณากรอกชื่อกลาง"
              rules={[
                {
                  max: 50,
                  message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                },
                {
                  pattern: /^[a-zA-Zก-๙\s]*$/,
                  message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                },
              ]}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\s/g, '');
              }}
            />
            <TextField
              name="lastName"
              label="นามสกุล"
              placeholder="กรุณากรอกนามสกุล"
              rules={[
                { required: true, message: 'กรุณากรอกนามสกุล' },
                {
                  max: 50,
                  message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                },
                {
                  pattern: /^[a-zA-Zก-๙\s]+$/,
                  message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                },
              ]}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\s/g, '');
              }}
            />
            <TextField
              name="telNumber"
              label="เบอร์โทรศัพท์"
              required
              disabled
            />
            <TextField
              name="email"
              label="อีเมล"
              placeholder="กรุณากรอกอีเมล"
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกอีเมล',
                },
                {
                  type: 'email',
                  message: 'รูปแบบอีเมลไม่ถูกต้อง',
                },
                {
                  max: 100,
                  message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)',
                },
              ]}
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <Checkbox name="consent" label="ยอมรับ" size="small" />
              <span
                className="text-primary cursor-pointer underline mr-1"
                onClick={() => window.open('/terms', '_blank')}
              >
                เงื่อนไขการให้บริการ
              </span>{' '}
              และ{' '}
              <span
                className="text-primary cursor-pointer underline ml-1"
                onClick={() => window.open('/privacy#privacy', '_blank')}
              >
                นโยบายความเป็นส่วนตัว
              </span>
            </div>
            <div className="flex items-center">
              <Checkbox name="consentMarketing" label="ยอมรับ" size="small" />
              <span
                className="text-primary cursor-pointer underline mr-1"
                onClick={() => window.open('/marketing', '_blank')}
              >
                การนำข้อมูลไปใช้เพื่อการตลาด
              </span>{' '}
            </div>
          </div>
        </div>
      </div>

      {/* submit button */}
      <div className="absolute bottom-0 w-full">
        <Form.Item className="!mb-0">
          <Form.Item shouldUpdate noStyle>
            {({ getFieldsError, getFieldValue }) => {
              const hasErrors = getFieldsError().some(
                ({ errors }) => errors.length
              );
              const requiredFields: (keyof ProfileFormFields)[] = [
                'firstName',
                'lastName',
              ];
              const hasEmptyFields = requiredFields.some(
                (field) => !getFieldValue(field)
              );
              const consentValue = getFieldValue('consent');

              return (
                <Button
                  htmlType="submit"
                  fullWidth
                  disabled={
                    hasErrors || hasEmptyFields || !consentValue || loading
                  }
                  loading={loading}
                  bold="600"
                >
                  ถัดไป
                </Button>
              );
            }}
          </Form.Item>
        </Form.Item>
      </div>
    </Form>
  );
};

export default SetProfileStep;
