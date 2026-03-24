'use client';

import React, { useState } from 'react';
import { Form, FormInstance } from 'antd';
import Typography from '../../Typography';
import TextField from '../../DataEntry/TextField';
import RadioGroup from '../../DataEntry/RadioGroup';
import Button from '../../Button';
import Image from 'next/image';

interface FormLoginProps {
  onFinish: (values: {
    phoneNumber?: string;
    email?: string;
    password?: string;
  }) => void;
  loading?: boolean;
  onRegisterClick?: () => void;
  loginForm: FormInstance<{
    phoneNumber?: string;
    email?: string;
    password?: string;
  }>;
}

const FormLogin: React.FC<FormLoginProps> = ({
  onFinish,
  loading = false,
  onRegisterClick,
  loginForm,
}) => {
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');

  return (
    <Form
      className="w-full sm:w-[368px]"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      layout="vertical"
      clearOnDestroy
      form={loginForm}
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
        className="!text-text-secondary pb-2 !text-xl md:!text-2xl"
      >
        เข้าสู่ระบบเพื่อใช้งาน
      </Typography>

      <div className="flex w-full my-6">
        <RadioGroup
          value={loginType}
          options={[
            {
              label: 'หมายเลขโทรศัพท์',
              value: 'phone',
            },
            {
              label: 'อีเมล',
              value: 'email',
            },
          ]}
          onChange={(e) => {
            setLoginType(e.target.value);
            loginForm.resetFields();
          }}
          useRadioButton={true}
          buttonStyle="solid"
          block
        />
      </div>

      {loginType === 'phone' ? (
        <div className="mt-6">
          <TextField
            label="หมายเลขโทรศัพท์"
            name="phoneNumber"
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
              input.value = input.value.replace(/[^0-9]/g, '');
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <TextField
            name="username"
            label="ชื่อผู้ใช้"
            placeholder="กรอกอีเมลหรือเบอร์โทรศัพท์"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
          />
          <TextField
            name="password"
            type="password"
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          />
        </div>
      )}

      <div className="flex items-center my-6">
        <Typography variant="paragraph-small">
          หากท่านยังไม่เป็นสมาชิก เราแนะนำให้ท่าน
        </Typography>
        <Button
          variant="link"
          bold="500"
          className="!px-2"
          onClick={onRegisterClick}
        >
          สมัครสมาชิก
        </Button>
      </div>
      <Form.Item shouldUpdate>
        {() => (
          <Button
            htmlType="submit"
            fullWidth
            loading={loading}
            // disabled={
            //   !loginForm.isFieldsTouched(true) ||
            //   !!loginForm.getFieldsError().filter(({ errors }) => errors.length)
            //     .length
            // }
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default FormLogin;
