import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import { Form, FormInstance } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { checkIdCard } from '@/common/api/customer-service/register.api';
import { idCardCheck } from '@/utils/validate';

type Props = {
  form: FormInstance;
  setFormReady: (ready: boolean) => void;
};

const FormPersonal = ({ form, setFormReady }: Props) => {
  const [isSuccessCheckIdCard, setIsSuccessCheckIdCard] = useState(false);

  const { mutate: checkIdCardMutation, isPending: isCheckingIdCard } =
    useMutation({
      mutationKey: ['check'],
      mutationFn: async (idCard: string) => {
        const { data } = await checkIdCard({ idCard });
        return data;
      },
      onSuccess: (data) => {
        if (data.isExist) {
          form.setFields([
            {
              name: 'idCard',
              errors: ['เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว'],
            },
          ]);
          setFormReady(false);
        } else {
          setIsSuccessCheckIdCard(true);
          setFormReady(true);
        }
      },
      onError: () => {
        setIsSuccessCheckIdCard(false);
        setFormReady(false);
        form.setFields([
          {
            name: 'idCard',
            errors: [
              'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี',
            ],
          },
        ]);
      },
    });

  const handleCheckIdCard = async () => {
    const value = form.getFieldValue('idCard');
    await form.validateFields(['idCard']);
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      form.setFields([
        {
          name: 'idCard',
          errors: ['เลขประจำตัวประชาชนไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckIdCard(false);
      return;
    }
    const idCard = form.getFieldValue('idCard');
    checkIdCardMutation(idCard);
  };

  useEffect(() => {
    if (isSuccessCheckIdCard) {
      setFormReady(true);
    } else {
      setFormReady(false);
    }
  }, [form, setFormReady]);

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 mt-4">
          <div className="w-full">
            <Form.Item shouldUpdate noStyle>
              {({ getFieldError }) => {
                return (
                  <TextField
                    name="idCard"
                    type="numberOnly"
                    label={'เลขบัตรประจำตัวประชาชน'}
                    placeholder={'กรุณากรอกเลขบัตรประจำตัวประชาชน'}
                    className={`${
                      isSuccessCheckIdCard && !getFieldError('idCard').length
                        ? 'border !border-primary'
                        : ''
                    } `}
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
                    suffix={
                      <>
                        {getFieldError('idCard')[0] ===
                          'เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว' && (
                          <i className="ri-information-line text-error"></i>
                        )}
                        {isSuccessCheckIdCard &&
                          !getFieldError('idCard').length && (
                            <i className="ri-check-line text-primary"></i>
                          )}
                      </>
                    }
                    validateStatus={
                      getFieldError('idCard').length > 0
                        ? 'error'
                        : isSuccessCheckIdCard
                          ? 'success'
                          : ''
                    }
                    help={
                      isSuccessCheckIdCard
                        ? 'สามารถใช้เลขประจำตัวประชาชนได้'
                        : undefined
                    }
                    onChange={() => {
                      setIsSuccessCheckIdCard(false);
                      setFormReady(false);
                    }}
                  />
                );
              }}
            </Form.Item>
          </div>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldError, getFieldValue }) => {
              const hasError = getFieldError('idCard').length > 0;
              return (
                <div className={hasError ? 'mt-[32px]' : 'mt-8'}>
                  <Button
                    loading={isCheckingIdCard}
                    disabled={hasError || isSuccessCheckIdCard}
                    onClick={() => handleCheckIdCard()}
                  >
                    {isSuccessCheckIdCard ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
                  </Button>
                </div>
              );
            }}
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default FormPersonal;
