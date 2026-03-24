'use client';

import { Form, FormInstance, Progress } from 'antd';
import { useEffect, useState } from 'react';
import Button from '../../Button';
import TextField from '../../DataEntry/TextField';
import { Label } from '../../Label';
import Typography from '../../Typography';

interface FormSetPasswordProps {
  loading?: boolean;
  onFinish?: (values: {
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  passwordForm: FormInstance<{ password: string; confirmPassword: string }>;
}

interface PasswordValidation {
  minLength: boolean;
  hasNumberAndLetter: boolean;
  passwordsMatch: boolean;
}

const FormSetPassword: React.FC<FormSetPasswordProps> = ({
  passwordForm,
  onFinish: onFinishProp,
  loading,
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
    text: 'อ่อน',
    color: '#ff4d4f',
    trailColor: '#ffccc7',
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
        text: 'อ่อน',
        color: '#da2110',
        trailColor: '#fbe8e7',
      };
    } else if (score === 2) {
      return {
        level: 50,
        text: 'พอใช้',
        color: '#ffab08',
        trailColor: '#ffeece',
      };
    } else if (score === 3) {
      return {
        level: 75,
        text: 'ดี',
        color: '#00af43',
        trailColor: '#ccefd9',
      };
    } else {
      return {
        level: 100,
        text: 'ดีมาก',
        color: '#00af43',
        trailColor: '#ccefd9',
      };
    }
  };
  const passwordValue = Form.useWatch('password', passwordForm) || '';
  const confirmPasswordValue =
    Form.useWatch('confirmPassword', passwordForm) || '';
  const validatePassword = () => {
    const newValidation = {
      minLength: passwordValue.length >= 8,
      hasNumberAndLetter: /(?=.*[0-9])(?=.*[a-zA-Z])/.test(passwordValue),
      passwordsMatch:
        passwordValue !== '' &&
        confirmPasswordValue !== '' &&
        passwordValue === confirmPasswordValue,
    };

    setValidation(newValidation);

    if (passwordValue) {
      setPasswordStrength(checkPasswordStrength(passwordValue));
    } else {
      setPasswordStrength({
        level: 0,
        text: 'อ่อน',
        color: '#ff4d4f',
        trailColor: '#ffccc7',
      });
    }
  };

  // ฟังการเปลี่ยนแปลงของ form
  useEffect(() => {
    validatePassword();
  }, [passwordForm, passwordValue, confirmPasswordValue]);

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (onFinishProp) {
      await onFinishProp(values);
      return;
    }
  };

  // เช็คว่าทุกเงื่อนไขผ่านหรือไม่
  const isFormValid =
    validation.minLength &&
    validation.hasNumberAndLetter &&
    validation.passwordsMatch;

  const renderValidationIcon = (isValid: boolean) => (
    <div
      className={`w-6 h-6 rounded-full flex justify-center items-center ${
        isValid ? 'bg-primary-hover' : 'bg-background-secondary'
      }`}
    >
      <i
        className={`${isValid ? 'ri-check-line' : 'ri-close-line'} ${
          isValid ? 'text-primary' : 'text-[#bdc3cd]'
        }`}
      ></i>
    </div>
  );

  return (
    <Form
      form={passwordForm}
      className="w-full sm:w-[368px]"
      onFinish={onFinish}
      layout="vertical"
      clearOnDestroy
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
        {/* <Label
          text="ขั้นตอน 1/2"
          size="small"
          variant="ghost"
          rounding="pill"
        /> */}
      </div>

      <div className="mt-6">
        <TextField
          name="password"
          label="รหัสผ่าน"
          type="password"
          placeholder="กรุณากรอกรหัสผ่าน"
          required
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
            />
            <Typography
              variant="paragraph-extra-small"
              className={
                passwordStrength.level === 100
                  ? '!text-success'
                  : passwordStrength.level === 75
                    ? '!text-success'
                    : passwordStrength.level === 50
                      ? '!text-warning'
                      : '!text-error'
              }
            >
              ความปลอดภัยรหัสผ่าน : {passwordStrength.text}
            </Typography>
          </>
        )}
      </div>

      <div className="mt-6">
        <TextField
          name="confirmPassword"
          label="ยืนยันรหัสผ่านอีกครั้ง"
          type="password"
          placeholder="กรุณากรอกรหัสผ่าน"
          required
        />
      </div>

      <div className="flex flex-col mt-6 gap-3">
        <div className="flex gap-2 items-center">
          {renderValidationIcon(validation.minLength)}
          <Typography
            variant="paragraph-small"
            className={
              validation.minLength ? '!text-primary' : '!text-text-tertiary'
            }
          >
            ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
          </Typography>
        </div>

        <div className="flex gap-2 items-center">
          {renderValidationIcon(validation.hasNumberAndLetter)}
          <Typography
            variant="paragraph-small"
            className={
              validation.hasNumberAndLetter
                ? '!text-primary'
                : '!text-text-tertiary'
            }
          >
            ต้องประกอบด้วย ตัวเลขและตัวอักษร (1234567A)
          </Typography>
        </div>

        <div className="flex gap-2 items-center">
          {renderValidationIcon(validation.passwordsMatch)}
          <Typography
            variant="paragraph-small"
            className={
              validation.passwordsMatch
                ? '!text-primary'
                : '!text-text-tertiary'
            }
          >
            ยืนยันรหัสผ่านตรงกัน
          </Typography>
        </div>
      </div>

      <Form.Item shouldUpdate className="!mt-6">
        {() => (
          <Button
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
