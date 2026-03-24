"use client";

import Button from "@/components/Button";
import TextField from "@/components/DataEntry/TextField";
import Typography from "@/components/Typography";
import { Form, FormInstance } from "antd";
import { PhoneRegisterFormFields } from "../types";

interface FormRegisterProps {
  onFinish: (values: PhoneRegisterFormFields) => void;
  loading?: boolean;
  onLoginClick?: () => void;
  registerForm: FormInstance<PhoneRegisterFormFields>;
}

const FormRegister = ({
  onFinish,
  loading,
  onLoginClick,
  registerForm,
}: FormRegisterProps) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div
        className="flex flex-col justify-start w-[400px]"
        data-testid="form--register-start"
      >
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
            สมัครสมาชิก
          </Typography>
        </div>

        <Form form={registerForm} layout="vertical" onFinish={onFinish}>
          <TextField
            dataTestId="input--register-phone"
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
            required
          />
          <div className="flex gap-2 mt-4 items-center">
            <Typography variant="paragraph-small">
              หากท่านเป็นสมาชิกอยู่แล้ว
            </Typography>
            <Button
              dataTestId="btn--go-login"
              variant="link"
              size="small"
              color="primary"
              className="p-0"
              onClick={onLoginClick}
            >
              เข้าสู่ระบบ
            </Button>
          </div>

          <div className="mt-6">
            <Button
              dataTestId="btn--register-submit"
              htmlType="submit"
              fullWidth
              loading={loading}
            >
              สมัครสมาชิก
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default FormRegister;
