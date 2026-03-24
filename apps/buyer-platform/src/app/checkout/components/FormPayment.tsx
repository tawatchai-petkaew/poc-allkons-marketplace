import { FC, useEffect, useState } from 'react';
import {
  Divider,
  Drawer,
  Form,
  Grid,
  UploadFile,
  Image as AntdImage,
} from 'antd';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { LoadingOutlined } from '@ant-design/icons';
import Image from 'next/image';
import UploadFileDragger from '@/components/DataEntry/Upload/FileDragger';
import { formatThaiBaht } from '@/utils/format';
import { useMutation } from '@tanstack/react-query';
import { updateSlipPaymentSubOrder } from '@/common/api/order-service/payment.api';
import {
  IOrderPaymentResponse,
  IOrderResponse,
} from '@/common/interfaces/order.interface';
import { PaymentMethod, PaymentStatus } from '@/common/enum/payment.enum';

interface PaymentSlipForm {
  files: any[];
}

export const getTypeContentCmsText = (event: PaymentMethod): string => {
  const eventMap: Record<PaymentMethod, string> = {
    [PaymentMethod.PG_CREDIT_CARD]: 'บัตรเครดิต',
    [PaymentMethod.PG_PROMPTPAY]: 'QR PromptPay',
    [PaymentMethod.PG_BILL]: 'Bill Payment',
    [PaymentMethod.BANK_TRANSFER]: 'โอนชำระตรง',
    [PaymentMethod.CREDIT_MERCHANT]: 'เครดิตร้านค้า',
  };

  return eventMap[event] || event;
};

const FormPayment: FC<{
  orderData: IOrderResponse;
  orderPaymentData: IOrderPaymentResponse;
  refetchOrderPayment: () => void;
  handleConfirmPayment: any;
}> = ({
  orderData,
  orderPaymentData,
  refetchOrderPayment,
  handleConfirmPayment,
}) => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [paymentFiles, setPaymentFiles] = useState<UploadFile[]>([]);
  const [qrcodeVisible, setQrcodeVisible] = useState(false);
  const [paymentForm] = Form.useForm<PaymentSlipForm>();
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const { mutate: handleUpdateSlip, isPending: isLoading } = useMutation({
    mutationFn: updateSlipPaymentSubOrder,
    onSuccess: (data) => {
      if (data) {
        setIsOpenDrawer(false);
        refetchOrderPayment();
      }
    },
    onError: (error) => {
      console.error('Error updating slip:', error);
    },
  });

  useEffect(() => {
    paymentForm.setFieldsValue({ files: paymentFiles });
  }, [paymentFiles, paymentForm]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        {orderPaymentData.status === PaymentStatus.NEW ? (
          <SectionIcon
            iconClass="ri-checkbox-circle-fill"
            loading={true}
            type="success"
          />
        ) : (
          <SectionIcon
            imageSrc="/assets/icons/store-search.svg"
            type="success"
          />
        )}
        {orderPaymentData.status === PaymentStatus.NEW && (
          <div className="flex flex-col items-center gap-2">
            <Typography variant="h4" className="!text-text-secondary">
              รอการชำระเงิน
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-quarternary"
            >
              กรุณาชำระเงินโดยการโอนไปยังบัญชีธนาคารของทางร้าน
            </Typography>
          </div>
        )}
        {orderPaymentData.status === PaymentStatus.NEW && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                handleConfirmPayment({
                  paymentMethod: null,
                });
              }}
            >
              เปลี่ยนวิธีชำระ
            </Button>
            <Button
              className="!px-8"
              iconPosition="end"
              onClick={() => {
                setIsOpenDrawer(true);
              }}
            >
              โอนชำระ
            </Button>
          </div>
        )}

        {orderPaymentData.status === PaymentStatus.PENDING && (
          <div className="flex flex-col items-center gap-2">
            <Typography variant="h4" className="!text-text-secondary">
              อยู่ระหว่างตรวจสอบการชำระเงิน
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-quarternary"
            >
              ร้านค้ากำลังตรวจสอบรายละเอียดการชำระเงินของคุณ
            </Typography>
          </div>
        )}

        {/* <div className="mt-6 text-center">
          <Typography variant="h4" className="!text-text-secondary">
            {paymentStatus === "success"
              ? "การชำระเงินสำเร็จ"
              : paymentStatus === "failed"
              ? "การชำระเงินผิดพลาด"
              : paymentStatus === "waiting-approve"
              ? "อยู่ระหว่างตรวจสอบการชำระเงิน"
              : paymentStatus === "rejected"
              ? "การชำระเงินไม่ผ่าน"
              : "รอการชำระเงิน"}
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            {paymentStatus === "success"
              ? "คำสั่งซื้อถูกชำระเรียบร้อย คุณสามารถดูรายละเอียดเพิ่มเติมได้ที่นี้"
              : paymentStatus === "failed"
              ? "คำสั่งซื้อถูกชำระเงินเรียบร้อย คุณสามารถดูสถานะคำสั่งซื้อได้ที่นี้"
              : paymentStatus === "waiting-approve"
              ? "ร้านค้ากำลังตรวจสอบรายละเอียดการชำระเงินของคุณ"
              : paymentStatus === "rejected"
              ? "ตรวจสอบรายละเอียด และดำเนินการตามคำแนะนำ"
              : paymentInfoData.paymentMethod === PaymentMethod.BANK_TRANSFER
              ? "กรุณาชำระเงินโดยการโอนไปยังบัญชีธนาคารของทางร้าน"
              : "กรุณาชำระเงินด้วย QR PromptPay ผ่าน Allkons Payment"}
          </Typography>
        </div> */}
        {/* {paymentStatus === "waiting" && (
          <div className="fixed md:static z-50 w-full bottom-0 bg-white px-4 py-6 md:px-0 md:py-0 inset-x-0 flex justify-between">
            <div className="flex w-full justify-between md:justify-center mt-0 md:mt-6 gap-2">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setPaymentStatus("failed");
                }}
              >
                เปลี่ยนวิธีชำระ
              </Button>
              <Button
                icon={
                  paymentInfoData.paymentMethod !==
                    PaymentMethod.BANK_TRANSFER && (
                    <i className="ri-external-link-line" />
                  )
                }
                className="!px-8"
                iconPosition="end"
                onClick={() => {
                  if (
                    paymentInfoData.paymentMethod === PaymentMethod.BANK_TRANSFER
                  ) {
                    setIsOpenDrawer(true);
                  } else {
                    setPaymentStatus("success");
                  }
                }}
              >
                {paymentInfoData.paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? "โอนชำระ"
                  : "ชำระเงิน"}
              </Button>
            </div>
          </div>
        )}
        {paymentStatus === "success" && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outlined"
              color="neutral"
              className="!px-8"
              fullWidth={isMobile}
            >
              รายการทั้งหมด
            </Button>
            <Button
              icon={<i className="ri-external-link-line" />}
              className="!px-8"
              iconPosition="end"
              fullWidth={isMobile}
              onClick={() => {
                setPaymentStatus("success");
              }}
            >
              รายละเอียดคำสั่งซื้อ
            </Button>
          </div>
        )}
        {paymentStatus === "failed" && (
          <div className="flex justify-center mt-6 ">
            <Button
              icon={<i className="ri-customer-service-line" />}
              onClick={() => {
                setPaymentStatus("waiting");
              }}
              variant="outlined"
              color="neutral"
            >
              ติดต่อเจ้าหน้าที่
            </Button>
          </div>
        )}
        {paymentStatus === "rejected" && (
          <div className="max-w-[560px] mx-auto mt-3">
            <div className="bg-background-secondary rounded-lg p-3">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary"
              >
                รายละเอียด
              </Typography>
              <li className="!text-text-quarternary">
                ยอดโอนที่แนบมาไม่ตรงกับยอดที่ต้องชำระ
              </li>
              <li className="!text-text-quarternary">
                ยอดที่ต้องชำระเพิ่มเพิ่ม 18,874 บาท
              </li>
              <li className="!text-text-quarternary">
                เมื่อโอนชำระแล้ว กรุณาอัปโหลดสลิปใหม่
              </li>
            </div>
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setPaymentStatus("success");
                }}
                fullWidth={isMobile}
              >
                ติดต่อร้าน
              </Button>
              <Button
                onClick={() => {
                  setIsOpenDrawer(true);
                }}
                fullWidth={isMobile}
              >
                แนบสลิปอีกครั้ง
              </Button>
            </div>
          </div>
        )} */}
      </div>
      <div className="flex flex-col gap-4">
        <Typography variant="h4" className="!text-text-primary">
          การชำระเงิน
        </Typography>
        <div className="bg-background-secondary rouneded-3xl p-3 flex flex-col gap-3">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-big"
                className="!text-text-quarternary"
              >
                สถานะการชำระ
              </Typography>
            </div>
            {orderPaymentData.status === PaymentStatus.NEW && (
              <div className="pl-3 pr-4 py-[2px] flex gap-2 border border-warning-p60 bg-warning-p90 text-warning-p20 rounded-full">
                <LoadingOutlined spin size={10} />
                กำลังดำเนินการ
              </div>
            )}
            {orderPaymentData.status === PaymentStatus.PENDING && (
              <div className="pl-3 pr-4 py-[2px] flex gap-2 border border-warning-p60 bg-warning-p90 text-warning-p20 rounded-full">
                <LoadingOutlined spin size={10} />
                อยู่ระหว่างตรวจสอบ
              </div>
            )}
            {orderPaymentData.status === PaymentStatus.SUCCESS && (
              <div className="pl-3 pr-4 py-[2px] flex gap-2 border border-success-p60 bg-success-p90 text-success-p20 rounded-full">
                <i className="ri-checkbox-circle-fill text-success-p20"></i>
                ชำระแล้ว
              </div>
            )}
          </div>
          {/* {paymentStatus === "success" && (
            <>
              <div className="flex w-full justify-between items-center">
                <Typography
                  variant="paragraph-big"
                  className="!text-text-quarternary"
                >
                  วันที่
                </Typography>
                <Typography
                  variant="paragraph-big"
                  className="!text-text-quarternary"
                >
                  {dayjs(new Date()).format("DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="flex w-full justify-between items-center">
                <Typography
                  variant="paragraph-big"
                  className="!text-text-quarternary"
                >
                  รหัสธุรกรรม
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-tertiary max-w-[200px] md:max-w-full"
                  ellipsis={true}
                >
                  3ea95039-ae6d-4e24-9b51-89861b289acc
                </Typography>
              </div>
            </>
          )} */}
          <div className="flex w-full justify-between items-center">
            <Typography
              variant="paragraph-big"
              className="!text-text-quarternary"
            >
              รหัสคำสั่งซื้อ
            </Typography>
            <div className="flex gap-1 items-center cursor-pointer">
              <Typography
                variant="paragraph-big"
                className="!text-primary !font-medium"
              >
                {orderData.number}
              </Typography>
              <i className="ri-external-link-line text-primary text-lg"></i>
            </div>
          </div>
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-big"
                className="!text-text-quarternary"
              >
                ช่องทางชำระ
              </Typography>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-lg flex justify-center items-center border border-border-primary bg-white overflow-auto">
                {orderPaymentData.paymentMethod ===
                  PaymentMethod.PG_CREDIT_CARD && (
                  <i className="ri-bank-card-line"></i>
                )}
                {orderPaymentData.paymentMethod ===
                  PaymentMethod.PG_PROMPTPAY && (
                  <Image
                    src="/assets/icons/qr-code.svg"
                    alt="QR Code"
                    width={20}
                    height={20}
                  />
                )}
                {orderPaymentData.paymentMethod === PaymentMethod.PG_BILL && (
                  <i className="ri-file-list-3-line"></i>
                )}
                {orderPaymentData.paymentMethod ===
                  PaymentMethod.BANK_TRANSFER && (
                  <i className="ri-bank-line"></i>
                )}
                {orderPaymentData.paymentMethod ===
                  PaymentMethod.CREDIT_MERCHANT && (
                  <i className="ri-store-2-line"></i>
                )}
              </div>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !font-medium"
              >
                {getTypeContentCmsText(orderPaymentData.paymentMethod)}
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography variant="h4" className="!text-text-primary">
          สรุปคำสั่งซื้อ
        </Typography>
        <div className="bg-background-secondary rouneded-3xl p-3 flex flex-col gap-3">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-big"
                className="!text-text-quarternary"
              >
                สถานะสั่งซื้อ
              </Typography>
            </div>
            <div className="pl-3 pr-4 py-[2px] flex gap-2 border border-warning-p60 bg-warning-p90 text-warning-p20 rounded-full">
              <LoadingOutlined spin size={10} />
              รอการชำระ
            </div>
          </div>
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-center">
              <Typography
                variant="paragraph-big"
                className="!text-text-quarternary"
              >
                จำนวนสินค้า
              </Typography>
            </div>
            <Typography
              variant="paragraph-big"
              className="!text-text-secondary !font-medium"
            >
              {orderData.subOrders.reduce(
                (total, subOrder) => total + (subOrder.orderItems?.length || 0),
                0
              )}{' '}
              รายการ
            </Typography>
          </div>
          <Divider className="!my-0" />
          <div className="flex w-full justify-between items-center">
            <div>
              <Typography
                variant="paragraph-big"
                className="!text-text-secondary !font-medium"
              >
                ราคารวมสุทธิ
              </Typography>
              <Typography
                variant="paragraph-small"
                className="!text-text-quinary"
              >
                รวมค่าจัดส่ง
              </Typography>
            </div>
            <div className="flex flex-col items-end">
              <Typography
                variant="h3"
                className="!text-icon-brand-dark !font-bold"
              >
                {formatThaiBaht(Number(orderPaymentData.payAmount), 2)}
              </Typography>
              <Typography
                variant="paragraph-small"
                className="!text-text-quinary"
              >
                รวมภาษีมูลค่าเพิ่ม 7%
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <Drawer
        open={isOpenDrawer}
        onClose={() => {
          setIsOpenDrawer(false);
          setPaymentFiles([]);
        }}
        placement="right"
        closable={false}
        width={isMobile ? '100%' : 600}
        className="[&_.ant-drawer-body]:!p-8"
      >
        <div className="relative mb-8">
          <div className="absolute -top-4 flex justify-end w-full">
            <Button
              onClick={() => setIsOpenDrawer(false)}
              variant="outlined"
              className="absolute !right-0 !px-0"
              color="neutral"
              bold="400"
            >
              <i className="ri-close-line text-xl text-neutral-40"></i>
            </Button>
          </div>
          <div>
            <Typography
              variant="h4"
              className="!text-text-secondary !font-semibold"
            >
              ชำระเงินโดยตรง
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-quarternary"
            >
              ไปยังบัญชีธนาคารของทางร้าน
            </Typography>
          </div>
          <div className="bg-background-secondary p-4 rounded-xl flex justify-between">
            <div>
              <Image
                src="/assets/icons/scb-icon.svg"
                width={isMobile ? 48 : 64}
                height={isMobile ? 48 : 64}
                alt="scb"
              />
              <div className="mt-8">
                <Typography
                  variant="h4"
                  className="!text-text-secondary"
                  copyable
                >
                  707-2-63874-2
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-tertiary"
                >
                  Siam Commercial Bank
                </Typography>
              </div>
            </div>
            <div className="flex relative gap-2">
              <div className="absolute left-[-48px] top-0">
                <Button
                  variant="outlined"
                  color="neutral"
                  icon={<i className="ri-download-line" />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/assets/icons/mock-qrcode.svg';
                    link.download = 'qrcode.svg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                />
              </div>
              <AntdImage
                src="/assets/icons/mock-qrcode.svg"
                width={isMobile ? 110 : 154}
                preview={{
                  visible: qrcodeVisible,
                  src: '/assets/icons/mock-qrcode.svg',
                  onVisibleChange: (value) => {
                    setQrcodeVisible(value);
                  },
                }}
              />
            </div>
          </div>
          <Divider />
          <Form form={paymentForm}>
            <Form.Item name="files" initialValue={[]}>
              <UploadFileDragger
                file={paymentFiles}
                setFile={setPaymentFiles}
                form={{ key: 'files', formInstance: paymentForm }}
                maxCount={5}
                maxSize={20}
                acceptedTypes={[
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                  'application/pdf',
                ]}
                acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 20 MB)"
                required={false}
                customFileList={true}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="absolute bottom-4 w-[calc(100%_-_48px)] gap-3 flex items-center justify-end h-[60px] bg-white">
          <Button
            bold="600"
            color="neutral"
            variant="outlined"
            fullWidth
            onClick={() => {
              setIsOpenDrawer(false);
            }}
          >
            ยกเลิก
          </Button>
          <Button
            fullWidth
            bold="600"
            loading={isLoading}
            disabled={
              paymentFiles.length === 0 ||
              paymentFiles.some(
                (file) => file.status === 'error' || file.status === 'uploading'
              )
            }
            onClick={() => {
              const formValues = paymentForm.getFieldsValue();
              const mapFiles = formValues.files.map((file: any) => {
                return file.response.id;
              });

              const payload = {
                orderPaymentId: orderPaymentData.id,
                fileIds: mapFiles,
              };
              handleUpdateSlip(payload);
            }}
          >
            ยืนยันแนบสลิป
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default FormPayment;
