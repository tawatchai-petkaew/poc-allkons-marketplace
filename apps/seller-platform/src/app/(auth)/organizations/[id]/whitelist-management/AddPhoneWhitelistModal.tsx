'use client';

import { checkPhoneWhiteList } from '@/api/organization.api';
import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import ResponsivePopup from '@/components/Popup';
import Typography from '@/components/Typography';
import { LoadingOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { useState } from 'react';

interface PhoneInput {
  id: string;
  phoneNumber: string;
  isValidating: boolean;
  validationStatus: 'idle' | 'success' | 'error';
  validationMessage?: string;
}

interface AddPhoneWhitelistModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (phoneNumbers: string[]) => Promise<void>;
  organizationId: number;
}

const AddPhoneWhitelistModal: React.FC<AddPhoneWhitelistModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [phoneInputs, setPhoneInputs] = useState<PhoneInput[]>([
    {
      id: `phone-${Date.now()}`,
      phoneNumber: '',
      isValidating: false,
      validationStatus: 'idle',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate Thai phone number format (10 digits, starting with 0)
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  // Handle validation for individual phone number
  const handleValidatePhone = async (id: string) => {
    const phoneInput = phoneInputs.find((p) => p.id === id);
    if (!phoneInput) {
      return;
    }
    const isDuplicate = phoneInputs.find(
      (p) =>
        p.id !== id &&
        p.phoneNumber === phoneInput?.phoneNumber &&
        p.validationStatus === 'success'
    );
    if (isDuplicate) {
      setPhoneInputs((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                validationStatus: 'error',
                validationMessage: 'เบอร์นี้ถูกกรอกซ้ำแล้ว',
              }
            : p
        )
      );
      return;
    }
    // Check if phone number is empty
    if (!phoneInput.phoneNumber) {
      setPhoneInputs((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                validationStatus: 'error',
                validationMessage: 'กรุณากรอกเบอร์โทรศัพท์',
              }
            : p
        )
      );
      return;
    }

    // First validate format locally
    if (!validatePhoneNumber(phoneInput.phoneNumber)) {
      setPhoneInputs((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                validationStatus: 'error',
                validationMessage: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
              }
            : p
        )
      );
      return;
    }

    setPhoneInputs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isValidating: true } : p))
    );

    try {
      // Call API to check if phone is whitelisted
      // Remove leading 0 from phone number
      const phoneWithoutLeadingZero = phoneInput.phoneNumber.replace(/^0/, '');
      const checkedPhone = await checkPhoneWhiteList({
        countryCode: '66',
        phoneNumber: phoneWithoutLeadingZero,
      });

      if (!checkedPhone.data?.isValid) {
        let errorMessage = 'ไม่สามารถตรวจสอบเบอร์โทรศัพท์ได้';

        if (checkedPhone.data?.code === 'PHONE_DUP_WHITE_ORG') {
          errorMessage = 'เบอร์นี้ถูกลงทะเบียนในองค์กรนี้แล้ว';
        } else if (checkedPhone.data?.code === 'PHONE_DUP_WHITE') {
          errorMessage = 'เบอร์นี้ถูกลงทะเบียนใช้ในนามองค์กรอื่นแล้ว';
        } else if (checkedPhone.data?.code === 'PHONE_DUP_ORG') {
          errorMessage = 'เบอร์นี้ถูกใช้งานแล้ว';
        }

        setPhoneInputs((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isValidating: false,
                  validationStatus: 'error',
                  validationMessage: errorMessage,
                }
              : p
          )
        );
      } else {
        setPhoneInputs((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isValidating: false,
                  validationStatus: 'success',
                  validationMessage: undefined,
                }
              : p
          )
        );
      }
    } catch (error: Error | unknown) {
      setPhoneInputs((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isValidating: false,
                validationStatus: 'error',
                validationMessage: 'เกิดข้อผิดพลาดในการตรวจสอบเบอร์โทรศัพท์',
              }
            : p
        )
      );
    }
  };

  // Add new phone input field
  const handleAddPhoneInput = () => {
    setPhoneInputs((prev) => [
      ...prev,
      {
        id: `phone-${Date.now()}`,
        phoneNumber: '',
        isValidating: false,
        validationStatus: 'idle',
      },
    ]);
  };

  // Remove phone input field
  const handleRemovePhoneInput = (id: string) => {
    if (phoneInputs.length > 1) {
      setPhoneInputs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Handle phone number change
  const handlePhoneChange = (id: string, value: string) => {
    setPhoneInputs((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              phoneNumber: value,
              validationStatus: 'idle',
              validationMessage: undefined,
            }
          : p
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all phone numbers are filled
    const emptyPhones = phoneInputs.filter((p) => !p.phoneNumber);
    if (emptyPhones.length > 0) {
      return;
    }

    // Check if all phones are validated successfully
    const invalidPhones = phoneInputs.filter(
      (p) => p.validationStatus !== 'success'
    );
    if (invalidPhones.length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneNumbers = phoneInputs.map((p) => p.phoneNumber);
      await onSubmit(phoneNumbers);
      handleClose();
    } catch (error) {
      console.error('Error submitting phone numbers:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setPhoneInputs([
      {
        id: `phone-${Date.now()}`,
        phoneNumber: '',
        isValidating: false,
        validationStatus: 'idle',
      },
    ]);
    onClose();
  };

  return (
    <ResponsivePopup
      visible={visible}
      onClose={handleClose}
      modalTitle={
        <div>
          <Typography variant="h4" className="!text-text-secondary">
            ลงทะเบียนเบอร์
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ลงทะเบียนเบอร์โทรในนามองค์กร
          </Typography>
        </div>
      }
      modalProps={{
        width: '60vw',
      }}
      drawerTitle={
        <div>
          <Typography variant="h4" className="!text-text-secondary">
            ลงทะเบียนเบอร์
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ลงทะเบียนเบอร์โทรในนามองค์กร
          </Typography>
        </div>
      }
      drawerProps={{
        destroyOnClose: true,
      }}
    >
      <div className="flex flex-col justify-between gap-4 h-[60vh] md:pt-8">
        <Form
          form={form}
          layout="vertical"
          className="flex flex-1 flex-col gap-4 overflow-y-auto hide-scrollbar"
        >
          {phoneInputs.map((phoneInput, index) => (
            <div key={phoneInput.id} className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Button
                  size="middle"
                  variant="outlined"
                  color="error"
                  icon={<i className="ri-subtract-line"></i>}
                  onClick={() => handleRemovePhoneInput(phoneInput.id)}
                  disabled={
                    index === 0 || phoneInput.isValidating || isSubmitting
                  }
                />
                <div className="flex-1">
                  <TextField
                    name={phoneInput.id}
                    type="tel"
                    placeholder="กรอกเบอร์โทรศัพท์"
                    value={phoneInput.phoneNumber}
                    onChange={(e) =>
                      handlePhoneChange(phoneInput.id, e.target.value)
                    }
                    rules={[
                      { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                      {
                        pattern: /^0[689]\d{8}$/,
                        message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                      },
                    ]}
                    size="middle"
                    disabled={phoneInput.isValidating || isSubmitting}
                    validateStatus={
                      phoneInput.validationStatus === 'error'
                        ? 'error'
                        : phoneInput.validationStatus === 'success'
                        ? 'success'
                        : undefined
                    }
                    help={phoneInput.validationMessage}
                    maxLength={10}
                  />
                </div>
                <Button
                  size="middle"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleValidatePhone(phoneInput.id)}
                  disabled={
                    phoneInput.isValidating ||
                    phoneInput.validationStatus === 'success' ||
                    isSubmitting
                  }
                  icon={
                    phoneInput.isValidating ? (
                      <LoadingOutlined spin className="!text-primary" />
                    ) : phoneInput.validationStatus === 'success' ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      ''
                    )
                  }
                >
                  {phoneInput.isValidating ? '' : 'ตรวจสอบ'}
                </Button>
              </div>
            </div>
          ))}

          <div className="border-b border-border-primary"></div>
          {phoneInputs.length < 10 && (
            <Button
              variant="ghost"
              color="primary"
              icon={<i className="ri-add-line"></i>}
              onClick={handleAddPhoneInput}
              className="w-fit"
              disabled={
                isSubmitting ||
                (phoneInputs[phoneInputs.length - 1].validationStatus !==
                  'success' &&
                  phoneInputs.length > 0)
              }
            >
              เพิ่มช่องกรอกเบอร์
            </Button>
          )}
        </Form>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              phoneInputs.some(
                (p) => !p.phoneNumber || p.validationStatus !== 'success'
              )
            }
            loading={isSubmitting}
          >
            เพิ่มเบอร์องค์กร
          </Button>
        </div>
      </div>
    </ResponsivePopup>
  );
};

export default AddPhoneWhitelistModal;
