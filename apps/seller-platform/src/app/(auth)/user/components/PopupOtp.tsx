'use client';

import { sendToken, verifyOtp } from '@/api/auth.api';
import { verifyOtpEmail } from '@/api/user.api';
import Button from '@/components/Button';
import ResponsivePopup from '@/components/Popup';
import SectionIcon from '@/components/Section/SectionIcon';
import Typography from '@/components/Typography';
import usePopup from '@/hooks/usePopup';
import { IAuthRequestVerifyPhoneOtpPayload } from '@/interfaces/auth/auth.request.interface';
import { IAuthResponseVerifyOtp } from '@/interfaces/auth/auth.response.interface';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Form, Input } from 'antd';
import { useEffect, useState } from 'react';

interface IVerifyOtpEmailPayload {
  email: string;
  pin: string;
  refno: string;
}

interface IOtpErrorData {
  remaining?: number;
  blockUntil?: string;
  data?: {
    remaining?: number;
    blockUntil?: string;
  };
}

interface IOtpErrorResponse {
  data?: IOtpErrorData;
}

type PopupOtpProps = {
  visible: boolean;
  onClose: () => void;
  otpData?: { token: string; refNo: string };
  telNumber?: string | null;
  email?: string | null;
  onFinish: (val: IAuthResponseVerifyOtp | { status: string } | null) => void;
  resendOtp?: () => void;
};

const PopupOtp = ({
  visible,
  onClose,
  otpData,
  telNumber,
  email,
  onFinish: onFinishProp,
  resendOtp,
}: PopupOtpProps) => {
  const { showPopup, PopupComponent } = usePopup();
  const [otpForm] = Form.useForm<{ otp: string }>();
  const [isSuccessResendOtp, setIsSuccessResendOtp] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [disabledButton, setDisabledButton] = useState(true);

  const handleOtpError = (error: AxiosError<IOtpErrorResponse>) => {
    const errorData = error.response?.data?.data;
    if (errorData) {
      // Check both nesting levels (same pattern as login page handleOtpError)
      const remaining = errorData?.remaining || errorData?.data?.remaining;
      if (remaining && remaining > 0) {
        otpForm.setFields([
          {
            name: 'otp',
            errors: [`OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ ${remaining} ครั้ง)`],
          },
        ]);
        return;
      }

      const blockUntil = errorData?.blockUntil || errorData?.data?.blockUntil;
      if (blockUntil) {
        onClose();
        showPopup('error', {
          title: 'ถูกระงับการใช้งานชั่วคราว',
          description: `เนื่องจากกรอก OTP ผิดหลายครั้ง\nกรุณาลองใหม่อีกครั้งในวันที่ ${new Date(
            blockUntil
          ).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} น.`,
        });
        return;
      }
    }

    showPopup('default', {
      statusCode: 500,
    });
  };

  const { mutate: handleVerifyOtp, isPending: isLoadingVerifyOtp } = useMutation({
    mutationFn: async (data: IAuthRequestVerifyPhoneOtpPayload) => {
      return await verifyOtp(data);
    },
    onSuccess: (response) => {
      onFinishProp(response.data);
    },
    onError: handleOtpError,
    retry: false,
  });

  const { mutate: handleVerifyOtpEmail, isPending: isLoadingVerifyOtpEmail } = useMutation({
    mutationFn: async (data: IVerifyOtpEmailPayload) => {
      return await verifyOtpEmail(data);
    },
    onSuccess: (response) => {
      onFinishProp(response.data);
    },
    onError: handleOtpError,
    retry: false,
  });

  const onFinish = async (val: { otp: string }) => {
    if (email) {
      const payload = {
        email: email,
        pin: val.otp,
        refno: otpData?.refNo || '',
      };
      handleVerifyOtpEmail(payload);
    } else {
      const payload = {
        otp: val.otp,
        token: otpData?.token || '',
        phoneNumber: telNumber?.startsWith('0') ? telNumber.slice(1) : telNumber || '',
        countryCode: '66',
      };
      handleVerifyOtp(payload);
    }
  };

  useEffect(() => {
    setIsSuccessResendOtp(false);
    const timer = setTimeout(() => {
      setIsSuccessResendOtp(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [otpData]);

  useEffect(() => {
    if (otpData && visible) {
      setCountdown(30);
      otpForm.resetFields();
      setDisabledButton(true);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpData, visible, otpForm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabledButton && !isLoadingVerifyOtp && !isLoadingVerifyOtpEmail) {
      e.preventDefault();
      otpForm.submit();
    }
  };

  const isLoading = isLoadingVerifyOtp || isLoadingVerifyOtpEmail;

  return (
    <>
      <ResponsivePopup
        visible={visible}
        onClose={onClose}
        modalProps={{
          width: 960,
          centered: true,
          destroyOnClose: true,
        }}
        drawerProps={{
          height: '80%',
          destroyOnClose: true,
        }}
        drawerTitle={
          <div className="flex justify-end">
            <Button
              onClick={() => {
                onClose();
              }}
              variant="outlined"
              className="!px-0"
              color="neutral"
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        }
      >
        <div className="flex justify-center items-end w-full h-full">
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col justify-start items-center w-[400px]">
              <SectionIcon iconClass="ri-lock-password-fill" type="success" loading={isLoading} />
              <Form form={otpForm} onFinish={onFinish} layout="vertical" clearOnDestroy>
                <div className="mt-6 text-center">
                  <Typography variant="h5" className="!text-text-secondary">
                    กรุณากรอกรหัสยืนยัน (OTP)
                  </Typography>
                  <Typography variant="paragraph-medium" className="!text-text-quinary">
                    ที่ส่งไปยัง{' '}
                    <span className="text-primary font-medium">
                      {email ? email : telNumber?.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}
                    </span>{' '}
                    รหัสอ้างอิง {otpData?.refNo}
                  </Typography>
                </div>
                <Form.Item
                  name="otp"
                  rules={[
                    { required: true, message: 'กรุณากรอก OTP' },
                    {
                      pattern: /^\d{6}$/,
                      message: 'OTP ต้องเป็นตัวเลข 6 หลัก',
                    },
                  ]}
                  className="text-center !mt-6"
                >
                  <Input.OTP
                    size="large"
                    className="text-center"
                    type="tel"
                    data-testid={email ? 'user-input-otp-email' : 'user-otp-input-tel'}
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
                      <Typography variant="paragraph-small" className="!text-text-quinary">
                        OTP ใหม่ถูกส่งไปยัง{email ? 'อีเมล' : 'เบอร์'}ของคุณแล้ว
                      </Typography>
                      <Typography variant="paragraph-small" className="!text-text-quinary">
                        ขอรหัสใหม่ในอีก{' '}
                        <span className="text-primary font-semibold">({countdown} วินาที)</span>
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="paragraph-small" className="!text-text-quinary">
                        หากยังไม่ได้รับรหัสยืนยัน (OTP) กรุณากดขอรหัสใหม่
                      </Typography>
                      <Button
                        variant="link"
                        onClick={() => {
                          if (resendOtp) {
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
                  {({ getFieldValue }) => {
                    const otpValue = getFieldValue('otp');
                    const isOtpValid = /^\d{6}$/.test(otpValue);
                    const buttonDisabled = !isOtpValid || isLoading;
                    return (
                      <Button
                        htmlType="submit"
                        fullWidth
                        loading={isLoading}
                        disabled={buttonDisabled}
                      >
                        ยืนยัน
                      </Button>
                    );
                  }}
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </ResponsivePopup>
      <PopupComponent />
    </>
  );
};

export default PopupOtp;
