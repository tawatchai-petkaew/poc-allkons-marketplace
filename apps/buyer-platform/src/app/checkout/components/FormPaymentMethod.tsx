import { PaymentMethod } from '@/common/enum/payment.enum';
import { IOrderResponse } from '@/common/interfaces/order.interface';
import TransactionCardSelection from '@/components/Card/Selection/Transaction';
import Typography from '@/components/Typography';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { formatThaiBaht, getOrderPrices } from '@/utils/format';
import { Col, Divider, Form, FormInstance, Grid, Row } from 'antd';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

export interface IPaymentMethodForm {
  paymentMethod: PaymentMethod;
}

const FormPaymentMethod: FC<{
  form: FormInstance<IPaymentMethodForm>;
  orderData: IOrderResponse;
}> = ({ form, orderData }) => {
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('orderPaymentId');
  const orderDataValue = {
    ...orderData,
    subOrders: orderData.subOrders.filter(
      (sub) => sub?.payment?.id === Number(paymentId)
    ),
  };
  const isXl = useScreenWidth() >= 1280;

  return (
    <Form form={form} className="w-full" layout="vertical">
      <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
        <div className="flex flex-col">
          <Typography variant="h5" className="!text-text-primary">
            สรุปคำสั่งซื้อ
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            เลขที่คำสั่งซื้อ :{' '}
            <span className="!text-text-primary">
              {orderData?.number || '-'}
            </span>
          </Typography>
        </div>
        <div className="flex flex-col md:flex-row gap-0 md:gap-2 justify-end items-start md:items-center">
          <Typography variant="h3" className="!text-icon-brand-dark">
            {formatThaiBaht(getOrderPrices(orderDataValue).priceIncludeVat, 2)}
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-disabled line-through"
          >
            {formatThaiBaht(
              getOrderPrices(orderDataValue).originalPriceIncludeVat,
              2
            )}
          </Typography>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Divider />
        <Col span={!isXl ? 24 : 8}>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
          >
            สถานที่จัดส่ง
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            คุณสามารถเลือก และเพิ่มที่อยู่จัดส่งได้ที่นี้
          </Typography>
        </Col>
        <Col span={!isXl ? 24 : 16}>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue, setFieldsValue }) => {
              const paymentMethod = getFieldValue('paymentMethod');
              const handleSelectPaymentMethod = (type: string) => {
                setFieldsValue({ paymentMethod: type });
              };

              return (
                <Form.Item
                  name="paymentMethod"
                  label={
                    <Typography
                      variant="paragraph-medium"
                      className="!text-text-secondary !font-medium"
                    >
                      ช่องทางชำระ
                    </Typography>
                  }
                >
                  <div className="w-full flex flex-col lg:flex-row flex-nowrap overflow-x-auto gap-2">
                    <TransactionCardSelection
                      isSelected={paymentMethod === PaymentMethod.BANK_TRANSFER}
                      icon="ri-bank-line"
                      label="โอนชำระตรง"
                      description="ผ่านบัญชีธนาคาร"
                      onClick={() =>
                        handleSelectPaymentMethod(PaymentMethod.BANK_TRANSFER)
                      }
                      className="min-w-[150px] flex-shrink-0"
                    />
                    <TransactionCardSelection
                      isSelected={
                        paymentMethod === PaymentMethod.CREDIT_MERCHANT
                      }
                      icon="ri-store-2-line"
                      label="เครดิตร้านค้า"
                      description="วงเงิน"
                      isCredit
                      onClick={() =>
                        handleSelectPaymentMethod(PaymentMethod.CREDIT_MERCHANT)
                      }
                      className="min-w-[150px] flex-shrink-0"
                    />
                    <TransactionCardSelection
                      isSelected={
                        paymentMethod === PaymentMethod.PG_CREDIT_CARD
                      }
                      icon="ri-bank-card-line"
                      label="บัตรเครดิต"
                      description="Allkons Payment"
                      fee={100}
                      onClick={() =>
                        handleSelectPaymentMethod(PaymentMethod.PG_CREDIT_CARD)
                      }
                      className="min-w-[150px] flex-shrink-0"
                    />
                    <TransactionCardSelection
                      isSelected={paymentMethod === PaymentMethod.PG_PROMPTPAY}
                      icon="ri-qr-code-line"
                      label="QR PromptPay"
                      description="Allkons Payment"
                      onClick={() =>
                        handleSelectPaymentMethod(PaymentMethod.PG_PROMPTPAY)
                      }
                      className="min-w-[150px] flex-shrink-0"
                    />
                    <TransactionCardSelection
                      isSelected={paymentMethod === PaymentMethod.PG_BILL}
                      icon="ri-file-list-3-line"
                      label="Bill Payment"
                      description="Allkons Payment"
                      onClick={() =>
                        handleSelectPaymentMethod(PaymentMethod.PG_BILL)
                      }
                      className="min-w-[150px] flex-shrink-0"
                    />
                  </div>
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default FormPaymentMethod;
