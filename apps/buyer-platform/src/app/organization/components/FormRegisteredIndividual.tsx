import { businessTypeList } from '@/common/constants/organization';
import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import Typography from '@/components/Typography';
import { Checkbox, Form, FormInstance } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { checkRegisNumber } from '@/common/api/customer-service/user.api';

type Props = {
  form: FormInstance;
  setIsConsentVisible: (visible: boolean) => void;
  setFormReady: (ready: boolean) => void;
};

const CheckboxGroup = Checkbox.Group;

const FormRegisteredIndividual = ({
  form,
  setIsConsentVisible,
  setFormReady,
}: Props) => {
  const businessType = Form.useWatch('businessType', form);
  const isOtherSelected = businessType?.includes('OTHER');
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(false);

  const {
    mutate: checkRegistrationNumberMutation,
    isPending: isCheckingRegistrationNumber,
  } = useMutation({
    mutationKey: ['checkRegistrationNumber'],
    mutationFn: async (registrationNumber: string) => {
      const { data } = await checkRegisNumber({ registrationNumber });
      return data;
    },
    onSuccess: (data) => {
      if (data.isExist) {
        form.setFields([
          {
            name: 'registrationNumber',
            errors: ['เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว'],
          },
        ]);
        setFormReady(false);
      } else {
        setIsSuccessCheckRegistrationNumber(true);
        setFormReady(true);
      }
    },
    onError: () => {
      setIsSuccessCheckRegistrationNumber(false);
      setFormReady(false);
      form.setFields([
        {
          name: 'registrationNumber',
          errors: ['เกิดข้อผิดพลาดในการตรวจสอบเลขทะเบียนพาณิชย์'],
        },
      ]);
    },
  });

  const formValues = Form.useWatch([], form);

  useEffect(() => {
    const values = form.getFieldsValue();
    const isAllFieldsFilled = Object.entries(values).every(([key, value]) => {
      if (key === 'businessTypeRemark' && !isOtherSelected) return true;
      if (key === 'isCheckedMarketingConsent') return value;
      if (Array.isArray(value)) return value.length > 0;
      return (
        value !== undefined && value !== null && String(value).trim() !== ''
      );
    });

    const isReady =
      isSuccessCheckRegistrationNumber &&
      form.getFieldsError().every(({ errors }) => errors.length === 0) &&
      isAllFieldsFilled;

    setFormReady(isReady);
  }, [
    form,
    setFormReady,
    isSuccessCheckRegistrationNumber,
    isOtherSelected,
    formValues,
  ]);

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-4">
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
              message: 'กรุณาเลือกประเภทธุรกิจ',
            },
          ]}
        >
          <CheckboxGroup
            options={businessTypeList}
            className="flex flex-col gap-2"
          />
        </Form.Item>
        {isOtherSelected && (
          <TextField
            name="businessTypeRemark"
            label="ประเภทธุรกิจ"
            placeholder="กรุณากรอกประเภทธุรกิจ"
            rules={[
              {
                required: true,
                message: 'กรุณากรอกประเภทธุรกิจ',
              },
              {
                pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                message: 'รูปแบบไม่ถูกต้อง',
              },
            ]}
          />
        )}
        <div className="flex items-start gap-2">
          <div className="w-full">
            <Form.Item shouldUpdate noStyle>
              {({ getFieldError }) => {
                return (
                  <TextField
                    name="registrationNumber"
                    label={'เลขทะเบียนพาณิชย์'}
                    placeholder={'กรุณากรอกเลขทะเบียนพาณิชย์'}
                    className={`${
                      isSuccessCheckRegistrationNumber &&
                      !getFieldError('registrationNumber').length
                        ? 'border !border-primary'
                        : ''
                    } `}
                    rules={[
                      {
                        required: true,
                        message: 'กรุณากรอกเลขทะเบียนพาณิชย์',
                      },
                      {
                        pattern: /^[0-9]{13}$/,
                        message:
                          'รูปแบบไม่ถูกต้อง กรุณาใส่เลขทะเบียนพาณิชย์ 13 หลักเท่านั้น',
                      },
                    ]}
                    maxLength={13}
                    suffix={
                      <>
                        {getFieldError('registrationNumber')[0] ===
                          'เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว' && (
                          <i className="ri-information-line text-error"></i>
                        )}
                        {isSuccessCheckRegistrationNumber &&
                          !getFieldError('registrationNumber').length && (
                            <i className="ri-check-line text-primary"></i>
                          )}
                      </>
                    }
                    validateStatus={
                      getFieldError('registrationNumber').length > 0
                        ? 'error'
                        : isSuccessCheckRegistrationNumber
                          ? 'success'
                          : ''
                    }
                    help={
                      isSuccessCheckRegistrationNumber
                        ? 'สามารถใช้เลขทะเบียนพาณิชย์ได้'
                        : undefined
                    }
                    onChange={() => {
                      setIsSuccessCheckRegistrationNumber(false);
                      setFormReady(false);
                    }}
                  />
                );
              }}
            </Form.Item>
          </div>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldError, getFieldValue }) => {
              const hasError = getFieldError('registrationNumber').length > 0;
              return (
                <div className={hasError ? 'mt-[32px]' : 'mt-8'}>
                  <Button
                    loading={isCheckingRegistrationNumber}
                    disabled={hasError || isSuccessCheckRegistrationNumber}
                    onClick={() =>
                      checkRegistrationNumberMutation(
                        getFieldValue('registrationNumber')
                      )
                    }
                  >
                    {isSuccessCheckRegistrationNumber
                      ? 'ยืนยันแล้ว'
                      : 'ตรวจสอบ'}
                  </Button>
                </div>
              );
            }}
          </Form.Item>
        </div>
        <TextField
          name="idCard"
          type="numberOnly"
          label="เลขบัตรประจำตัวประชาชน"
          placeholder="กรุณากรอกเลขบัตรประจำตัวประชาชน"
          rules={[
            {
              required: true,
              message: 'กรุณากรอกเลขบัตรประจำตัวประชาชน',
            },
            {
              pattern: /^[0-9]{13}$/,
              message:
                'รูปแบบไม่ถูกต้อง กรุณาใส่เลขบัตรประจำตัวประชาชน 13 หลักเท่านั้น',
            },
          ]}
          maxLength={13}
        />
        <TextField
          name="registrationName"
          label="ชื่อที่ใช้ในการประกอบพาณิชยกิจ"
          placeholder="กรอกชื่อร้าน"
          addonBefore="ร้าน"
          rules={[
            {
              required: true,
              message: 'กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ',
            },
          ]}
        />
        <div className="mt-1 flex items-center gap-2">
          <Form.Item
            name="isCheckedMarketingConsent"
            valuePropName="checked"
            noStyle
          >
            <Checkbox />
          </Form.Item>
          <div className="flex gap-1">
            <Typography variant="paragraph-small-regular">
              ยินยอมการรับข่าวสาร
            </Typography>
            <Typography
              variant="paragraph-small-regular"
              className="!text-primary !underline cursor-pointer"
              onClick={() => {
                setIsConsentVisible(true);
              }}
            >
              นโยบายทางการตลาด
            </Typography>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default FormRegisteredIndividual;
