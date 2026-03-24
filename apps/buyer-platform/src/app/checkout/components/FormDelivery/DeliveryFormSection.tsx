'use client';
import { FC, useEffect, useState } from 'react';
import {
  Col,
  Divider,
  Form,
  FormInstance,
  Grid,
  Input,
  Row,
  UploadFile,
} from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import CardSelectionAddress from '@/components/Card/Selection/Address';
import CardRadio from '@/components/Card/Radio';
import DatePicker from '@/components/DataEntry/DatePicker';
import TextField from '@/components/DataEntry/TextField';
import UploadFileDragger from '@/components/DataEntry/Upload/FileDragger';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import {
  DeliveryTime,
  DeliveryBy,
  DeliveryReceiveType,
} from '@/common/enum/payment.enum';
import { modeSelectAddress } from '@/store/select-address.store';
import { IDeliveryForm } from './FormDelivery';
import { useCheckoutStore } from '@/store/checkout.store';

interface DeliveryFormSectionProps {
  fields: any[];
  form: FormInstance<any>;
  addressDataInfinite: any[];

  handleOpenAddressDrawer: (
    fieldName: number,
    addressId: number | null,
    mode?: any
  ) => void;
}

const DeliveryFormSection: FC<DeliveryFormSectionProps> = ({
  fields,
  form,
  addressDataInfinite,
  handleOpenAddressDrawer,
}) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const [poFiles, setPoFiles] = useState<UploadFile[]>([]);

  const { deliveryFormValue, setDeliveryFormValue } = useCheckoutStore();

  const handleDateChange = (date: any, fieldName: number) => {
    const isSelectedToday = date && date.isSame(new Date(), 'day');
    const currentHour = new Date().getHours();

    if (!isSelectedToday) return;

    const currentDeliveryTime = form.getFieldValue([
      'orderInfomation',
      fieldName,
      'deliveryTime',
    ]);

    const shouldResetToNone =
      (currentHour >= 12 && currentDeliveryTime === DeliveryTime.MORNING) ||
      (currentHour >= 18 && currentDeliveryTime === DeliveryTime.AFTERNOON);

    if (shouldResetToNone) {
      form.setFieldsValue({
        orderInfomation: {
          ...form.getFieldValue('orderInfomation'),
          [fieldName]: {
            ...form.getFieldValue(['orderInfomation', fieldName]),
            deliveryTime: DeliveryTime.ANYTIME,
          },
        },
      });
    }
  };
  useEffect(() => {
    form.setFieldValue(['orderInfomation', 0, 'poFiles'], poFiles);
    const orderInfomation = form.getFieldValue('orderInfomation');
    if (!orderInfomation || orderInfomation.length === 0) return;

    const updatedOrderInformation = orderInfomation.map(
      (item: IDeliveryForm, index: number) => {
        if (index === 0) {
          return {
            ...item,
            poFiles: poFiles,
          };
        }
        return item;
      }
    );
    if (
      deliveryFormValue?.deliveryReceiveType === DeliveryReceiveType.SENDONCE
    ) {
      setDeliveryFormValue({
        ...deliveryFormValue,
        orderInfomation: updatedOrderInformation,
      } as any);
    }
  }, [poFiles]);

  useEffect(() => {
    if (deliveryFormValue) {
      const formPoFilesValue = deliveryFormValue.orderInfomation?.[0]?.poFiles;
      if (formPoFilesValue && formPoFilesValue.length > 0) {
        setPoFiles(formPoFilesValue);
      }
    }
  }, [deliveryFormValue]);

  return (
    <div>
      {fields.map((field, index) => {
        return (
          <div className="w-full" key={field.key}>
            <Row gutter={[16, 16]}>
              <Col span={isMobile ? 24 : 8}>
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
              <Col span={isMobile ? 24 : 16}>
                <div className="w-full flex flex-col gap-4 md:gap-6">
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue, getFieldsValue }) => {
                      const address = getFieldValue([
                        'orderInfomation',
                        field.name,
                        'address',
                      ]);

                      return (
                        <Form.Item
                          {...field}
                          name={[field.name, 'address']}
                          className="!mb-0"
                          key={`${field.key}-address`}
                        >
                          <div className="w-full">
                            <div className="flex justify-between w-full">
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-secondary !font-medium"
                              >
                                ที่อยู่จัดส่ง
                              </Typography>
                              <Typography
                                variant="paragraph-medium"
                                className="!font-semibold !text-icon-brand-dark cursor-pointer"
                                onClick={() =>
                                  handleOpenAddressDrawer(
                                    field.name,
                                    null,
                                    modeSelectAddress.SELECT_ADDRESS
                                  )
                                }
                              >
                                เลือกที่อยู่จัดส่ง
                              </Typography>
                            </div>
                            {address ? (
                              <div className="mt-2">
                                <CardSelectionAddress
                                  isSelected={true}
                                  address={address}
                                  vertical
                                  onClick={() =>
                                    handleOpenAddressDrawer(
                                      field.name,
                                      address?.id || null
                                    )
                                  }
                                  onEditing={() =>
                                    handleOpenAddressDrawer(
                                      field.name,
                                      address?.id || null
                                    )
                                  }
                                  disabled={addressDataInfinite?.length === 0}
                                />
                              </div>
                            ) : (
                              <div
                                className="w-full mt-2 border border-dashed border-border-brand-lighter bg-white hover:bg-primary-hover rounded-2xl flex justify-center py-[30px]"
                                onClick={() =>
                                  handleOpenAddressDrawer(
                                    field.name,
                                    null,
                                    modeSelectAddress.CREATE_ADDRESS
                                  )
                                }
                              >
                                <Button
                                  variant="link"
                                  icon={<i className="ri-add-fill" />}
                                >
                                  เพิ่มที่อยู่ใหม่
                                </Button>
                              </div>
                            )}
                          </div>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue, setFieldsValue }) => {
                      const deliveryBy = getFieldValue([
                        'orderInfomation',
                        field.name,
                        'deliveryBy',
                      ]);
                      const handleSelectDeliveryBy = (type: string) => {
                        setFieldsValue({
                          orderInfomation: {
                            ...getFieldValue('orderInfomation'),
                            [field.name]: {
                              ...getFieldValue(['orderInfomation', field.name]),
                              deliveryBy: type,
                            },
                          },
                        });
                      };

                      return (
                        <Form.Item
                          {...field}
                          name={[field.name, 'deliveryBy']}
                          key={`${field.key}-deliveryBy`}
                          className="!mb-0"
                          label={
                            <Typography
                              variant="paragraph-medium"
                              className="!text-text-secondary !font-medium"
                            >
                              ตัวเลือกการจัดส่ง
                            </Typography>
                          }
                        >
                          <div className="w-full flex flex-col md:flex-row gap-2">
                            <CardRadio
                              isSelected={deliveryBy === DeliveryBy.AGENT}
                              title="จัดส่งโดยร้าน"
                              label="ฟรี"
                              description="สามารถเลือกวันจัดส่งได้"
                              vertical={!isMobile}
                              onClick={() =>
                                handleSelectDeliveryBy(DeliveryBy.AGENT)
                              }
                            />
                            <CardRadio
                              isSelected={deliveryBy === DeliveryBy.OUTSOURCE}
                              title="จัดส่งธรรมดา"
                              vertical={!isMobile}
                              label="฿500"
                              description="ได้รับประมาณ 15 พ.ค. 2568 - 19 พ.ค. 2568"
                              onClick={() =>
                                handleSelectDeliveryBy(DeliveryBy.OUTSOURCE)
                              }
                            />
                          </div>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Divider />
            {/* Delivery Date and Time Section */}
            <Row gutter={[16, 16]}>
              <Col span={isMobile ? 24 : 8}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary !font-medium"
                >
                  วันและเวลารับสินค้า
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  คุณสามารถเลือกวัน และเวลารับสินค้าได้ที่นี้
                </Typography>
              </Col>
              <Col span={isMobile ? 24 : 16}>
                <DatePicker
                  label="วันที่ในการรับสินค้า"
                  name={[field.name, 'deliveryDate']}
                  required
                  placeholder="เลือกวันที่"
                  key={`${field.key}-deliveryDate`}
                  onCalendarChange={(date: any) =>
                    handleDateChange(date, field.name)
                  }
                />
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue, setFieldsValue }) => {
                    const deliveryTime = getFieldValue([
                      'orderInfomation',
                      field.name,
                      'deliveryTime',
                    ]);
                    const deliveryDate = getFieldValue([
                      'orderInfomation',
                      field.name,
                      'deliveryDate',
                    ]);

                    const isToday =
                      deliveryDate && deliveryDate.isSame(new Date(), 'day');
                    const currentHour = new Date().getHours();

                    const isMorningDisabled = isToday && currentHour >= 12;

                    const isAfternoonDisabled = isToday && currentHour >= 18;

                    const handleSelectDeliveryTime = (type: string) => {
                      setFieldsValue({
                        orderInfomation: {
                          ...getFieldValue('orderInfomation'),
                          [field.name]: {
                            ...getFieldValue(['orderInfomation', field.name]),
                            deliveryTime: type,
                          },
                        },
                      });
                    };

                    return (
                      <Form.Item
                        {...field}
                        name={[field.name, 'deliveryTime']}
                        className="!mb-0 !mt-4 md:!mt-6"
                        key={`${field.key}-deliveryTime`}
                        label={
                          <Typography
                            variant="paragraph-medium"
                            className="!text-text-secondary !font-medium"
                          >
                            เวลาในการรับสินค้า
                          </Typography>
                        }
                      >
                        <div className="w-full flex flex-col md:flex-row gap-2">
                          <CardRadio
                            isSelected={deliveryTime === DeliveryTime.ANYTIME}
                            title="ไม่ระบุช่วงเวลา"
                            description="ร้านค้าจะโทรนัดเวลาอีกครั้ง"
                            onClick={() =>
                              handleSelectDeliveryTime(DeliveryTime.ANYTIME)
                            }
                          />
                          <CardRadio
                            isSelected={deliveryTime === DeliveryTime.MORNING}
                            title="ช่วงเช้า"
                            description="เวลาด่วนพิเศษ เช้า-เที่ยง"
                            disabled={isMorningDisabled}
                            onClick={() =>
                              !isMorningDisabled &&
                              handleSelectDeliveryTime(DeliveryTime.MORNING)
                            }
                          />
                          <CardRadio
                            isSelected={deliveryTime === DeliveryTime.AFTERNOON}
                            title="ช่วงบ่าย"
                            description="เวลาด่วนพิเศษ บ่าย-เย็น"
                            disabled={isAfternoonDisabled}
                            onClick={() =>
                              !isAfternoonDisabled &&
                              handleSelectDeliveryTime(DeliveryTime.AFTERNOON)
                            }
                          />
                        </div>
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={isMobile ? 24 : 8}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary !font-medium"
                >
                  ข้อมูล และเอกสารเพิ่มเติม
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  คุณสามารถแนบเอกสารเพิ่มเติมได้ที่นี้
                </Typography>
              </Col>
              <Col span={isMobile ? 24 : 16}>
                <div className="flex flex-col gap-4">
                  <TextField
                    name={[field.name, 'poNumber']}
                    label="เลขที่อ้างอิง PO ของผู้สั่งซื้อ"
                    placeholder="กรุณากรอกเลขที่อ้างอิง PO ของผู้สั่งซื้อ"
                  />
                  {/* {JSON.stringify(form.getFieldValue([field.name, "poFiles"]))} */}
                  <Form.Item name={[field.name, 'poFiles']} noStyle />
                  <UploadFileDragger
                    file={poFiles}
                    setFile={setPoFiles}
                    form={{ key: [field.name, 'poFiles'], formInstance: form }}
                    label="แนบเอกสาร PO"
                    maxCount={5}
                    maxSize={10}
                    acceptedTypes={[
                      'image/jpeg',
                      'image/jpg',
                      'image/png',
                      'application/pdf',
                    ]}
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    description="JPG, JPEG, PNG, PDF (ขนาดไม่เกิน 10 MB)"
                    required={false}
                    customFileList={true}
                  />

                  <Form.Item
                    name={[field.name, 'remarkPo']}
                    label={<span className="text-base">หมายเหตุ</span>}
                    className="!mb-0"
                  >
                    <Input.TextArea
                      className="!text-base"
                      rows={4}
                      placeholder="ระบุหมายเหตุการวางบิล"
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={isMobile ? 24 : 8}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary !font-medium"
                >
                  ขอใบกำกับภาษี
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  คุณสามารถกรอกรายละเอียดใบกำกับภาษีได้ที่นี้
                </Typography>
              </Col>
              <Col span={isMobile ? 24 : 16}>
                <ToggleSwitch
                  type="text"
                  isChecked={false}
                  showLabel={false}
                  title="ต้องการใบกำกับภาษี"
                />
              </Col>
            </Row>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryFormSection;
