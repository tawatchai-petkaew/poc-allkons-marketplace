'use client';

import { Form, FormInstance, Input, Spin } from 'antd';
import Typography from '../../Typography';
import { useState, useEffect } from 'react';
import Button from '../../Button';
import SectionIcon from '../../Sections/SectionIcon';

interface FormOtpProps {
  loading?: boolean;
  onFinish?: (values: { otp: string }) => Promise<void>;
  telNumber?: string | null;
  otpForm: FormInstance<{ otp: string }>;
  otpData?: { token: string; refNo: string };
  resendOtp?: () => void;
  isSuccessResendOtp?: boolean;
}

const FormOtp: React.FC<FormOtpProps> = ({
  otpForm,
  onFinish: onFinishProp,
  telNumber,
  loading,
  otpData,
  resendOtp,
  isSuccessResendOtp,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [disabledButton, setDisabledButton] = useState(true);

  useEffect(() => {
    if (isSuccessResendOtp) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(0);
    }
  }, [isSuccessResendOtp]);

  const onFinish = async (values: { otp: string }) => {
    if (onFinishProp) {
      await onFinishProp(values);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabledButton && !loading) {
      e.preventDefault();
      otpForm.submit();
    }
  };

  return (
    <Form
      form={otpForm}
      className="w-full sm:w-[368px]"
      onFinish={onFinish}
      layout="vertical"
      clearOnDestroy
    >
      <SectionIcon
        iconClass="ri-lock-password-fill"
        type="success"
        loading={loading}
      />
      <div className="mt-6 text-center">
        <Typography variant="h5" className="!text-text-secondary">
          กรุณากรอกรหัสยืนยัน (OTP)
        </Typography>
        <Typography variant="paragraph-medium" className="!text-text-quinary">
          ที่ส่งไปยัง{' '}
          <span className="text-primary font-medium">
            {telNumber?.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}
          </span>{' '}
          รหัสอ้างอิง {otpData?.refNo}
        </Typography>
      </div>
      <Form.Item
        name="otp"
        rules={[
          { required: true, message: 'กรุณากรอกรหัส OTP' },
          {
            pattern: /^\d{6}$/,
            message: 'OTP ต้องเป็นตัวเลข 6 หลัก!',
          },
        ]}
        className="text-center !mt-6"
      >
        <Input.OTP
          size="large"
          className="text-center"
          type="tel"
          style={{ flex: 'none' }}
          onInput={(e) => {
            const filteredInput = e.filter((char) => char !== '');
            if (filteredInput.length === 6) {
              setDisabledButton(false);
            } else {
              setDisabledButton(true);
            }
          }}
          onKeyPress={(e) => {
            if (!/^\d$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </Form.Item>
      <div
        className={`text-center ${
          otpForm.getFieldError('otp').length ? 'mt-12' : 'mt-6'
        }`}
      >
        {countdown > 0 ? (
          <>
            <Typography
              variant="paragraph-small"
              className="!text-text-quinary"
            >
              OTP ใหม่ถูกส่งไปยังเบอร์ของคุณแล้ว
            </Typography>
            <Typography
              variant="paragraph-small"
              className="!text-text-quinary"
            >
              ขอรหัสใหม่ในอีก{' '}
              <span className="text-primary font-semibold">
                ({countdown} วินาที)
              </span>
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="paragraph-small"
              className="!text-text-quinary"
            >
              หากยังไม่ได้รับรหัสยืนยัน (OTP) กรุณากดขอรหัสใหม่
            </Typography>
            <Button
              variant="link"
              onClick={() => {
                if (resendOtp) {
                  setDisabledButton(true);
                  resendOtp();
                }
              }}
              size="small"
            >
              ขอรหัสใหม่
            </Button>
          </>
        )}
      </div>

      <Form.Item shouldUpdate className="!mt-6">
        {() => {
          return (
            <Button
              htmlType="submit"
              fullWidth
              loading={loading}
              disabled={disabledButton}
            >
              ยืนยัน
            </Button>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default FormOtp;
