import { Divider, Grid } from 'antd';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import CustomButton from '@/components/Button';
import { formatThaiBaht } from '@/utils/format';
import { IOrderResponse } from '@/common/interfaces/order.interface';
import dayjs from 'dayjs';
import OrderItemList from './OrderItemList';
import MultiDeliveryCard from './MultiDeliveryCard';
import { PaymentMethod } from '@/common/enum/payment.enum';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubOrderStatus } from '@/common/enum/suborder.enum';

interface Props {
  order: IOrderResponse;
  onSelectSubOrder: (index: number) => void;
}

export default function OrderCard({ order, onSelectSubOrder }: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const singleDelivery = order.subOrders.length === 1;
  const [isExpandedDetails, setIsExpandedDetails] = useState<boolean>(false);
  const router = useRouter();

  const resolvedPaymentMethod = (
    paymentMethod: PaymentMethod
  ): { icon: string; text: string } => {
    switch (paymentMethod) {
      case PaymentMethod.BANK_TRANSFER:
        return { icon: 'ri-bank-line', text: 'ชำระเงินผ่านโอนชำระตรง' };
      case PaymentMethod.PG_CREDIT_CARD:
        return { icon: 'ri-bank-card-line', text: 'ชำระเงินผ่านบัตรเครดิต' };
      case PaymentMethod.PG_PROMPTPAY:
        return { icon: 'ri-qr-code-line', text: 'ชำระเงินผ่าน QR PromptPay' };
      case PaymentMethod.PG_BILL:
        return {
          icon: 'ri-file-list-3-line',
          text: 'ชำระเงินผ่าน Bill Payment',
        };
      case PaymentMethod.CREDIT_MERCHANT:
        return { icon: 'ri-store-2-line', text: 'ชำระเงินผ่านเครดิตร้านค้า' };
      default:
        return { icon: 'hidden', text: 'ยังไม่เลือกช่องทางการชำระ' };
    }
  };

  const statusLabel = ({
    status,
  }: {
    status: SubOrderStatus;
  }): React.ReactElement => {
    switch (status) {
      case SubOrderStatus.NEW:
        return (
          <Label
            variant="ghost"
            rounding="rounded"
            text="รอเลือกชำระ"
            color="neutral"
          />
        );
      case SubOrderStatus.PENDING_PAYMENT:
        return (
          <Label
            variant="ghost"
            rounding="rounded"
            text="ที่ต้องชำระ"
            color="warning"
          />
        );
      case SubOrderStatus.PENDING_VERIFY:
        return (
          <Label
            variant="ghost"
            rounding="rounded"
            text="รอตรวจสอบ"
            color="warning"
          />
        );
      default:
        return (
          <Label
            variant="ghost"
            rounding="rounded"
            text="รอเลือกชำระ"
            color="warning"
          />
        );
    }
  };

  return (
    <div className="border border-border-tertiary rounded-xl p-6">
      {/* Multi Delivery details */}
      {!singleDelivery && (
        <div
          className={`${
            isMobile ? 'flex flex-col gap-2' : 'grid grid-cols-4'
          } gap-6 p-4 bg-background-secondary rounded-xl mb-6`}
        >
          {isMobile && (
            <div className="flex flex-col gap-2">
              <div className="w-full flex justify-end">
                <div className="flex items-center gap-2">
                  <Label
                    variant="ghost"
                    rounding="rounded"
                    text="ที่ต้องชำระ"
                    color="warning"
                  />
                  <i
                    className={`text-xl ${
                      isExpandedDetails
                        ? 'ri-arrow-up-s-line'
                        : 'ri-arrow-down-s-line'
                    }`}
                    onClick={() => setIsExpandedDetails(!isExpandedDetails)}
                  ></i>
                </div>
              </div>
              <Divider className="!mt-0 !-mb-4" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex w-full justify-between items-center">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary"
              >
                เลขที่คำสั่งซื้อ :
              </Typography>
            </div>
            <Typography variant="paragraph-medium">{order.number}</Typography>
          </div>
          <div
            className={`${
              isMobile
                ? 'flex flex-col gap-2'
                : 'col-span-2 grid grid-cols-2 gap-6'
            } ${!isMobile || (isMobile && isExpandedDetails) ? '' : 'hidden'}`}
          >
            <div className="flex flex-col gap-2">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary"
              >
                วันที่สั่งซื้อ :
              </Typography>
              <Typography variant="paragraph-medium">
                {dayjs(order.orderedAt).format('DD MMM YYYY')}
              </Typography>
            </div>
            <div className="flex flex-col gap-2">
              <Typography
                variant="paragraph-medium"
                className="!text-text-quarternary"
              >
                ราคาทั้งหมด :
              </Typography>
              <Typography
                variant="paragraph-medium"
                className="!font-semibold !text-primary"
              >
                {formatThaiBaht(order.grandTotal)}
              </Typography>
            </div>
          </div>

          {!isMobile && (
            <div className="flex w-full justify-end items-center">
              <div className="h-full w-[1px] bg-border-primary mx-2"></div>
              <Label
                variant="ghost"
                rounding="rounded"
                text="ที่ต้องชำระ"
                color="warning"
              />
            </div>
          )}
        </div>
      )}
      {!isMobile && <div className="my-2 bg-border-primary h-[1px]"></div>}
      {/* Single Delivery Details */}
      {singleDelivery && (
        <div className="rounded-xl bg-background-secondary p-6 mb-4 md:mb-6">
          <div
            className={`${
              isMobile ? 'flex flex-col gap-2' : 'grid grid-cols-4 gap-6'
            }`}
          >
            {isMobile && (
              <div className="flex flex-col gap-2">
                <div className="w-full flex justify-end">
                  <div className="flex items-center gap-2">
                    {statusLabel({ status: order.subOrders[0].status })}
                    <i
                      className={`text-xl ${
                        isExpandedDetails
                          ? 'ri-arrow-up-s-line'
                          : 'ri-arrow-down-s-line'
                      }`}
                      onClick={() => setIsExpandedDetails(!isExpandedDetails)}
                    ></i>
                  </div>
                </div>
                <Divider className="!mt-0 !mb-1" />
              </div>
            )}
            <div className={`flex gap-2 flex-col`}>
              <div className="flex items-center justify-between">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  เลขที่คำสั่งซื้อ :
                </Typography>
              </div>
              <Typography
                variant="paragraph-medium"
                ellipsis
                ellipsisOptions={{
                  rows: 1,
                }}
              >
                {order.number}
              </Typography>
            </div>
            <div
              className={`${
                isMobile
                  ? 'flex-col gap-2'
                  : 'col-span-3 grid grid-cols-3 gap-6'
              } ${
                !isMobile || (isMobile && isExpandedDetails) ? '' : 'hidden'
              }`}
            >
              <div className={`flex gap-2 flex-col`}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  วันที่สั่งซื้อ :
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  ellipsis
                  ellipsisOptions={{
                    rows: 1,
                  }}
                >
                  {dayjs(order.orderedAt).format('DD MMM YYYY')}
                </Typography>
              </div>
              <div className={`flex gap-2 flex-col`}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  สถานที่จัดสั่ง :
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  ellipsis
                  ellipsisOptions={{
                    rows: 1,
                  }}
                >
                  {order.subOrders[0].projectName ||
                    `${order.subOrders[0].address} ${order.subOrders[0].subDistrictName} ${order.subOrders[0].districtName} ${order.subOrders[0].provinceName} ${order.subOrders[0].zipCode}`}
                </Typography>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className={`flex gap-2 flex-col`}>
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-quarternary"
                  >
                    ราคาทั้งหมด :
                  </Typography>
                  <Typography
                    variant="paragraph-medium"
                    className="!font-semibold !text-primary"
                    ellipsis
                    ellipsisOptions={{
                      rows: 1,
                    }}
                  >
                    {formatThaiBaht(order.grandTotal)}
                  </Typography>
                </div>
                {!isMobile &&
                  statusLabel({ status: order.subOrders[0].status })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {!singleDelivery && (
          <Typography variant="paragraph-big">
            {`รอบการจัดส่งทั้งหมด (${order.subOrders.length}/XX)`}
          </Typography>
        )}

        <div className="rounded-xl bg-warning-subtle p-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <i
              className={
                resolvedPaymentMethod(
                  order?.subOrders[0]?.payment?.paymentMethod
                ).icon
              }
            ></i>
            <Typography variant="paragraph-medium">
              {
                resolvedPaymentMethod(
                  order?.subOrders[0]?.payment?.paymentMethod
                ).text
              }
            </Typography>
          </div>
          <CustomButton
            variant="outlined"
            color="neutral"
            className="!w-fit"
            disabled
          >
            <Typography variant="paragraph-small">เปลี่ยน</Typography>
          </CustomButton>
        </div>
        <div>
          {/* Item list */}
          {singleDelivery && (
            <OrderItemList
              key={order.subOrders[0].id}
              subOrder={order.subOrders[0]}
              onSelectSubOrder={onSelectSubOrder}
              index={0}
            />
          )}
          {!singleDelivery && (
            <div>
              <div className="flex flex-col gap-4 mt-4">
                {order.subOrders.map((subOrder, index) => (
                  <MultiDeliveryCard
                    onSelectSubOrder={(index) => onSelectSubOrder(index)}
                    key={subOrder.id}
                    subOrder={subOrder}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <Divider className="!text-border-primary !m-0" />
        <div
          className={`flex items-center ${
            isMobile ? 'flex-col justify-center' : 'justify-end'
          } w-full gap-2`}
        >
          <CustomButton
            variant="outlined"
            color="error"
            className={`${isMobile ? 'w-full' : '!w-fit'}`}
          >
            ยกเลิกคำสั่งซื้อ
          </CustomButton>
          <CustomButton
            variant="outlined"
            color="primary"
            className={`${isMobile ? 'w-full' : '!w-fit'}`}
            disabled
          >
            ติดต่อร้านค้า
          </CustomButton>
          <CustomButton
            variant="solid"
            color="primary"
            className={`${isMobile ? 'w-full' : '!w-fit'}`}
            onClick={() => {
              router.push(
                `/checkout/?orderId=${order.id}${
                  order.subOrders[0]?.payment?.id
                    ? `&orderPaymentId=${order.subOrders[0]?.payment?.id}`
                    : ''
                }`
              );
            }}
          >
            {order.subOrders[0].status === SubOrderStatus.NEW
              ? 'จัดการคำสั่งซื้อ'
              : 'ชำระเงิน'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
