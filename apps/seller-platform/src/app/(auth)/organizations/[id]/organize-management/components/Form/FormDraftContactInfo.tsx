'use client';

import Button from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import Typography from '@/components/Typography';
import { Divider, Form, FormInstance, Grid } from 'antd';

export type FormDraftContactInfoValues = {
  highestAuthorityName: string;
  highestAuthorityPosition: string;
  highestAuthorityPhoneNumber: string;
  highestAuthorityEmail: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  contactShownHighestAuthority: boolean;
};

interface FormDraftContactInfoProps {
  onClose?: () => void;
  form: FormInstance;
  onFinish?: (values: FormDraftContactInfoValues) => void;
  isInPopup?: boolean;
  onSaveDraft?: () => void;
  isLoadingSaveDraft?: boolean;
  onBack?: () => void;
}

const FormDraftContactInfo = ({
  onClose,
  form,
  onFinish,
  isInPopup = true,
  onSaveDraft,
  isLoadingSaveDraft = false,
  onBack,
}: FormDraftContactInfoProps) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const contactShownHighestAuthorityValue = Form.useWatch(
    'contactShownHighestAuthority',
    form
  );

  return (
    <Form
      layout="vertical"
      className="relative"
      form={form}
      scrollToFirstError
      onFinish={onFinish}
      initialValues={{
        highestAuthorityName: '',
        highestAuthorityPosition: '',
        highestAuthorityPhoneNumber: '',
        highestAuthorityEmail: '',
        contactName: '',
        contactPhoneNumber: '',
        contactEmail: '',
        contactShownHighestAuthority: false,
      }}
    >
      {isInPopup && (
        <div className="flex md:hidden justify-end">
          <Button
            onClick={() => {
              if (onClose) onClose();
            }}
            variant="outlined"
            className="!px-0"
            color="neutral"
            bold="400"
            icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
          />
        </div>
      )}
      <div
        style={
          isInPopup
            ? {
                marginTop: isMobile ? '0' : '24px',
                maxHeight: isMobile ? 'auto' : '564px',
                overflowY: isMobile ? 'visible' : 'auto',
              }
            : {
                paddingBottom: '70px',
              }
        }
      >
        <div>
          <Typography variant="paragraph-big" className="!text-text-primary">
            ขั้นตอนที่ 2 : ข้อมูลผู้ติดต่อ
          </Typography>
        </div>
        <div className="mt-5">
          <div className="flex flex-col gap-5">
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary"
            >
              ข้อมูลผู้มีอำนาจในองค์กร
            </Typography>
            <TextField
              name="highestAuthorityName"
              label="ชื่อ - นามสกุลผู้มีอำนาจสูงสุด"
              placeholder="กรอกชื่อ - นามสกุล"
              required
              type="textOnly"
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกชื่อ - นามสกุลผู้มีอำนาจสูงสุด',
                },
              ]}
            />
            <TextField
              name="highestAuthorityPosition"
              label="ตำแหน่งผู้มีอำนาจสูงสุด"
              placeholder="กรอกตำแหน่ง"
              required
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกตำแหน่งผู้มีอำนาจสูงสุด',
                },
              ]}
            />
            <TextField
              name="highestAuthorityPhoneNumber"
              label="เบอร์ผู้มีอำนาจสูงสุด"
              placeholder="กรอกเบอร์โทรศัพท์"
              required
              maxLength={10}
              type="tel"
              rules={[
                { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                {
                  pattern: /^0[689]\d{8}$/,
                  message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                },
              ]}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^0-9]/g, ''); // Allow only numeric input
              }}
            />
            <TextField
              name="highestAuthorityEmail"
              label="อีเมลผู้มีอำนาจสูงสุด"
              placeholder="กรอกอีเมล"
              required
              type="email"
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกอีเมลผู้มีอำนาจสูงสุด',
                },
                {
                  type: 'email',
                  message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                },
              ]}
            />
          </div>

          <Divider className="!my-4" />
          <div className="flex flex-col gap-5 pb-[70px]">
            <Typography
              variant="paragraph-medium"
              className="!text-text-primary"
            >
              ข้อมูลผู้ติดต่อหลัก / ผู้ได้รับมอบอำนาจ
            </Typography>
            <Form.Item
              name="contactShownHighestAuthority"
              valuePropName="isChecked"
              className="!m-0 !pl-1"
            >
              <ToggleSwitch
                type="text"
                showLabel={false}
                title="ใช้ข้อมูลเดียวกับผู้มีอำนาจสูงสุด"
                onChange={(checked) => {
                  if (checked) {
                    form.setFieldsValue({
                      contactShownHighestAuthority: checked,
                      contactName:
                        form.getFieldValue('highestAuthorityName') || '',
                      contactPhoneNumber:
                        form.getFieldValue('highestAuthorityPhoneNumber') || '',
                      contactEmail:
                        form.getFieldValue('highestAuthorityEmail') || '',
                    });
                  } else {
                    form.setFieldsValue({
                      contactShownHighestAuthority: checked,
                      contactName: '',
                      contactPhoneNumber: '',
                      contactEmail: '',
                    });
                  }
                }}
              />
            </Form.Item>
            {!contactShownHighestAuthorityValue && (
              <>
                <TextField
                  name="contactName"
                  label="ชื่อ - นามสกุลผู้ติดต่อหลัก"
                  placeholder="กรอกชื่อ - นามสกุล"
                  required
                  type="textOnly"
                  rules={[
                    {
                      required: true,
                      message: 'กรุณากรอกชื่อ - นามสกุลผู้ติดต่อหลัก',
                    },
                  ]}
                />
                <TextField
                  name="contactPhoneNumber"
                  label="เบอร์ผู้ติดต่อหลัก"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  required
                  maxLength={10}
                  type="tel"
                  rules={[
                    { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                    {
                      pattern: /^0[689]\d{8}$/,
                      message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                    },
                  ]}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^0-9]/g, ''); // Allow only numeric input
                  }}
                />
                <TextField
                  name="contactEmail"
                  label="อีเมลผู้ติดต่อหลัก"
                  placeholder="กรอกอีเมล"
                  required
                  type="email"
                  rules={[
                    {
                      required: true,
                      message: 'กรุณากรอกอีเมลผู้ติดต่อ',
                    },
                    {
                      type: 'email',
                      message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                    },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {isInPopup ? (
        <Form.Item noStyle>
          <div className="fixed md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex justify-end bg-white py-4 pr-4 md:pr-0">
            <Button htmlType="submit" bold="600" loading={isLoadingSaveDraft}>
              บันทึกข้อมูล
            </Button>
          </div>
        </Form.Item>
      ) : (
        <div className="fixed bottom-0 w-full inset-x-0 py-4 bg-white shadow-xl">
          {isMobile ? (
            <div className="w-full container flex flex-col gap-2 justify-between mx-auto">
              <div className="px-4">
                <Form.Item shouldUpdate noStyle>
                  <Button
                    htmlType="submit"
                    bold="600"
                    loading={isLoadingSaveDraft}
                    fullWidth={isMobile}
                  >
                    ขั้นตอนต่อไป
                  </Button>
                </Form.Item>
              </div>
              <div className="flex px-4 gap-2">
                <Button
                  variant="outlined"
                  bold="600"
                  color="neutral"
                  onClick={() => {
                    if (onBack) {
                      onBack();
                    }
                  }}
                  fullWidth
                >
                  ย้อนกลับ
                </Button>
                <Button
                  variant="outlined"
                  bold="600"
                  onClick={() => {
                    if (onSaveDraft) {
                      onSaveDraft();
                    }
                  }}
                  loading={isLoadingSaveDraft}
                  fullWidth
                >
                  บันทึกร่าง
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full container flex gap-2 justify-between mx-auto">
              <Button
                variant="outlined"
                bold="600"
                color="neutral"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  }
                }}
                fullWidth={isMobile}
              >
                ย้อนกลับ
              </Button>
              <div className="flex px-4 justify-end gap-2">
                <Button
                  variant="outlined"
                  bold="600"
                  onClick={() => {
                    if (onSaveDraft) {
                      onSaveDraft();
                    }
                  }}
                  loading={isLoadingSaveDraft}
                >
                  บันทึกแบบร่าง
                </Button>
                <Form.Item shouldUpdate noStyle>
                  <Button
                    htmlType="submit"
                    bold="600"
                    loading={isLoadingSaveDraft}
                  >
                    ขั้นตอนต่อไป
                  </Button>
                </Form.Item>
              </div>
            </div>
          )}
        </div>
      )}
    </Form>
  );
};

export default FormDraftContactInfo;
