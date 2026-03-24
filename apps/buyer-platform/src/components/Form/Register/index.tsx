'use client';

import React from 'react';
import { Form, FormInstance } from 'antd';
import Typography from '../../Typography';
import TextField from '../../DataEntry/TextField';
import Button from '../../Button';
import Image from 'next/image';

interface FormRegisterProps {
  loading?: boolean;
  onLoginClick?: () => void;
  onFinish?: (values: { phoneNumber: string }) => Promise<void>;
  registerForm: FormInstance<{ phoneNumber: string }>;
}

const FormRegister: React.FC<FormRegisterProps> = ({
  loading = false,
  onLoginClick,
  onFinish: onFinishProp,
  registerForm,
}) => {
  const onFinish = async (values: { phoneNumber: string }) => {
    if (onFinishProp) {
      await onFinishProp(values);
      return;
    }
  };

  const handleLoginClick = () => {
    registerForm.resetFields();
    onLoginClick?.();
  };

  return (
    <Form
      form={registerForm}
      className="w-full sm:w-[368px]"
      onFinish={onFinish}
      layout="vertical"
      clearOnDestroy
    >
      <div className="flex justify-center items-center mb-8">
        <Image
          src="/logo.svg"
          alt="Allkons Logo"
          className="mx-auto"
          width={190}
          height={32}
        />
      </div>
      <Typography variant="paragraph-small" className="!text-text-quinary">
        ยินดีต้อนรับสู่ Allkons
      </Typography>
      <Typography
        variant="h3"
        className="!text-text-secondary pb-8 !text-xl md:!text-2xl"
      >
        สมัครสมาชิกกับเรา
      </Typography>
      <div className="mt-6">
        <TextField
          label="หมายเลขโทรศัพท์"
          name="phoneNumber"
          className="mt-6"
          maxLength={10}
          type="tel"
          placeholder="เบอร์โทร 10 หลัก"
          rules={[
            { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
            {
              pattern: /^0[689]\d{8}$/,
              message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
            },
          ]}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9]/g, ''); // Allow only numeric input
          }}
        />
      </div>
      <div className="flex items-center my-6">
        <Typography variant="paragraph-small">
          หากท่านเคยมีบัญชีอยู่แล้ว เข้าสู่ระบบที่นี่
        </Typography>
        <Button
          variant="link"
          bold="500"
          onClick={handleLoginClick}
          className="!px-2"
        >
          เข้าสู่ระบบ
        </Button>
      </div>
      <Form.Item shouldUpdate>
        {() => (
          <Button
            htmlType="submit"
            fullWidth
            loading={loading}
            disabled={
              !registerForm.isFieldsTouched(true) ||
              !!registerForm
                .getFieldsError()
                .filter(({ errors }) => errors.length).length
            }
          >
            สมัครใช้งาน
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default FormRegister;
