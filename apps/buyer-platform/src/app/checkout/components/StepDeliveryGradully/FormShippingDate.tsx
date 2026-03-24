import { DeliveryTime, DeliveryBy } from '@/common/enum/payment.enum';
import CardRadio from '@/components/Card/Radio';
import DatePicker from '@/components/DataEntry/DatePicker';
import Typography from '@/components/Typography';
import { Form, FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

type FormShippingDateProps = {
  form: FormInstance<any>;
  orderInfomationValue: any[];
  editStep: number | null;
  currentOrderIndex: number | null;
};

const FormShippingDate: React.FC<FormShippingDateProps> = ({
  form,
  orderInfomationValue,
  editStep,
  currentOrderIndex,
}) => {
  const [isDisabled, setIsDisabled] = useState({
    none: false,
    morning: false,
    afternoon: false,
  });
  const deliveryDate = Form.useWatch('deliveryDate', form);
  const deliveryBy = Form.useWatch('deliveryBy', form);

  useEffect(() => {
    if (
      orderInfomationValue &&
      editStep !== null &&
      currentOrderIndex !== null
    ) {
      const currentAddress =
        orderInfomationValue[currentOrderIndex as number]?.address;

      const matchingOrders = orderInfomationValue.filter((orderItem, index) => {
        return (
          index !== currentOrderIndex &&
          orderItem.deliveryBy === deliveryBy &&
          dayjs(orderItem.deliveryDate).isSame(dayjs(deliveryDate)) &&
          orderItem.address?.id === currentAddress?.id
        );
      });

      const usedDeliveryTimes = matchingOrders.map(
        (order) => order.deliveryTime
      );

      setIsDisabled({
        none: usedDeliveryTimes.includes(DeliveryTime.ANYTIME),
        morning: usedDeliveryTimes.includes(DeliveryTime.MORNING),
        afternoon: usedDeliveryTimes.includes(DeliveryTime.AFTERNOON),
      });

      const currentDeliveryTime = form.getFieldValue('deliveryTime');
      if (
        (currentDeliveryTime === DeliveryTime.ANYTIME &&
          usedDeliveryTimes.includes(DeliveryTime.ANYTIME)) ||
        (currentDeliveryTime === DeliveryTime.MORNING &&
          usedDeliveryTimes.includes(DeliveryTime.MORNING)) ||
        (currentDeliveryTime === DeliveryTime.AFTERNOON &&
          usedDeliveryTimes.includes(DeliveryTime.AFTERNOON))
      ) {
        form.setFieldValue('deliveryTime', '');
      }
    }
  }, [
    editStep,
    currentOrderIndex,
    deliveryDate,
    deliveryBy,
    orderInfomationValue,
  ]);

  return (
    <Form form={form} layout="vertical" className="flex flex-col gap-4">
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue, setFieldValue }) => {
          const deliveryBy = getFieldValue('deliveryBy');
          const handleSelectDeliveryBy = (type: string) => {
            setFieldValue('deliveryBy', type);
          };

          return (
            <Form.Item
              name="shippingType"
              className="!mb-0"
              label={
                <Typography
                  variant="paragraph-small"
                  className="!text-text-secondary !font-medium"
                >
                  ตัวเลือกการจัดส่ง
                </Typography>
              }
            >
              <div className="w-full flex flex-col gap-2">
                <CardRadio
                  isSelected={deliveryBy === DeliveryBy.AGENT}
                  title="จัดส่งโดยร้าน"
                  label="ฟรี"
                  description="สามารถเลือกวันจัดส่งได้"
                  //   vertical={!isMobile}
                  onClick={() => handleSelectDeliveryBy(DeliveryBy.AGENT)}
                />
                <CardRadio
                  isSelected={deliveryBy === DeliveryBy.OUTSOURCE}
                  title="จัดส่งธรรมดา"
                  //   vertical={!isMobile}
                  label="฿500"
                  description="ได้รับประมาณ 15 พ.ค. 2568 - 19 พ.ค. 2568"
                  onClick={() => handleSelectDeliveryBy(DeliveryBy.OUTSOURCE)}
                />
              </div>
            </Form.Item>
          );
        }}
      </Form.Item>
      <DatePicker
        label="วันที่ในการรับสินค้า"
        name="deliveryDate"
        required
        placeholder="เลือกวันที่"
        onCalendarChange={(date: any) => {
          const isSelectedToday = date && date.isSame(new Date(), 'day');
          const currentHour = new Date().getHours();

          if (isSelectedToday && currentHour >= 12) {
            const currentDeliveryTime = form.getFieldValue('deliveryTime');
            if (currentDeliveryTime === DeliveryTime.MORNING) {
              form.setFieldValue('deliveryTime', DeliveryTime.ANYTIME);
            }
          }

          if (isSelectedToday && currentHour >= 18) {
            const currentDeliveryTime = form.getFieldValue('deliveryTime');
            if (currentDeliveryTime === DeliveryTime.AFTERNOON) {
              form.setFieldValue('deliveryTime', DeliveryTime.ANYTIME);
            }
          }
        }}
      />
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue, setFieldValue }) => {
          const deliveryTime = getFieldValue('deliveryTime');
          const deliveryDate = getFieldValue('deliveryDate');

          const isToday =
            deliveryDate && deliveryDate.isSame(new Date(), 'day');
          deliveryDate && deliveryDate.isSame(new Date(), 'day');
          const currentHour = new Date().getHours();

          const isMorningDisabled = isToday && currentHour >= 12;

          const isAfternoonDisabled = isToday && currentHour >= 18;

          const handleSelectDeliveryTime = (type: string) => {
            setFieldValue('deliveryTime', type);
          };

          return (
            <Form.Item name="deliveryTime" label="เวลาในการรับสินค้า">
              <div className="w-full flex flex-col  gap-2">
                <CardRadio
                  isSelected={deliveryTime === DeliveryTime.ANYTIME}
                  title="ไม่ระบุช่วงเวลา"
                  description="ร้านค้าจะโทรนัดเวลาอีกครั้ง"
                  onClick={() => handleSelectDeliveryTime(DeliveryTime.ANYTIME)}
                  disabled={isDisabled.none}
                  tooltip={isDisabled.none}
                  tooltipText="ช่วงเวลานี้ถูกใช้แล้วในรอบจัดส่งที่สร้างไว้แล้ว"
                />
                <CardRadio
                  isSelected={deliveryTime === DeliveryTime.MORNING}
                  title="ช่วงเช้า"
                  description="เวลาด่วนพิเศษ เช้า-เที่ยง"
                  disabled={isMorningDisabled || isDisabled.morning}
                  onClick={() =>
                    !isMorningDisabled &&
                    handleSelectDeliveryTime(DeliveryTime.MORNING)
                  }
                  tooltip={isDisabled.morning}
                  tooltipText="ช่วงเวลานี้ถูกใช้แล้วในรอบจัดส่งที่สร้างไว้แล้ว"
                />
                <CardRadio
                  isSelected={deliveryTime === DeliveryTime.AFTERNOON}
                  title="ช่วงบ่าย"
                  description="เวลาด่วนพิเศษ บ่าย-เย็น"
                  disabled={isAfternoonDisabled || isDisabled.afternoon}
                  onClick={() =>
                    !isAfternoonDisabled &&
                    handleSelectDeliveryTime(DeliveryTime.AFTERNOON)
                  }
                  tooltip={isDisabled.afternoon}
                  tooltipText="ช่วงเวลานี้ถูกใช้แล้วในรอบจัดส่งที่สร้างไว้แล้ว"
                />
              </div>
            </Form.Item>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default FormShippingDate;
