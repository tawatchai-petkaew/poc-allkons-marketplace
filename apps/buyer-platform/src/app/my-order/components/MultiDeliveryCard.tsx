import { DeliveryTime } from '@/common/enum/payment.enum';
import { ISubOrderResponse } from '@/common/interfaces/order.interface';
import Typography from '@/components/Typography';
import { formatThaiBaht } from '@/utils/format';
import { Divider, Grid } from 'antd';
import dayjs from 'dayjs';
import OrderItemList from './OrderItemList';
import { SubOrderStatus } from '@/common/enum/suborder.enum';
import { Label } from '@/components/Label';
import CustomButton from '@/components/Button';
import { useState } from 'react';

interface Props {
  subOrder: ISubOrderResponse;
  onSelectSubOrder: (index: number) => void;
  index: number;
}

export default function MultiDeliveryCard({
  subOrder,
  onSelectSubOrder,
  index,
}: Props) {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const sumPriceProducts = subOrder.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const [expandProducts, setExpandProducts] = useState<boolean>(false);
  return (
    <div
      className={`flex flex-col p-4 border rounded-xl transition-all duration-200 border-border-primary w-full ${
        subOrder.status !== SubOrderStatus.NEW
          ? 'bg-background-secondary'
          : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <Typography variant="paragraph-big" className="!text-text-primary">
            รอบจัดส่ง{' '}
            <span className="!font-semibold !text-icon-brand-dark">
              ครั้งที่ {index + 1}
            </span>
          </Typography>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-end">
              <i className="ri-file-list-3-line text-base text-text-tertiary" />
              <Typography
                variant="paragraph-small"
                className="!text-text-tertiary"
              >
                หมายเลขบิล : {subOrder?.subOrderNumber || '-'}
              </Typography>
            </div>
            <div className="flex gap-2 items-end">
              <i className="ri-calendar-line text-base text-text-tertiary" />
              <Typography
                variant="paragraph-small"
                className="!text-text-tertiary"
              >
                {dayjs(subOrder.deliveryDate)
                  .add(543, 'year')
                  .format('DD MMMM YYYY')}{' '}
                (
                {subOrder.deliveryTime === DeliveryTime.ANYTIME
                  ? 'ไม่ระบุช่วงเวลา'
                  : subOrder.deliveryTime === DeliveryTime.MORNING
                    ? '08.00 - 12.00 น.'
                    : subOrder.deliveryTime === DeliveryTime.AFTERNOON
                      ? '13.00 - 17.00 น.'
                      : ''}
                )
              </Typography>
            </div>
            <div className="flex gap-2 items-start md:items-end">
              <i className="ri-map-pin-line text-base text-text-tertiary" />
              <Typography
                variant="paragraph-small"
                className="!text-text-tertiary"
              >
                {subOrder.projectName ||
                  `${subOrder.address} ${subOrder.subDistrictName} ${subOrder.districtName} ${subOrder.provinceName} ${subOrder.zipCode}` ||
                  '-'}
              </Typography>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Typography
            variant="h4"
            className="!text-icon-brand-dark !font-semibold"
          >
            {formatThaiBaht(sumPriceProducts, 2)}
          </Typography>
          <CustomButton
            variant="link"
            color="neutral"
            icon={
              expandProducts ? (
                <i className="ri-arrow-up-s-line" />
              ) : (
                <i className="ri-arrow-down-s-line" />
              )
            }
            onClick={() => {
              setExpandProducts(!expandProducts);
            }}
          />
        </div>
      </div>
      {isMobile && (
        <div>
          <Divider className="!my-2" />
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Typography
                variant="h4"
                className="!text-icon-brand-dark !font-semibold"
              >
                {formatThaiBaht(sumPriceProducts, 2)}
              </Typography>
              {subOrder.status === SubOrderStatus.NEW ? (
                <Label
                  text="ที่ต้องชำระ"
                  color="warning"
                  size="large"
                  variant="ghost"
                />
              ) : subOrder.status === SubOrderStatus.PENDING_PAYMENT ? (
                <Label
                  text="กำลังรอชำระเงิน"
                  color="neutral"
                  variant="outlined"
                  size="large"
                />
              ) : subOrder.status === SubOrderStatus.PENDING_VERIFY ? (
                <Label
                  text="อยู่ระหว่างตรวจสอบชำระเงิน"
                  color="neutral"
                  variant="outlined"
                  size="large"
                />
              ) : (
                <></>
              )}
            </div>
            <CustomButton
              variant="link"
              color="neutral"
              icon={
                expandProducts ? (
                  <i className="ri-arrow-up-s-line" />
                ) : (
                  <i className="ri-arrow-down-s-line" />
                )
              }
              onClick={() => {
                setExpandProducts(!expandProducts);
              }}
            />
          </div>
        </div>
      )}
      {expandProducts && (
        <>
          <Divider className="!my-4" />
          <OrderItemList
            subOrder={subOrder}
            onSelectSubOrder={onSelectSubOrder}
            index={index}
          />
        </>
      )}
    </div>
  );
}
