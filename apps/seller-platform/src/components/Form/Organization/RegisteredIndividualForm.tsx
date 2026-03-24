"use client";

import React, { useState } from "react";
import { Checkbox, Form, FormInstance } from "antd";
import Button from "@/components/Button";
import TextField from "@/components/DataEntry/TextField";
import Typography from "@/components/Typography";
import { checkRegistrationNumberExists } from "@/api/user.api";
import { organizationBusinessTypeOptions } from "@/constants/organization.constants";

const CheckboxGroup = Checkbox.Group;

// ===========================================
// Validation Function
// ===========================================

/**
 * ตรวจสอบเลขบัตรประชาชน 13 หลัก (Thai National ID)
 * ใช้ checksum algorithm ตามมาตรฐานกรมการปกครอง
 */
export const isValidThaiIdCard = (idCard: string): boolean => {
  if (idCard.length !== 13 || !/^\d{13}$/.test(idCard)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idCard.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(idCard.charAt(12));
};

// ===========================================
// Types
// ===========================================

export interface RegisteredIndividualFormFields {
  businessType: string[];
  businessTypeDescription?: string;
  registrationNumber: string;
  idCard: string;
  registrationName: string;
  acceptTerms?: boolean;
}

interface RegisteredIndividualFormProps {
  /** Form instance จาก Ant Design */
  form: FormInstance<RegisteredIndividualFormFields>;

  /**
   * แสดง checkbox ประเภทธุรกิจหรือไม่
   * - true = หน้า organizations/create (ต้องเลือก businessType)
   * - false = หน้า login (ไม่ต้องเลือก businessType, ส่งเป็น empty array)
   */
  showBusinessType?: boolean;

  /** สถานะว่าตรวจสอบ registrationNumber สำเร็จแล้วหรือยัง (controlled from parent) */
  isSuccessCheckRegistrationNumber: boolean;

  /** Callback เมื่อสถานะการตรวจสอบเปลี่ยน */
  setIsSuccessCheckRegistrationNumber: (value: boolean) => void;

  /**
   * แสดง Form wrapper หรือไม่
   * - true = หน้า organizations/create (มี Form wrapper)
   * - false = หน้า login (ไม่มี Form wrapper เพราะ parent มีอยู่แล้ว)
   */
  withFormWrapper?: boolean;

  /**
   * Disable ทุก field ใน form (ใช้เมื่อเลือกองค์กรที่มีอยู่แล้ว)
   * - true = ทุก field disabled + ปุ่มตรวจสอบแสดง "ยืนยันแล้ว"
   */
  isAllFieldsDisabled?: boolean;
}

// ===========================================
// Component
// ===========================================

export const RegisteredIndividualForm: React.FC<
  RegisteredIndividualFormProps
> = ({
  form,
  showBusinessType = false,
  isSuccessCheckRegistrationNumber,
  setIsSuccessCheckRegistrationNumber,
  withFormWrapper = false,
  isAllFieldsDisabled = false,
}) => {
  // ------------------------------------------
  // State
  // ------------------------------------------
  const [isCheckingRegistrationNumber, setIsCheckingRegistrationNumber] =
    useState(false);
  const [registrationNumberError, setRegistrationNumberError] = useState<
    string | null
  >(null);

  // ------------------------------------------
  // Form Watchers
  // ------------------------------------------
  const businessTypeValue = Form.useWatch("businessType", form);
  const registrationNumberValue = Form.useWatch("registrationNumber", form);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------

  /**
   * ตรวจสอบเลขทะเบียนพาณิชย์กับ API
   */
  const handleCheckRegistrationNumber = async () => {
    const value = form.getFieldValue("registrationNumber") || "";

    // Step 1: ตรวจสอบ format ก่อน
    if (value.length !== 13) {
      const errorMsg =
        "รูปแบบไม่ถูกต้อง กรุณาใส่เลขทะเบียนพาณิชย์ 13 หลักเท่านั้น";
      setRegistrationNumberError(errorMsg);
      form.setFields([
        {
          name: "registrationNumber",
          errors: [errorMsg],
        },
      ]);
      setIsSuccessCheckRegistrationNumber(false);
      return;
    }

    // Step 2: เรียก API ตรวจสอบ
    try {
      setIsCheckingRegistrationNumber(true);
      const { data } = await checkRegistrationNumberExists(value);

      if (data && data.exists === true) {
        // Case 1: เลขถูกใช้สมัครแล้ว
        const errorMsg = "เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว";
        setRegistrationNumberError(errorMsg);
        form.setFields([
          {
            name: "registrationNumber",
            errors: [errorMsg],
          },
        ]);
        setIsSuccessCheckRegistrationNumber(false);
      } else if (data && data.exists === false) {
        // Case 2: สามารถใช้ได้
        setRegistrationNumberError(null);
        setIsSuccessCheckRegistrationNumber(true);
      }
    } catch {
      // Case 3: API error
      const errorMsg = "หมายเลขทะเบียนพาณิชย์ไม่ถูกต้อง";
      setRegistrationNumberError(errorMsg);
      setIsSuccessCheckRegistrationNumber(false);
      form.setFields([
        {
          name: "registrationNumber",
          errors: [errorMsg],
        },
      ]);
    } finally {
      setIsCheckingRegistrationNumber(false);
    }
  };

  /**
   * เมื่อ user พิมพ์เลขทะเบียนพาณิชย์
   */
  const handleChangeRegistrationNumber = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    form.setFieldsValue({ registrationNumber: value });

    // Validate format while typing (only when 13 digits entered)
    if (value.length === 13) {
      setRegistrationNumberError(null);
    } else if (!value) {
      setRegistrationNumberError("กรุณากรอกหมายเลขทะเบียนพาณิชย์");
    } else if (value.length > 0) {
      const errorMsg =
        "รูปแบบไม่ถูกต้อง กรุณาใส่เลขทะเบียนพาณิชย์ 13 หลักเท่านั้น";
      setRegistrationNumberError(errorMsg);
    } else {
      setRegistrationNumberError(null);
    }

    setIsSuccessCheckRegistrationNumber(false);
  };

  // ------------------------------------------
  // Render Content
  // ------------------------------------------

  const formContent = (
    <div className="flex flex-col gap-4">
      {/* ========== ประเภทธุรกิจ (Checkbox) - แสดงเฉพาะหน้า organizations/create ========== */}
      {showBusinessType ? (
        <>
          <Form.Item
            name="businessType"
            className="!mb-0"
            label={
              <Typography
                variant="paragraph-small"
                className="!text-text-secondary !font-medium"
              >
                ประเภทธุรกิจ <span className="text-primary text-xs">*</span>
              </Typography>
            }
            rules={[
              {
                required: true,
                message: "กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 รายการ",
              },
            ]}
          >
            <CheckboxGroup
              options={organizationBusinessTypeOptions}
              className="flex flex-col gap-2"
            />
          </Form.Item>

          {/* ระบุประเภทธุรกิจอื่นๆ */}
          {businessTypeValue?.includes("OTHER") && (
            <TextField
              name="businessTypeDescription"
              label="ระบุประเภทธุรกิจอื่นๆ"
              placeholder="กรุณาระบุประเภทธุรกิจ"
              rules={[
                {
                  required: true,
                  message: "กรุณาระบุประเภทธุรกิจอื่นๆ",
                },
                {
                  max: 100,
                  message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)",
                },
              ]}
            />
          )}
        </>
      ) : (
        // Hidden field for login flow - always send empty array
        <Form.Item name="businessType" noStyle initialValue={[]} />
      )}

      {/* ========== เลขทะเบียนพาณิชย์ ========== */}
      <div className="flex items-center gap-2">
        <div className="w-full">
          <TextField
            dataTestId="input--registration-number"
            name="registrationNumber"
            type="numberOnly"
            label="เลขทะเบียนพาณิชย์"
            placeholder="กรุณากรอกเลขทะเบียนพาณิชย์"
            disabled={isAllFieldsDisabled}
            onChange={handleChangeRegistrationNumber}
            rules={[
              {
                required: true,
                message: "กรุณากรอกหมายเลขทะเบียนพาณิชย์",
              },
              {
                validator: (_: unknown, value: string) => {
                  if (value && value.length !== 13) {
                    return Promise.reject(
                      "รูปแบบไม่ถูกต้อง กรุณาใส่เลขทะเบียนพาณิชย์ 13 หลักเท่านั้น",
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            maxLength={13}
            className={`${
              isSuccessCheckRegistrationNumber && !registrationNumberError
                ? "border !border-primary"
                : ""
            }`}
            suffix={
              <>
                {registrationNumberError ===
                  "เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว" && (
                  <i className="ri-information-line text-error"></i>
                )}
                {isSuccessCheckRegistrationNumber &&
                  !registrationNumberError && (
                    <i className="ri-check-line text-primary"></i>
                  )}
              </>
            }
            validateStatus={
              registrationNumberError
                ? "error"
                : isSuccessCheckRegistrationNumber || isAllFieldsDisabled
                  ? "success"
                  : ""
            }
            help={
              registrationNumberError
                ? registrationNumberError
                : isSuccessCheckRegistrationNumber || isAllFieldsDisabled
                  ? "สามารถใช้เลขทะเบียนพาณิชย์ได้"
                  : "กดปุ่มตรวจสอบเพื่อยืนยันเลขทะเบียนพาณิชย์"
            }
          />
        </div>
        <div className="mt-2">
          <Button
            dataTestId="btn--id-card-verify"
            onClick={handleCheckRegistrationNumber}
            loading={isCheckingRegistrationNumber}
            disabled={
              isAllFieldsDisabled ||
              isSuccessCheckRegistrationNumber ||
              !registrationNumberValue ||
              !!registrationNumberError ||
              registrationNumberValue.length !== 13
            }
          >
            {isSuccessCheckRegistrationNumber || isAllFieldsDisabled
              ? "ยืนยันแล้ว"
              : "ตรวจสอบ"}
          </Button>
        </div>
      </div>

      {/* ========== เลขประจำตัวประชาชน ========== */}
      <TextField
        dataTestId="input--id-card"
        name="idCard"
        type="numberOnly"
        label="เลขประจำตัวประชาชน"
        placeholder="กรุณากรอกเลขประจำตัวประชาชน"
        disabled={isAllFieldsDisabled}
        rules={[
          {
            required: true,
            message: "กรุณากรอกเลขประจำตัวประชาชน",
          },
          {
            validator: (_: unknown, value: string) => {
              if (!value) return Promise.resolve();

              if (!isValidThaiIdCard(value)) {
                return Promise.reject("เลขประจำตัวประชาชนไม่ถูกต้อง");
              }
              return Promise.resolve();
            },
          },
        ]}
        maxLength={13}
      />

      {/* ========== ชื่อที่ใช้ในการประกอบพาณิชยกิจ ========== */}
      <TextField
        name="registrationName"
        label="ชื่อที่ใช้ในการประกอบพาณิชยกิจ"
        placeholder="กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ"
        addonBefore="ร้าน"
        disabled={isAllFieldsDisabled}
        rules={[
          {
            required: true,
            message: "กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ",
          },
          {
            max: 50,
            message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)",
          },
          {
            validator: (_: unknown, value: string) => {
              if (!value) return Promise.resolve();
              if (!/^[a-zA-Zก-๙0-9\s]*$/.test(value)) {
                return Promise.reject("ไม่อนุญาตให้กรอกอักขระพิเศษ");
              }
              if (value !== value.trim()) {
                return Promise.reject("รูปแบบไม่ถูกต้อง");
              }
              return Promise.resolve();
            },
          },
        ]}
      />
    </div>
  );

  // ------------------------------------------
  // Render
  // ------------------------------------------

  if (withFormWrapper) {
    return (
      <Form layout="vertical" form={form}>
        {formContent}
      </Form>
    );
  }

  return formContent;
};

export default RegisteredIndividualForm;
