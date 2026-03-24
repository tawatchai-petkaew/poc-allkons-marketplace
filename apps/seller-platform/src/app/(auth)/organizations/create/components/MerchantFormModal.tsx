import { Form } from "antd";
import ResponsivePopup from "@/components/Popup";
import TextField from "@/components/DataEntry/TextField";
import CustomButton from "@/components/Button";
import Typography from "@/components/Typography";
import { useEffect } from "react";

export interface MerchantFormFields {
  shopName: string;
}

interface MerchantFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: MerchantFormFields) => void;
  loading?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  closable?: boolean;
}

const MerchantFormModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  firstName,
  lastName,
  username,
  closable = false,
}: MerchantFormModalProps) => {
  const [form] = Form.useForm<MerchantFormFields>();
  const shopNameValue = Form.useWatch("shopName", form);
  const isFormFilled = !!shopNameValue;

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  return (
    <ResponsivePopup
      visible={visible}
      onClose={onClose}
      modalProps={{
        width: 750,
        closable: closable,
        maskClosable: closable,
      }}
      drawerProps={{ closable: closable, maskClosable: closable }}
    >
      <div className="p-2">
        <Form form={form} layout="vertical">
          <div className="py-4 px-2">
            <Typography variant="h2" className="!text-text-secondary">
              ยินดีต้อนรับ{" "}
              <span className="font-bold text-primary">
                คุณ{firstName} {lastName}
              </span>
              <br />
              สู่ร้านค้า Allkons M Seller
            </Typography>
            <Typography
              variant="paragraph-big"
              className="!text-text-secondary !mt-2"
            >
              ระบบร้านค้าอัจฉริยะที่จะทำให้ธุรกิจวัสดุก่อสร้างของคุณ
              เติบโตอย่างก้าวกระโดด
            </Typography>
            <div className="flex items-center gap-1 mt-5">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quaternary"
              >
                ชื่อผู้ใช้งาน (Username) ของคุณคือ
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!text-primary !font-medium"
              >
                {username}
              </Typography>
            </div>
            <Typography
              variant="h5"
              className="!text-text-secondary !font-bold !mt-8"
            >
              ตั้งชื่อร้านของคุณ
            </Typography>
            <div className="mt-5">
              <TextField
                name="shopName"
                label="ชื่อร้านค้า"
                placeholder="กรุณากรอกชื่อร้านค้า"
                rules={[
                  { required: true, message: "กรุณากรอกชื่อร้านค้า" },
                  { max: 100, message: "ชื่อร้านค้าต้องไม่เกิน 100 ตัวอักษร" },
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
          </div>
          <div className="w-full mt-12 flex justify-center">
            <CustomButton
              variant="solid"
              color="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!isFormFilled}
              dataTestId="btn--shop-create"
            >
              เข้าสู่ร้านค้า
            </CustomButton>
          </div>
        </Form>
      </div>
    </ResponsivePopup>
  );
};

export default MerchantFormModal;
