"use client";

import React, { useMemo, useState } from "react";
import { Checkbox, Form, FormInstance } from "antd";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import Select from "@/components/DataEntry/Select";
import TextField from "@/components/DataEntry/TextField";
import Typography from "@/components/Typography";
import { checkTaxIdExists } from "@/api/user.api";
import { getOrganizationJuristicTypeMasterData } from "@/api/organization.api";
import { organizationBusinessTypeOptions } from "@/constants/organization.constants";

const CheckboxGroup = Checkbox.Group;

// ===========================================
// Validation Function
// ===========================================

/**
 * ตรวจสอบเลขประจำตัวนิติบุคคล 13 หลัก (Thai Juristic ID)
 * ใช้ checksum algorithm ตามมาตรฐานกรมพัฒนาธุรกิจการค้า
 */
export const isValidThaiJuristicId = (id: string): boolean => {
  if (!Number(id)) return false;
  if (id.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseFloat(id.charAt(i)) * (13 - i);
  }

  return (11 - (sum % 11)) % 10 === parseFloat(id.charAt(12));
};

// ===========================================
// Types
// ===========================================

export interface JuristicFormFields {
  businessType: string[];
  businessTypeDescription?: string;
  taxId: string;
  juristicType: string;
  juristicTypeId: number;
  remarkTypeOther?: string;
  juristicName: string;
  branchName: string;
  branchType?: string;
  branchNumber?: string;
  dbdAddress?: {
    address: string;
    subDistrictId: string;
    districtId: string;
    provinceId: string;
    zipCode: string;
  };
  acceptTerms?: boolean;
}

interface JuristicFormProps {
  /** Form instance จาก Ant Design */
  form: FormInstance<JuristicFormFields>;

  /**
   * แสดง checkbox ประเภทธุรกิจหรือไม่
   * - true = หน้า organizations/create (ต้องเลือก businessType)
   * - false = หน้า login (ไม่ต้องเลือก businessType, ส่งเป็น empty array)
   */
  showBusinessType?: boolean;

  /** สถานะว่าตรวจสอบ taxId สำเร็จแล้วหรือยัง (controlled from parent) */
  isSuccessCheckTaxId: boolean;

  /** Callback เมื่อสถานะการตรวจสอบเปลี่ยน */
  setIsSuccessCheckTaxId: (value: boolean) => void;

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

export const JuristicForm: React.FC<JuristicFormProps> = ({
  form,
  showBusinessType = false,
  isSuccessCheckTaxId,
  setIsSuccessCheckTaxId,
  withFormWrapper = false,
  isAllFieldsDisabled = false,
}) => {
  // ------------------------------------------
  // State
  // ------------------------------------------
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);
  const [isFieldsDisabled, setIsFieldsDisabled] = useState(false);
  const [taxIdError, setTaxIdError] = useState<string | null>(null);

  // ------------------------------------------
  // Form Watchers
  // ------------------------------------------
  const businessTypeValue = Form.useWatch("businessType", form);
  const juristicTypeValue = Form.useWatch("juristicType", form);
  const remarkTypeOtherValue = Form.useWatch("remarkTypeOther", form);
  const taxIdValue = Form.useWatch("taxId", form);

  // ------------------------------------------
  // API: Get Juristic Type Master Data
  // ------------------------------------------
  const { data: juristicTypeList } = useQuery({
    queryKey: ["juristicTypeList"],
    queryFn: async () => {
      const response = await getOrganizationJuristicTypeMasterData();
      return response.data;
    },
  });

  // ------------------------------------------
  // Computed Values
  // ------------------------------------------

  // Options สำหรับ Select (ไม่รวม PERSONAL)
  const juristicTypeOptions = juristicTypeList
    ?.map((item) => ({
      label: item.label,
      value: item.value,
    }))
    .reverse()
    .filter((item) => item.value !== "PERSONAL");

  // Prefix ของชื่อองค์กร (เช่น "บริษัท", "ห้างหุ้นส่วนจำกัด")
  const prefix = useMemo(() => {
    if (juristicTypeValue === "OTHER" && remarkTypeOtherValue) {
      return remarkTypeOtherValue;
    }
    return juristicTypeList?.find((item) => item.value === juristicTypeValue)
      ?.prefix;
  }, [juristicTypeValue, juristicTypeList, remarkTypeOtherValue]);

  // Suffix ของชื่อองค์กร (เช่น "จำกัด")
  const suffix = useMemo(() => {
    return juristicTypeList?.find((item) => item.value === juristicTypeValue)
      ?.subfix;
  }, [juristicTypeValue, juristicTypeList]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------

  /**
   * ตรวจสอบเลขนิติบุคคลกับ API
   */
  const handleCheckTaxId = async () => {
    const taxIdValue = form.getFieldValue("taxId") || "";
    const isValid = isValidThaiJuristicId(taxIdValue);

    // Step 1: ตรวจสอบ format ก่อน
    if (!isValid) {
      const errorMsg =
        "รูปแบบไม่ถูกต้อง กรุณาใส่เลขผู้เสียภาษี 13 หลักเท่านั้น";
      setTaxIdError(errorMsg);
      form.setFields([
        {
          name: "taxId",
          errors: [errorMsg],
        },
      ]);
      console.log("เลขประจำตัวนิติบุคคลไม่ถูกต้อง", taxIdValue);
      setIsSuccessCheckTaxId(false);
      return;
    }

    // Step 2: เรียก API ตรวจสอบ
    try {
      setIsCheckingTaxId(true);
      const { data } = await checkTaxIdExists({
        taxId: taxIdValue,
        organizeBranchNumber: 0,
      });

      // Case 1: บริษัทเลิกกิจการแล้ว
      if (data?.status === "DISSOLVED") {
        const errorMsg = "เลขประจำตัวนิติบุคคลนี้เลิกกิจการแล้ว";
        setTaxIdError(errorMsg);
        setIsSuccessCheckTaxId(false);
        form.setFields([
          {
            name: "taxId",
            errors: [errorMsg],
          },
        ]);
      } else {
        // Case 2: ตรวจสอบสำเร็จ - Prefill ข้อมูลจาก DBD
        form.setFieldsValue({
          juristicType: data?.juristicType.value,
          juristicTypeId: juristicTypeList?.find(
            (juristic) => juristic.value === data?.juristicType.value,
          )?.id,
          juristicName: data?.organizeName,
          remarkTypeOther:
            juristicTypeList?.find(
              (juristic) => juristic.value === data?.juristicType.value,
            )?.value === "OTHER"
              ? data?.juristicType.otherValue
              : "",
          branchName: data?.branchName || "สำนักงานใหญ่",
          branchType: "HEAD_OFFICE",
          branchNumber: "00000",
          // Store DBD address data for createOrganizationAddress API
          dbdAddress: data?.address
            ? {
                address: data?.address.address || "",
                subDistrictId: String(data?.address.subdistrictId || ""),
                districtId: String(data?.address.districtId || ""),
                provinceId: String(data?.address.provinceId || ""),
                zipCode: data?.address.zipCode || "",
              }
            : undefined,
        });
        setTaxIdError(null);
        setIsSuccessCheckTaxId(true);
        setIsFieldsDisabled(true);
      }
    } catch (error: any) {
      // Case 3: เลขถูกใช้สมัครแล้ว
      if (error.response?.data?.data?.exists) {
        const errorMsg = "เลขประจำตัวนิติบุคคลถูกใช้สมัครแล้ว";
        setTaxIdError(errorMsg);
        setIsSuccessCheckTaxId(false);
        form.setFields([
          {
            name: "taxId",
            errors: [errorMsg],
          },
        ]);
      } else {
        // Case 4: API error อื่นๆ - ยังคงอนุญาตให้ submit ได้
        setTaxIdError(null);
        setIsSuccessCheckTaxId(true);
      }
    } finally {
      setIsCheckingTaxId(false);
    }
  };

  /**
   * เมื่อ user พิมพ์เลขนิติบุคคล
   */
  const handleChangeTaxId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    form.setFieldsValue({ taxId: value });

    // ถ้าเคยตรวจสอบสำเร็จแล้ว ให้ reset ข้อมูลที่ prefill ไว้
    if (isSuccessCheckTaxId) {
      form.setFieldsValue({
        juristicType: "LIMITED_COMPANY",
        juristicTypeId: undefined,
        juristicName: "",
        remarkTypeOther: "",
        branchName: "สำนักงานใหญ่",
        branchType: "HEAD_OFFICE",
        branchNumber: "00000",
        dbdAddress: undefined,
      });
    }

    // Validate format while typing (only when 13 digits entered)

    const isValid = isValidThaiJuristicId(value);
    if (!value) {
      setTaxIdError("กรุณากรอกเลขประจำตัวผู้เสียภาษี");
    } else if (!isValid) {
      const errorMsg =
        "รูปแบบไม่ถูกต้อง กรุณาใส่เลขผู้เสียภาษี 13 หลักเท่านั้น";
      setTaxIdError(errorMsg);
    } else {
      setTaxIdError(null);
    }

    setIsSuccessCheckTaxId(false);
    setIsFieldsDisabled(false);
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

      {/* ========== เลขประจำตัวนิติบุคคล ========== */}
      <div className="flex items-center gap-2">
        <div className="w-full">
          <TextField
            dataTestId="input--tax-id"
            name="taxId"
            type="numberOnly"
            label="เลขประจำตัวนิติบุคคล"
            placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษี"
            disabled={isAllFieldsDisabled}
            onChange={handleChangeTaxId}
            rules={[
              {
                required: true,
                message: "กรุณากรอกเลขประจำตัวผู้เสียภาษี",
              },
              {
                validator: (_: unknown, value: string) => {
                  if (value && !isValidThaiJuristicId(value)) {
                    return Promise.reject(
                      "รูปแบบไม่ถูกต้อง กรุณาใส่เลขผู้เสียภาษี 13 หลักเท่านั้น",
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            maxLength={13}
            className={`${
              isSuccessCheckTaxId && !taxIdError ? "border !border-primary" : ""
            }`}
            suffix={
              <>
                {taxIdError === "เลขประจำตัวนิติบุคคลถูกใช้สมัครแล้ว" && (
                  <i className="ri-information-line text-error"></i>
                )}
                {isSuccessCheckTaxId && !taxIdError && (
                  <i className="ri-check-line text-primary"></i>
                )}
              </>
            }
            validateStatus={
              taxIdError
                ? "error"
                : isSuccessCheckTaxId || isAllFieldsDisabled
                  ? "success"
                  : ""
            }
            help={
              taxIdError
                ? taxIdError
                : isSuccessCheckTaxId || isAllFieldsDisabled
                  ? "สามารถใช้เลขประจำตัวนิติบุคคลได้"
                  : "กดปุ่มตรวจสอบเพื่อยืนยันเลขประจำตัวนิติบุคคล"
            }
          />
        </div>
        <div className="mt-2">
          <Button
            dataTestId="btn--id-card-verify"
            onClick={handleCheckTaxId}
            loading={isCheckingTaxId}
            disabled={
              isAllFieldsDisabled ||
              isSuccessCheckTaxId ||
              !taxIdValue ||
              !!taxIdError ||
              taxIdValue.length !== 13
            }
          >
            {isSuccessCheckTaxId || isAllFieldsDisabled
              ? "ยืนยันแล้ว"
              : "ตรวจสอบ"}
          </Button>
        </div>
      </div>

      {/* Hidden fields */}
      <Form.Item name="branchType" noStyle />
      <Form.Item name="branchNumber" noStyle />

      {/* ========== ประเภทนิติบุคคล ========== */}
      <Select
        name="juristicType"
        label="ประเภทนิติบุคคล"
        options={juristicTypeOptions}
        placeholder="กรุณาเลือกประเภทนิติบุคคล"
        disabled={isFieldsDisabled || isAllFieldsDisabled}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement || document.body
        }
        rules={[
          {
            required: true,
            message: "กรุณาเลือกประเภทนิติบุคคล",
          },
        ]}
        onChange={(value) => {
          const juristicTypeId = juristicTypeList?.find(
            (juristic) => juristic.value === value,
          )?.id;
          form.setFieldsValue({
            juristicTypeId: juristicTypeId,
          });
        }}
      />

      {/* Hidden field: juristicTypeId */}
      <Form.Item name="juristicTypeId" noStyle />

      {/* ========== ประเภทนิติบุคคลอื่นๆ (แสดงเมื่อเลือก OTHER) ========== */}
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const juristicType = getFieldValue("juristicType");
          if (juristicType === "OTHER") {
            return (
              <TextField
                name="remarkTypeOther"
                label="ประเภทนิติบุคคล"
                placeholder="กรุณากรอกประเภทนิติบุคคล"
                disabled={isFieldsDisabled || isAllFieldsDisabled}
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกประเภทนิติบุคคล",
                  },
                  {
                    max: 50,
                    message:
                      "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)",
                  },
                  {
                    pattern: /^[a-zA-Zก-๙\s]*$/,
                    message: "ไม่อนุญาตให้กรอกอักขระพิเศษ",
                  },
                  {
                    validator: (_: unknown, value: string) => {
                      if (value && value.trim() === "") {
                        return Promise.reject("กรุณากรอกประเภทนิติบุคคล");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.startsWith(" ")) {
                    target.value = target.value.trimStart();
                  }
                }}
              />
            );
          }
          return null;
        }}
      </Form.Item>

      {/* ========== ชื่อองค์กร ========== */}
      <TextField
        name="juristicName"
        label="ชื่อองค์กร"
        placeholder="กรุณากรอกชื่อองค์กร"
        addonBefore={prefix}
        addonAfter={suffix}
        disabled={isFieldsDisabled || isAllFieldsDisabled}
        rules={[
          {
            required: true,
            message: "กรุณากรอกชื่อองค์กร",
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
        maxLength={50}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          if (target.value.startsWith(" ")) {
            target.value = target.value.trimStart();
          }
        }}
      />

      {/* ========== ชื่อสาขา ========== */}
      <TextField
        label="ชื่อสาขา"
        name="branchName"
        placeholder="ชื่อสาขา"
        disabled
        rules={[
          {
            required: true,
            message: "กรุณากรอกชื่อสาขา",
          },
        ]}
      />

      {/* Hidden field: dbdAddress */}
      <Form.Item name="dbdAddress" noStyle />
    </div>
  );

  // ------------------------------------------
  // Render
  // ------------------------------------------

  if (withFormWrapper) {
    return (
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          juristicType: "LIMITED_COMPANY",
          juristicTypeId: undefined,
          juristicName: "",
          remarkTypeOther: "",
          branchName: "สำนักงานใหญ่",
          branchType: "HEAD_OFFICE",
          branchNumber: "00000",
          dbdAddress: undefined,
        }}
      >
        {formContent}
      </Form>
    );
  }

  return formContent;
};

export default JuristicForm;
