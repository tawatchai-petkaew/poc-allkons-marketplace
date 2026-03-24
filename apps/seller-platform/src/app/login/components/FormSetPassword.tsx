"use client";

import React, { useEffect, useState } from "react";
import { Form, FormInstance, message, Progress } from "antd";
import Button from "@/components/Button";
import Typography from "@/components/Typography";
import TextField from "@/components/DataEntry/TextField";
import { PasswordFormFields } from "../types";

export interface FormSetPasswordProps {
  passwordForm: FormInstance<PasswordFormFields>;
  loading?: boolean;
  onFinish: (values: PasswordFormFields) => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasNumberAndLetter: boolean;
  passwordsMatch: boolean;
}

const FormSetPassword: React.FC<FormSetPasswordProps> = ({
  passwordForm,
  loading,
  onFinish,
}) => {
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasNumberAndLetter: false,
    passwordsMatch: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<{
    level: number;
    text: string;
    color: string;
    trailColor: string;
  }>({
    level: 0,
    text: "อ่อน",
    color: "#ff4d4f",
    trailColor: "#ffccc7",
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;

    if (score === 0 || score === 1) {
      return {
        level: 25,
        text: "อ่อน",
        color: "#da2110",
        trailColor: "#fbe8e7",
      };
    } else if (score === 2) {
      return {
        level: 50,
        text: "พอใช้",
        color: "#ffab08",
        trailColor: "#ffeece",
      };
    } else if (score === 3) {
      return {
        level: 75,
        text: "ดี",
        color: "#00af43",
        trailColor: "#ccefd9",
      };
    } else {
      return {
        level: 100,
        text: "ดีมาก",
        color: "#00af43",
        trailColor: "#ccefd9",
      };
    }
  };

  const passwordValue = Form.useWatch("password", passwordForm) || "";
  const confirmPasswordValue =
    Form.useWatch("confirmPassword", passwordForm) || "";

  const validatePassword = () => {
    const newValidation = {
      minLength: passwordValue.length >= 8,
      hasNumberAndLetter: /(?=.*[0-9])(?=.*[a-zA-Z])/.test(passwordValue),
      passwordsMatch:
        passwordValue !== "" &&
        confirmPasswordValue !== "" &&
        passwordValue === confirmPasswordValue,
    };

    setValidation(newValidation);

    if (passwordValue) {
      setPasswordStrength(checkPasswordStrength(passwordValue));
    } else {
      setPasswordStrength({
        level: 0,
        text: "อ่อน",
        color: "#ff4d4f",
        trailColor: "#ffccc7",
      });
    }
  };

  useEffect(() => {
    validatePassword();
  }, [passwordValue, confirmPasswordValue]);

  const isFormValid =
    validation.minLength &&
    validation.hasNumberAndLetter &&
    validation.passwordsMatch;

  const renderValidationIcon = (isValid: boolean) => (
    <div
      className={`w-6 h-6 rounded-full flex justify-center items-center ${
        isValid ? "bg-primary-hover" : "bg-background-secondary"
      }`}
    >
      <i
        className={`${isValid ? "ri-check-line" : "ri-close-line"} ${
          isValid ? "text-primary" : "text-[#bdc3cd]"
        }`}
      ></i>
    </div>
  );

  return (
    <Form
      form={passwordForm}
      className="w-full sm:w-[500px]"
      onFinish={onFinish}
      layout="vertical"
      clearOnDestroy
      data-testid="form--register-password"
    >
      <div className="flex justify-between">
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
            การตั้งค่ารหัสผ่าน
          </Typography>
        </div>
      </div>

      <div className="mt-6">
        <TextField
          dataTestId="input--password"
          name="password"
          label="รหัสผ่าน"
          type="password"
          placeholder="กรุณากรอกรหัสผ่าน"
          required
          noSpace
          rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
        />
        {passwordValue && (
          <>
            <Progress
              percent={passwordStrength.level}
              showInfo={false}
              strokeColor={passwordStrength.color}
              trailColor={passwordStrength.trailColor}
              type="line"
              size={{ height: 4 }}
              data-testid="bar--password-strength"
            />
            <Typography
              variant="paragraph-extra-small"
              className={
                passwordStrength.level === 100
                  ? "!text-success"
                  : passwordStrength.level === 75
                    ? "!text-success"
                    : passwordStrength.level === 50
                      ? "!text-warning"
                      : "!text-error"
              }
              data-testid="txt--password-strength-label"
            >
              ความปลอดภัยรหัสผ่าน : {passwordStrength.text}
            </Typography>
          </>
        )}
      </div>

      <div className="mt-6">
        <TextField
          dataTestId="input--confirm-password"
          name="confirmPassword"
          label="ยืนยันรหัสผ่านอีกครั้ง"
          type="password"
          placeholder="กรุณากรอกรหัสผ่าน"
          required
          noSpace
          rules={[{ required: true, message: "กรุณากรอกยืนยันรหัสผ่าน" }]}
        />
      </div>

      <div className="flex flex-col mt-6 gap-3">
        <div
          className="flex gap-2 items-center"
          data-testid="rule--password-min-8"
        >
          {renderValidationIcon(validation.minLength)}
          <Typography
            variant="paragraph-small"
            className={
              validation.minLength ? "!text-primary" : "!text-text-tertiary"
            }
          >
            ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
          </Typography>
        </div>

        <div
          className="flex gap-2 items-center"
          data-testid="rule--password-alnum"
        >
          {renderValidationIcon(validation.hasNumberAndLetter)}
          <Typography
            variant="paragraph-small"
            className={
              validation.hasNumberAndLetter
                ? "!text-primary"
                : "!text-text-tertiary"
            }
          >
            ต้องประกอบด้วย ตัวเลขและตัวอักษร (1234567A)
          </Typography>
        </div>

        <div
          className="flex gap-2 items-center"
          data-testid="rule--password-match"
        >
          {renderValidationIcon(validation.passwordsMatch)}
          <Typography
            variant="paragraph-small"
            className={
              validation.passwordsMatch
                ? "!text-primary"
                : "!text-text-tertiary"
            }
          >
            ยืนยันรหัสผ่านตรงกัน
          </Typography>
        </div>
      </div>

      <Form.Item shouldUpdate className="!mt-6">
        {() => (
          <Button
            dataTestId="btn--password-next"
            htmlType="submit"
            loading={loading}
            fullWidth
            disabled={!isFormValid}
          >
            ดำเนินการต่อ
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default FormSetPassword;
