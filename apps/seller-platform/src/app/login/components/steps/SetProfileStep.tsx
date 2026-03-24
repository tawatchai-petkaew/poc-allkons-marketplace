"use client";

import React from "react";
import { Form, FormInstance } from "antd";
import Button from "@/components/Button";
import Typography from "@/components/Typography";
import TextField from "@/components/DataEntry/TextField";
import Checkbox from "@/components/DataEntry/Checkbox";
import { ProfileFormFields } from "../../types";
import { routes } from "@/constants/routing.constants";

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
      className="w-full sm:w-[500px]"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        telNumber: telNumber || "",
        consent: false,
      }}
      data-testid="form--register-personal"
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
            data-testid="badge--register-step"
          >
            ข้อมูลส่วนตัว
          </Typography>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          name="firstName"
          label="ชื่อ"
          placeholder="กรุณากรอกชื่อ"
          rules={[
            { required: true, message: "กรุณากรอกชื่อ" },
            {
              max: 50,
              message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)",
            },
            {
              pattern: /^[ก-๙\s]+$/,
              message: "กรุณากรอกเฉพาะภาษาไทย",
            },
          ]}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/\s/g, "");
          }}
        />
        {/* <TextField
          name="midName"
          label="ชื่อกลาง (ถ้ามี)"
          placeholder="กรุณากรอกชื่อกลาง"
          rules={[
            {
              max: 50,
              message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)",
            },
            {
              pattern: /^[a-zA-Zก-๙\s]*$/,
              message: "ไม่อนุญาตให้กรอกอักขระพิเศษ",
            },
          ]}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/\s/g, "");
          }}
        /> */}
        <TextField
          dataTestId="input--last-name"
          name="lastName"
          label="นามสกุล"
          placeholder="กรุณากรอกนามสกุล"
          rules={[
            { required: true, message: "กรุณากรอกนามสกุล" },
            {
              max: 50,
              message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)",
            },
            {
              pattern: /^[ก-๙\s]+$/,
              message: "กรุณากรอกเฉพาะภาษาไทย",
            },
          ]}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/\s/g, "");
          }}
        />
        <TextField
          dataTestId="input--tel-number"
          name="telNumber"
          label="เบอร์โทรศัพท์"
          required
          disabled
        />
        <TextField
          dataTestId="input--email"
          name="email"
          label="อีเมล"
          placeholder="กรุณากรอกอีเมล"
          rules={[
            {
              required: true,
              message: "กรุณากรอกอีเมล",
            },
            {
              validator: (_: unknown, value: string) => {
                if (!value) return Promise.resolve();

                // Check max length first
                if (value.length > 100) {
                  return Promise.reject(
                    "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)",
                  );
                }

                // Check for Thai characters
                if (/[\u0E00-\u0E7F]/.test(value)) {
                  return Promise.reject("ไม่อนุญาตให้กรอกภาษาไทย");
                }

                // Check email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  return Promise.reject("รูปแบบอีเมลไม่ถูกต้อง");
                }

                return Promise.resolve();
              },
            },
          ]}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Checkbox
            dataTestId="checkbox--consent-terms"
            name="consent"
            size="small"
            label={
              <span className="text-sm">
                ยอมรับ{" "}
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() => window.open(`${routes.terms()}`, "_blank")}
                  data-testid="link--terms-of-service"
                >
                  เงื่อนไขการให้บริการ
                </span>{" "}
                และ{" "}
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() =>
                    window.open(`${routes.privacy()}#privacy`, "_blank")
                  }
                  data-testid="link--privacy-policy"
                >
                  นโยบายความเป็นส่วนตัว
                </span>
              </span>
            }
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            dataTestId="checkbox--consent-marketing"
            name="consentMarketing"
            size="small"
            label={
              <span className="text-sm">
                ยอมรับ{" "}
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() =>
                    window.open(`${routes.privacy()}#marketing`, "_blank")
                  }
                  data-testid="link--marketing-policy"
                >
                  การนำข้อมูลไปใช้เพื่อการตลาด
                </span>
              </span>
            }
          />
        </div>
      </div>

      {/* submit button */}
      <Form.Item shouldUpdate className="!mt-6 !mb-0">
        {({ getFieldsError, getFieldValue }) => {
          const hasErrors = getFieldsError().some(
            ({ errors }) => errors.length,
          );
          const requiredFields: (keyof ProfileFormFields)[] = [
            "firstName",
            "lastName",
          ];
          const hasEmptyFields = requiredFields.some(
            (field) => !getFieldValue(field),
          );
          const consentValue = getFieldValue("consent");

          return (
            <Button
              dataTestId="btn--personal-next"
              htmlType="submit"
              fullWidth
              disabled={hasErrors || hasEmptyFields || !consentValue || loading}
              loading={loading}
            >
              ถัดไป
            </Button>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default SetProfileStep;
