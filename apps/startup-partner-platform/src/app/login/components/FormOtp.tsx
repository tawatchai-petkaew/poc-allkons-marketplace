"use client";

import { Form, FormInstance, Input } from "antd";
import { useState, useEffect } from "react";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import { useForm } from "antd/es/form/Form";
import SectionIcon from "@/components/Section/SectionIcon";
import { OtpData, OtpFormFields } from "../types";

interface FormOtpProps {
  loading?: boolean;
  onFinish?: (values: OtpFormFields) => Promise<void>;
  otpData?: OtpData;
  resendOtp?: () => void;
  telNumber?: string | null;
  isSuccessResendOtp?: boolean;
  otpForm?: FormInstance<OtpFormFields>;
}

const FormOtp: React.FC<FormOtpProps> = ({
  onFinish: onFinishProp,
  loading,
  otpData,
  resendOtp,
  telNumber,
  isSuccessResendOtp,
  otpForm: externalOtpForm,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [disabledButton, setDisabledButton] = useState(true);
  const [internalOtpForm] = useForm<OtpFormFields>();

  const otpForm = externalOtpForm || internalOtpForm;

  // Countdown on initial OTP data load
  useEffect(() => {
    if (otpData) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpData]);

  // Countdown on resend OTP success (like buyer)
  useEffect(() => {
    if (isSuccessResendOtp) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccessResendOtp]);

  const onFinish = async (values: { otp: string }) => {
    if (onFinishProp) {
      await onFinishProp(values);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabledButton && !loading) {
      e.preventDefault();
      otpForm.submit();
    }
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex flex-col justify-start items-center w-[400px]" data-testid="form--otp">
        <SectionIcon
          iconClass="ri-lock-password-fill"
          type="success"
          loading={loading}
        />
        <Form
          form={otpForm}
          onFinish={onFinish}
          layout="vertical"
          clearOnDestroy
        >
          <div className="mt-6 text-center">
            <Typography variant="h5" className="!text-text-secondary" data-testid="txt--otp-title">
              กรุณากรอกรหัสยืนยัน (OTP)
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-quinary"
              data-testid="txt--otp-sent-to"
            >
              ที่ส่งไปยัง{" "}
              <span className="text-primary font-medium">
                {telNumber?.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3")}
              </span>{" "}
              <span data-testid="txt--otp-ref-code">รหัสอ้างอิง {otpData?.refNo}</span>
            </Typography>
          </div>
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: "กรุณากรอกรหัส OTP" },
              {
                pattern: /^\d{6}$/,
                message: "OTP ต้องเป็นตัวเลข 6 หลัก!",
              },
            ]}
            className="text-center !mt-6"
          >
            <Input.OTP
              size="large"
              className="text-center"
              type="tel"
              data-testid="group--otp"
              style={{ flex: "none" }}
              onInput={(e) => {
                const filteredInput = e.filter((char) => char !== "");
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
              otpForm.getFieldError("otp").length ? "mt-12" : "mt-6"
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
                  ขอรหัสใหม่ในอีก{" "}
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
                  dataTestId="btn--otp-resend"
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

          <Form.Item className="!mt-6">
            <Button
              dataTestId="btn--otp-confirm"
              htmlType="submit"
              fullWidth
              loading={loading}
              disabled={disabledButton || loading}
            >
              ยืนยัน
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FormOtp;
