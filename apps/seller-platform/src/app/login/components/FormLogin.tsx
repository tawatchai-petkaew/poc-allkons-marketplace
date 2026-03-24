"use client";

import Button from "@/components/Button";
import RadioGroup from "@/components/DataEntry/RadioGroup";
import TextField from "@/components/DataEntry/TextField";
import Typography from "@/components/Typography";
import { Alert, Form, FormInstance } from "antd";
import { useState } from "react";
import { PhoneFormFields } from "../types";

interface FormLoginProps {
  onFinish?: (values: PhoneFormFields) => void;
  loading?: boolean;
  onRegisterClick?: () => void;
  loginForm?: FormInstance<PhoneFormFields>;
  errorMessage?: string;
  onClearError?: () => void;
}

const FormLogin = ({
  onFinish,
  loading,
  onRegisterClick,
  loginForm: externalLoginForm,
  errorMessage,
  onClearError,
}: FormLoginProps) => {
  const [loginType, setLoginType] = useState<"phone" | "username">("phone");
  const [internalLoginForm] = Form.useForm<PhoneFormFields>();

  const loginForm = externalLoginForm || internalLoginForm;

  const handleSubmit = (values: PhoneFormFields) => {
    if (onFinish) {
      onFinish(values);
    }
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex flex-col justify-start w-[400px]">
        <div className="mb-4">
          <Typography
            variant="paragraph-small"
            className="!text-text-quinary"
            data-testid="txt--auth-welcome"
          >
            ยินดีต้อนรับสู่ Allkons Seller Center
          </Typography>
          <Typography
            variant="h3"
            className="!text-text-secondary"
            data-testid="title--auth"
          >
            เข้าสู่ระบบเพื่อใช้งาน
          </Typography>
        </div>
        <div className="flex w-full my-6">
          <RadioGroup
            dataTestId="group--login-method"
            value={loginType}
            options={[
              {
                label: "หมายเลขโทรศัพท์",
                value: "phone",
              },
              {
                label: "ชื่อผู้ใช้",
                value: "username",
              },
            ]}
            onChange={(e) => {
              setLoginType(e.target.value);
              loginForm.resetFields();
              onClearError?.();
            }}
            useRadioButton={true}
            buttonStyle="solid"
            block
          />
        </div>
        {errorMessage && (
          <div className="mb-4">
            <Alert
              message={
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-primary"
                >
                  {errorMessage}
                </Typography>
              }
              type="error"
              className="!p-4 !rounded-xl"
              showIcon
              icon={<i className="ri-information-line text-xl"></i>}
              data-testid="alert--login-error"
            />
          </div>
        )}
        {loginType === "phone" ? (
          <Form form={loginForm} layout="vertical" onFinish={handleSubmit}>
            <TextField
              dataTestId="input--login-phone"
              name="phoneNumber"
              type="tel"
              maxLength={10}
              label="หมายเลขโทรศัพท์"
              placeholder="กรอกหมายเลขโทรศัพท์"
              rules={[
                { required: true, message: "กรุณากรอกหมายเลขโทรศัพท์" },
                {
                  pattern: /^0[689]\d{8}$/,
                  message: "กรุณากรอกเบอร์มือถือที่ถูกต้อง",
                },
              ]}
              onChange={() => onClearError?.()}
              required
            />
            <div className="flex gap-2 mt-4 items-center">
              <Typography variant="paragraph-small">
                หากท่านยังไม่เป็นสมาชิก เราแนะนำให้ท่าน
              </Typography>
              <Button
                dataTestId="btn--go-register"
                variant="link"
                size="small"
                color="primary"
                className="p-0"
                onClick={onRegisterClick}
              >
                สมัครบัญชี
              </Button>
            </div>

            <div className="mt-6">
              <Button
                dataTestId="btn--login-submit"
                htmlType="submit"
                fullWidth
                loading={loading}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </Form>
        ) : (
          <Form
            form={loginForm}
            layout="vertical"
            className="flex flex-col gap-2"
            onFinish={handleSubmit}
          >
            <TextField
              dataTestId="input--login-username"
              name="username"
              label="ชื่อผู้ใช้"
              placeholder="กรอกเบอร์โทรศัพท์หรืออีเมล"
              rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              onChange={() => onClearError?.()}
              noSpace
              required
            />
            <TextField
              dataTestId="input--login-password"
              name="password"
              type="password"
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              onChange={() => onClearError?.()}
              noSpace
              required
            />
            <div>
              <Button
                variant="link"
                size="small"
                color="primary"
                className="p-0"
              >
                ลืมรหัสผ่าน
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Typography variant="paragraph-small">
                หากท่านยังไม่เป็นสมาชิก เราแนะนำให้ท่าน
              </Typography>
              <Button
                dataTestId="btn--go-register"
                variant="link"
                size="small"
                color="primary"
                className="p-0"
                onClick={onRegisterClick}
              >
                สมัครบัญชี
              </Button>
            </div>
            <div className="mt-4">
              <Button
                dataTestId="btn--login-submit"
                htmlType="submit"
                fullWidth
                loading={loading}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default FormLogin;
