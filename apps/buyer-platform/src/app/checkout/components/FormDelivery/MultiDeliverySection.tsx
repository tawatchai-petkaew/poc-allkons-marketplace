'use client';
import React, { FC, useState, useEffect } from 'react';
import {
  Alert,
  Avatar,
  Col,
  Form,
  Grid,
  Popover,
  Row,
  Image as AntdImage,
} from 'antd';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { Label } from '@/components/Label';
import { DeliveryTime } from '@/common/enum/payment.enum';
import { modeSelectAddress } from '@/store/select-address.store';
import { formatAddressDetail } from '@/utils/format';
import { IAddress } from '@/components/Drawer/SelectAddress';
import dayjs from 'dayjs';
import Image from 'next/image';
import DrawerDeliveryGradully from '../DrawerDeliveryGradully';
import useConfirmModal from '@/hooks/useConfirmModal';
import { ICheckoutProductItem } from '@/store/checkout.store';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';

interface MultiDeliverySectionProps {
  fields: any[];
  orderInfomationValue: any[];
  remainingQuantity: number;
  currentOrderIndex: number | null;
  setCurrentOrderIndex: (value: number | null) => void;
  remainingProducts: any[];
  handleOpenAddressDrawer: (
    fieldName: number,
    addressId: number | null,
    mode?: any
  ) => void;
  handleOpenTransferProductPopup: (
    product: any,
    currentIndex: number,
    transferToIndex: number
  ) => void;
  remove: (index: number) => void;
  add: (values: any) => void;
  form: any; // Add form instance
}

const MultiDeliverySection: FC<MultiDeliverySectionProps> = ({
  fields,
  orderInfomationValue,
  remainingQuantity,
  currentOrderIndex,
  setCurrentOrderIndex,
  remainingProducts,
  handleOpenAddressDrawer,
  handleOpenTransferProductPopup,
  remove,
  add,
  form,
}) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  // Use confirm modal hook
  const { confirmDelete, MobileConfirmDrawer } = useConfirmModal();

  // Internal state management for drawer
  const [isOpenDrawerGradully, setIsOpenDrawerGradully] =
    useState<boolean>(false);

  // Internal state management for popovers
  const [expandProducts, setExpandProducts] = useState<boolean[]>([]);
  const [isVisiblePopoverSetting, setIsVisiblePopoverSetting] = useState<
    boolean[]
  >([]);
  const [isVisiblePopoverProducts, setIsVisiblePopoverProducts] = useState<
    boolean[][]
  >([]);
  const [isVisibleInnerPopoverTransfer, setIsVisibleInnerPopoverTransfer] =
    useState<boolean[][]>([]);
  const [editStep, setEditStep] = useState<number | null>(null);
  const [imageVisible, setImageVisible] = useState(false);

  // Internal function to handle opening drawer
  const handleOpenDrawerGradully = (orderIndex: number | null) => {
    setCurrentOrderIndex(orderIndex);
    setEditStep(null); // Reset editStep for new creation
    setIsOpenDrawerGradully(true);
  };

  // Initialize popover states when orderInfomationValue changes
  useEffect(() => {
    if (orderInfomationValue && orderInfomationValue.length > 0) {
      setExpandProducts(orderInfomationValue.map(() => false));
      setIsVisiblePopoverSetting(orderInfomationValue.map(() => false));

      // Initialize product popover states - 2D array for each order's products
      const productPopovers = orderInfomationValue.map((order) =>
        (order.products || []).map(() => false)
      );
      setIsVisiblePopoverProducts(productPopovers);

      // Initialize inner transfer popover states - 2D array for each order's products
      const transferPopovers = orderInfomationValue.map((order) =>
        (order.products || []).map(() => false)
      );
      setIsVisibleInnerPopoverTransfer(transferPopovers);
    }
  }, [orderInfomationValue]);

  // Helper function to close all popovers
  const closeAllPopovers = () => {
    setIsVisiblePopoverSetting((prev) => prev.map(() => false));
    setIsVisiblePopoverProducts((prev) =>
      prev.map((order) => order.map(() => false))
    );
    setIsVisibleInnerPopoverTransfer((prev) =>
      prev.map((order) => order.map(() => false))
    );
  };

  // Helper function to close specific popover
  const closeSpecificInnerPopover = (
    orderIndex: number,
    productIndex: number
  ) => {
    setIsVisibleInnerPopoverTransfer((prev) => {
      const newState = [...prev];
      if (newState[orderIndex]) {
        newState[orderIndex][productIndex] = false;
      }
      return newState;
    });
  };

  // Enhanced handleOpenTransferProductPopup to close popovers
  const handleOpenTransferProductPopupWithClosePopovers = (
    product: any,
    currentIndex: number,
    transferToIndex: number
  ) => {
    closeAllPopovers();
    handleOpenTransferProductPopup(product, currentIndex, transferToIndex);
  };

  const handleOpenSelectAddress = (fieldName: number, index: number) => {
    setCurrentOrderIndex(index);
    handleOpenAddressDrawer(fieldName, null, modeSelectAddress.SELECT_ADDRESS);
  };

  const handleDeleteOrderInfomation = (fieldName: number, index: number) => {
    setIsVisiblePopoverSetting((prev: any) => {
      const newVisible = [...prev];
      newVisible[index] = false;
      return newVisible;
    });
    confirmDelete({
      title: 'ยืนยันการลบรอบจัดส่ง',
      description: "สินค้าทั้งหมดในรอบนี้จะย้ายไปยังกลุ่ม 'สินค้ารอจัดรอบ'",
      onOk: () => {
        remove(fieldName);
        setExpandProducts((prev: any) => {
          const newExpandProducts = [...prev];
          newExpandProducts.splice(fieldName, 1);
          return newExpandProducts;
        });
      },
      okText: 'ลบรอบนี้',
    });
  };

  // Function to handle PO form edit - Step 4
  const handleEditPOForm = (index: number, fieldName: number) => {
    setCurrentOrderIndex(index);
    setEditStep(4); // Set to step 4 for PO editing
    setIsOpenDrawerGradully(true);
  };

  // Function to handle Shipping Date edit - Step 3
  const handleEditShippingDate = (index: number, fieldName: number) => {
    setCurrentOrderIndex(index);
    setEditStep(3); // Set to step 3 for shipping date editing
    setIsOpenDrawerGradully(true);
  };

  // Function to handle Select Product Form edit - Step 1
  const handleEditSelectProductForm = (index: number, fieldName: number) => {
    setCurrentOrderIndex(index);
    setEditStep(1); // Set to step 1 for product selection editing
    setIsOpenDrawerGradully(true);
  };

  // Function to handle edit finish - update data in form
  const handleEditFinish = (values: any) => {
    if (currentOrderIndex !== null) {
      const currentOrderData = form.getFieldValue([
        'orderInfomation',
        currentOrderIndex,
      ]);

      let updatedOrderData = { ...currentOrderData };

      // Check which step is being edited and update accordingly
      if (editStep === 1) {
        // Update product data
        const filteredProducts =
          values.products
            ?.filter((product: any) => product.quantity > 0)
            ?.map((product: any) => ({
              ...product,
              count: product.quantity || 0,
            })) || [];

        updatedOrderData = {
          ...updatedOrderData,
          products: filteredProducts,
        };
      } else if (editStep === 3) {
        // Update shipping date data
        updatedOrderData = {
          ...updatedOrderData,
          deliveryDate: values.deliveryDate,
          deliveryBy: values.deliveryBy,
          deliveryTime: values.deliveryTime,
        };
      } else if (editStep === 4) {
        // Update PO data
        updatedOrderData = {
          ...updatedOrderData,
          poNumber: values.poNumber || '',
          poFiles: values.poFiles || [],
          remarkPo: values.remarkPo || '',
          isTaxInvoice: values.isTaxInvoice || false,
        };
      }

      form.setFieldValue(
        ['orderInfomation', currentOrderIndex],
        updatedOrderData
      );
    }
    setEditStep(null);
    setIsOpenDrawerGradully(false);
  };

  // Function to handle delete product from order
  const handleDeleteProduct = (orderIndex: number, productIndex: number) => {
    // Close all popovers first
    closeAllPopovers();

    confirmDelete({
      title: 'ยืนยันการลบสินค้า',
      description: 'สินค้าจะถูกลบออกจากรอบจัดส่งนี้',
      onOk: () => {
        const currentOrderData = form.getFieldValue([
          'orderInfomation',
          orderIndex,
        ]);

        if (currentOrderData && currentOrderData.products) {
          // Remove product at productIndex
          const updatedProducts = currentOrderData.products.filter(
            (_: any, index: number) => index !== productIndex
          );

          // Update the order data with new products array
          const updatedOrderData = {
            ...currentOrderData,
            products: updatedProducts,
          };

          form.setFieldValue(['orderInfomation', orderIndex], updatedOrderData);
        }
      },
      okText: 'ลบสินค้า',
    });
  };

  return (
    <div className="w-full">
      <Row gutter={[16, 16]}>
        <Col span={isMobile ? 24 : 8}>
          <div className="flex gap-2">
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary !font-medium"
            >
              จัดการรอบการจัดส่ง
            </Typography>
            {orderInfomationValue && orderInfomationValue.length > 0 && (
              <Label
                text={`ทั้งหมด ${orderInfomationValue.length} รอบ`}
                variant="solid"
                rounding="pill"
                color="success"
              />
            )}
          </div>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            คุณสามารถเพิ่มเพิ่มรอบการจัดส่งได้ที่นี้
          </Typography>
        </Col>
        <Col span={isMobile ? 24 : 16}>
          <div className="w-full flex flex-col gap-2">
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary"
            >
              รอบการจัดส่ง
            </Typography>
            {remainingQuantity > 0 && (
              <Alert
                message={
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-primary"
                  >
                    สินค้ารอจัดรอบ {remainingQuantity} รายการ
                  </Typography>
                }
                className="!p-4 !rounded-2xl"
                type="warning"
                icon={
                  <i className="ri-shopping-bag-3-line text-xl text-warning" />
                }
                showIcon
              />
            )}
            {fields.map((field, index) => (
              <div
                className="border border-border-primary rounded-2xl p-3"
                key={index}
              >
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const {
                      address,
                      deliveryDate,
                      deliveryTime,
                      products,
                      poNumber,
                      poFiles,
                      isTaxInvoice,
                    } = getFieldValue(['orderInfomation', field.name]);
                    return (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                          <div className="flex flex-col">
                            <Typography
                              variant="paragraph-big"
                              className="!text-icon-brand-dark !font-bold"
                            >
                              รอบจัดส่ง ครั้งที่ {index + 1}
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-secondary"
                              >
                                วันที่{' '}
                                {deliveryDate
                                  ? dayjs(deliveryDate)
                                      .locale('th')
                                      .format('D MMMM BBBB')
                                  : '-'}
                                ,{' '}
                                {deliveryTime === DeliveryTime.ANYTIME
                                  ? 'ไม่ระบุช่วงเวลา'
                                  : deliveryTime === DeliveryTime.MORNING
                                    ? 'ช่วงเช้า 08.00 - 12.00 น.'
                                    : deliveryTime === DeliveryTime.AFTERNOON
                                      ? 'ช่วงบ่าย 13.00 - 17.00 น.'
                                      : ''}
                              </Typography>
                              <Button
                                size="small"
                                variant="ghost"
                                icon={
                                  <i className="ri-pencil-line text-text-secondary" />
                                }
                                onClick={() => {
                                  handleEditShippingDate(index, field.name);
                                }}
                              />
                            </div>
                          </div>
                          <Popover
                            placement="bottomRight"
                            trigger="click"
                            className="h-fit"
                            arrow={false}
                            autoAdjustOverflow={false}
                            open={isVisiblePopoverSetting[index]}
                            onOpenChange={(visible) => {
                              setIsVisiblePopoverSetting((prev: any) => {
                                const newVisible = [...prev];
                                newVisible[index] = visible;
                                return newVisible;
                              });
                            }}
                            styles={{
                              body: { padding: 0 },
                            }}
                            content={
                              <div className="w-[160px] rounded-md  border-[0.5px] border-border-primary shadow-lg bg-white">
                                <div className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover">
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    แก้ไขรอบจัดส่ง
                                  </Typography>
                                  <i className="ri-edit-line text-icon-quinary" />
                                </div>
                                <div
                                  className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover"
                                  onClick={() => {
                                    setIsVisiblePopoverSetting((prev: any) => {
                                      const newVisible = [...prev];
                                      newVisible[index] = false;
                                      return newVisible;
                                    });
                                    handleOpenSelectAddress(index, field.name);
                                  }}
                                >
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    เปลี่ยนที่อยู่
                                  </Typography>
                                  <i className="ri-map-pin-line text-icon-quinary" />
                                </div>
                                <div className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover">
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    วันจัดส่ง
                                  </Typography>
                                  <i className="ri-calendar-2-line text-icon-quinary" />
                                </div>
                                <div className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover">
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    เอกสาร
                                  </Typography>
                                  <i className="ri-file-list-3-line text-icon-quinary" />
                                </div>
                                <div className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover">
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    ใบกำกับภาษี
                                  </Typography>
                                  <i className="ri-percent-line text-icon-quinary" />
                                </div>
                                <div
                                  className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover"
                                  onClick={() => {
                                    handleDeleteOrderInfomation(
                                      field.name,
                                      index
                                    );
                                  }}
                                >
                                  <Typography
                                    variant="paragraph-small"
                                    className="!text-text-secondary"
                                  >
                                    ลบ
                                  </Typography>
                                  <i className="ri-delete-bin-6-line text-error" />
                                </div>
                              </div>
                            }
                          >
                            <div>
                              <Button
                                variant="outlined"
                                icon={<i className="ri-more-2-fill" />}
                                color="neutral"
                                size="small"
                              />
                            </div>
                          </Popover>
                        </div>
                        {address && (
                          <div className="p-3 bg-background-secondary rounded-xl relative">
                            <div className="absolute right-2 top-2">
                              <Button
                                size="small"
                                variant="ghost"
                                icon={
                                  <i className="ri-pencil-line text-text-secondary" />
                                }
                                onClick={() => {
                                  handleOpenSelectAddress(index, field.name);
                                }}
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <Typography
                                variant="paragraph-medium"
                                className="!text-text-secondary !font-medium"
                                ellipsis
                                ellipsisOptions={{
                                  rows: 2,
                                }}
                              >
                                {address?.addressName}
                              </Typography>
                              {address?.projectName && (
                                <Label
                                  text={address.projectName}
                                  size="small"
                                  variant="ghost"
                                  rounding="pill"
                                />
                              )}
                              {address?.isDefault && (
                                <Label
                                  text="ค่าเริ่มต้น"
                                  size="small"
                                  variant="ghost"
                                  rounding="pill"
                                  color="success"
                                />
                              )}
                            </div>
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-tertiary"
                            >
                              {address?.contactName} |{' '}
                              {address?.contactPhoneNumber}
                            </Typography>
                            <Typography
                              variant="paragraph-small"
                              ellipsis
                              ellipsisOptions={{
                                rows: 2,
                              }}
                              className="!text-text-tertiary"
                            >
                              {formatAddressDetail(address as IAddress)}
                            </Typography>
                          </div>
                        )}

                        <div className="relative p-3 bg-background-secondary rounded-xl">
                          <div className="absolute right-2 top-2">
                            <Button
                              size="small"
                              variant="ghost"
                              icon={
                                <i className="ri-pencil-line text-text-secondary" />
                              }
                              onClick={() => {
                                handleEditPOForm(index, field.name);
                              }}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-secondary !font-medium"
                            >
                              เลขที่อ้างอิงใบสั่งซื้อ (PO)
                            </Typography>
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-quinary"
                            >
                              {poNumber || 'ไม่มีข้อมูล'}
                            </Typography>
                          </div>

                          <div className="mt-2 flex flex-col gap-2">
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-secondary !font-medium"
                            >
                              เอกสารใบสั่งซื้อ (PO)
                            </Typography>
                            <div className="flex gap-2">
                              <div
                                className="w-[64px] h-[64px] flex justify-center items-center rounded-md border border-dashed border-border-primary cursor-pointer"
                                onClick={() => {
                                  handleEditPOForm(index, field.name);
                                }}
                              >
                                <i className="ri-add-line text-2xl text-text-secondary" />
                              </div>
                              {poFiles &&
                                poFiles.length > 0 &&
                                poFiles.map((file: any, idx: any) => {
                                  const fileType = file.name
                                    .split('.')
                                    .pop()
                                    ?.toLowerCase();
                                  const isImage =
                                    fileType === 'jpg' ||
                                    fileType === 'jpeg' ||
                                    fileType === 'png';
                                  return (
                                    <div
                                      key={idx}
                                      className="w-[64px] h-[64px] flex justify-center items-center rounded-md border border-border-primary bg-white"
                                    >
                                      {isImage ? (
                                        <AntdImage
                                          src={file.url}
                                          width={40}
                                          height={40}
                                          preview={{
                                            visible: imageVisible,
                                            src: file.url,
                                            mask: <i className="ri-eye-line" />,
                                            onVisibleChange: (value) => {
                                              setImageVisible(value);
                                            },
                                          }}
                                          onError={(e) => {
                                            const currentImg =
                                              e.currentTarget as HTMLImageElement;
                                            currentImg.src =
                                              '/assets/default-image.png';
                                            currentImg.className = `object-contain object-center w-[36px] h-[36px]`;
                                          }}
                                        />
                                      ) : (
                                        <Image
                                          src="/assets/icons/file-type-pdf.svg"
                                          alt="pdf-icon"
                                          className="mx-auto cursor-pointer"
                                          width={40}
                                          height={40}
                                          onError={(e) => {
                                            const currentImg =
                                              e.currentTarget as HTMLImageElement;
                                            currentImg.src =
                                              '/assets/default-image.png';
                                            currentImg.className = `object-contain object-center w-[36px] h-[36px]`;
                                          }}
                                          onClick={() => {
                                            window.open(file.url, '_blank');
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="flex items-center mt-2 gap-2">
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-secondary !font-medium"
                              >
                                ใบกำกับภาษี{' '}
                                <i className="ri-information-line" />
                              </Typography>
                              <ToggleSwitch
                                type="text"
                                isChecked={isTaxInvoice}
                                showLabel={false}
                                title="ต้องการใบกำกับภาษี"
                                onChange={(checked) => {
                                  const currentValue =
                                    form.getFieldValue('orderInfomation') || [];
                                  const updatedValue = [...currentValue];
                                  updatedValue[index] = {
                                    ...updatedValue[index],
                                    isTaxInvoice: checked,
                                  };
                                  form.setFieldValue(
                                    ['orderInfomation', index, 'isTaxInvoice'],
                                    checked
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-background-secondary rounded-xl">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-center">
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-secondary !font-medium"
                              >
                                สินค้าในรอบ
                              </Typography>
                              <Label
                                text={`${
                                  products?.length
                                } SKU, รวม ${products?.reduce(
                                  (acc: number, item: any) =>
                                    acc + (item.count || 0),
                                  0
                                )} หน่วย`}
                                size="small"
                                variant="ghost"
                                rounding="pill"
                              />
                            </div>
                            {products?.length > 0 && (
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-secondary !font-medium"
                              >
                                มูลค่า ฿
                                {products
                                  ?.reduce(
                                    (total: number, item: any) =>
                                      total +
                                      ((item.specialPrice !== undefined &&
                                      item.specialPrice !== 0
                                        ? item.specialPrice
                                        : item.price) || 0) *
                                        (item.count || 0),
                                    0
                                  )
                                  .toLocaleString()}
                              </Typography>
                            )}
                          </div>
                          {products?.length > 0 ? (
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex gap-2 items-center">
                                <Avatar.Group>
                                  {products?.map(
                                    (product: any, idx: number) => (
                                      <div
                                        className="shadow-xl bg-background-secondary rounded-xl p-2"
                                        key={idx}
                                      >
                                        <Image
                                          src={product.imagePath}
                                          alt={product.name}
                                          width={32}
                                          height={32}
                                          className="rounded-md"
                                          onError={(e) => {
                                            const currentImg =
                                              e.currentTarget as HTMLImageElement;
                                            currentImg.src =
                                              '/assets/default-image.png';
                                            currentImg.className = `object-contain object-center w-[32px] h-[32px]`;
                                          }}
                                        />
                                      </div>
                                    )
                                  )}
                                </Avatar.Group>
                                <Button
                                  size="small"
                                  variant="ghost"
                                  icon={
                                    <i className="ri-pencil-line text-text-secondary" />
                                  }
                                  onClick={() => {
                                    handleEditSelectProductForm(
                                      index,
                                      field.name
                                    );
                                  }}
                                />
                              </div>
                              <div>
                                <Button
                                  variant="link"
                                  icon={
                                    expandProducts[index] ? (
                                      <i className="ri-arrow-up-s-line" />
                                    ) : (
                                      <i className="ri-arrow-down-s-line" />
                                    )
                                  }
                                  className="!px-0"
                                  iconPosition="end"
                                  onClick={() => {
                                    setExpandProducts((prev: any) => {
                                      const newExpandProducts = [...prev];
                                      newExpandProducts[index] =
                                        !newExpandProducts[index];
                                      return newExpandProducts;
                                    });
                                  }}
                                >
                                  ดูรายละเอียด
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="w-full mt-2 border border-dashed border-border-brand-lighter bg-white hover:bg-primary-hover rounded-2xl flex justify-center py-[30px]"
                              onClick={() =>
                                handleEditSelectProductForm(index, field.name)
                              }
                            >
                              <Button
                                variant="link"
                                icon={<i className="ri-add-fill" />}
                              >
                                เพิ่มสินค้าในรอบ
                              </Button>
                            </div>
                          )}
                          {expandProducts[index] && (
                            <div className="mt-3 py-2 flex flex-col gap-2">
                              {products?.map(
                                (
                                  product: ICheckoutProductItem,
                                  idxProduct: number
                                ) => (
                                  <div
                                    key={product.productId}
                                    className="flex flex-wrap justify-between items-center bg-white rounded-2xl p-2"
                                  >
                                    <div className="flex w-[calc(100%_-_10%)] md:w-[calc(100%_-_40%)] items-center gap-2 pr-2">
                                      <Image
                                        src={product.imagePath}
                                        alt={product.name}
                                        width={56}
                                        height={56}
                                        className="rounded-md"
                                        onError={(e) => {
                                          const currentImg =
                                            e.currentTarget as HTMLImageElement;
                                          currentImg.src =
                                            '/assets/default-image.png';
                                          currentImg.className = `object-contain object-center w-[56px] h-[56px]`;
                                        }}
                                      />
                                      <div className="w-[calc(100%_-_64px)]">
                                        <Typography
                                          variant="paragraph-medium"
                                          className="!text-text-secondary"
                                          ellipsis={true}
                                          ellipsisOptions={{
                                            rows: 1,
                                          }}
                                        >
                                          {product.name}
                                        </Typography>
                                        <div className="flex gap-2 overflow-x-auto mt-1">
                                          {product.variants.variant1 && (
                                            <Label
                                              text={product.variants.variant1}
                                              rounding="pill"
                                              variant="ghost"
                                              size="small"
                                            />
                                          )}
                                          {product.variants.variant2 && (
                                            <Label
                                              text={product.variants.variant2}
                                              rounding="pill"
                                              variant="ghost"
                                              size="small"
                                            />
                                          )}
                                          {product.variants.variant3 && (
                                            <Label
                                              text={product.variants.variant3}
                                              rounding="pill"
                                              variant="ghost"
                                              size="small"
                                            />
                                          )}
                                          {product.variants.variant4 && (
                                            <Label
                                              text={product.variants.variant4}
                                              rounding="pill"
                                              variant="ghost"
                                              size="small"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex w-[calc(100%_-_90%)] md:w-[calc(100%_-_60%)] items-center gap-2">
                                      <div className="p-2 hidden md:flex flex-col w-full">
                                        <Typography
                                          variant="paragraph-small"
                                          className="!text-text-secondary"
                                        >
                                          {product?.count}
                                        </Typography>
                                        <Typography
                                          variant="paragraph-extra-small"
                                          className="!text-text-quinary"
                                        >
                                          {product.unit}
                                        </Typography>
                                      </div>
                                      <div className="p-2 hidden md:flex flex-col w-full">
                                        {product.specialPrice ? (
                                          <>
                                            <Typography
                                              variant="paragraph-small"
                                              className="!text-text-secondary"
                                            >
                                              ฿
                                              {product.specialPrice
                                                ? product.specialPrice.toLocaleString()
                                                : '0'}
                                            </Typography>
                                            <Typography
                                              variant="paragraph-extra-small"
                                              className="!text-text-quinary !line-through"
                                            >
                                              ฿{product.price.toLocaleString()}
                                            </Typography>
                                          </>
                                        ) : (
                                          <div className="flex items-center">
                                            <Typography
                                              variant="paragraph-small"
                                              className="!text-text-secondary"
                                            >
                                              ฿{product.price.toLocaleString()}
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-2 flex items-center justify-end w-full">
                                        <Popover
                                          content={
                                            <div className="w-[160px] rounded-md  border-[0.5px] border-border-primary shadow-lg bg-white">
                                              {orderInfomationValue.length >
                                                1 && (
                                                <Popover
                                                  // inner
                                                  content={
                                                    <div className="w-[200px] flex flex-col">
                                                      {orderInfomationValue.map(
                                                        (_, idx) => {
                                                          if (idx === index)
                                                            return null;
                                                          return (
                                                            <div
                                                              key={idx}
                                                              className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover"
                                                              onClick={() => {
                                                                // ปิด inner popover ก่อน
                                                                closeSpecificInnerPopover(
                                                                  index,
                                                                  idxProduct
                                                                );

                                                                handleOpenTransferProductPopupWithClosePopovers(
                                                                  product,
                                                                  index,
                                                                  idx
                                                                );
                                                              }}
                                                            >
                                                              <Typography
                                                                variant="paragraph-small"
                                                                className="!text-text-secondary cursor-pointer"
                                                              >
                                                                รอบจัดส่งครั้งที่{' '}
                                                                {idx + 1}
                                                              </Typography>
                                                            </div>
                                                          );
                                                        }
                                                      )}
                                                    </div>
                                                  }
                                                  arrow={false}
                                                  styles={{
                                                    body: {
                                                      padding: 0,
                                                    },
                                                  }}
                                                  placement="leftBottom"
                                                  trigger="click"
                                                  autoAdjustOverflow={false}
                                                  getPopupContainer={(
                                                    triggerNode
                                                  ) => {
                                                    // ใช้ parentElement เพื่อให้ inner popover render ถูกต้อง
                                                    const parent =
                                                      triggerNode.parentElement;
                                                    return (
                                                      parent || document.body
                                                    );
                                                  }}
                                                  open={
                                                    isVisibleInnerPopoverTransfer[
                                                      index
                                                    ]?.[idxProduct] || false
                                                  }
                                                  onOpenChange={(visible) => {
                                                    // ใช้ setTimeout เพื่อให้ outer popover render เสร็จก่อน
                                                    setTimeout(() => {
                                                      const newState = [
                                                        ...isVisibleInnerPopoverTransfer,
                                                      ];
                                                      if (!newState[index]) {
                                                        newState[index] = [];
                                                      }
                                                      newState[index][
                                                        idxProduct
                                                      ] = visible;
                                                      setIsVisibleInnerPopoverTransfer(
                                                        newState
                                                      );
                                                    }, 0);
                                                  }}
                                                >
                                                  <div className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover">
                                                    <Typography
                                                      variant="paragraph-small"
                                                      className="!text-text-secondary"
                                                    >
                                                      ย้ายสินค้า
                                                    </Typography>
                                                    <i className="ri-arrow-right-s-line text-icon-quinary" />
                                                  </div>
                                                </Popover>
                                              )}

                                              <div
                                                className="flex justify-between px-4 py-[10px] cursor-pointer items-center hover:bg-primary-hover"
                                                onClick={() =>
                                                  handleDeleteProduct(
                                                    index,
                                                    idxProduct
                                                  )
                                                }
                                              >
                                                <Typography
                                                  variant="paragraph-small"
                                                  className="!text-text-secondary"
                                                >
                                                  ลบ
                                                </Typography>
                                                <i className="ri-delete-bin-6-line text-error" />
                                              </div>
                                            </div>
                                          }
                                          placement="bottomRight"
                                          trigger="click"
                                          arrow={false}
                                          autoAdjustOverflow={false}
                                          getPopupContainer={(triggerNode) =>
                                            triggerNode.parentElement ||
                                            document.body
                                          }
                                          open={
                                            isVisiblePopoverProducts[index]?.[
                                              idxProduct
                                            ] || false
                                          }
                                          onOpenChange={(open) => {
                                            // ใช้ setTimeout เพื่อให้ popover render เสร็จก่อน
                                            setTimeout(() => {
                                              const newState = [
                                                ...isVisiblePopoverProducts,
                                              ];
                                              if (!newState[index]) {
                                                newState[index] = [];
                                              }
                                              newState[index][idxProduct] =
                                                open;
                                              setIsVisiblePopoverProducts(
                                                newState
                                              );

                                              // หาก outer popover ปิด, ปิด inner popover ด้วย
                                              if (!open) {
                                                closeSpecificInnerPopover(
                                                  index,
                                                  idxProduct
                                                );
                                              }
                                            }, 0);
                                          }}
                                          styles={{
                                            body: { padding: 0 },
                                          }}
                                        >
                                          <div className="w-[40px]">
                                            <Button
                                              size="small"
                                              variant="ghost"
                                              icon={
                                                <i className="ri-more-2-fill text-text-secondary"></i>
                                              }
                                            />
                                          </div>
                                        </Popover>
                                      </div>
                                    </div>
                                    <div className="flex-1 flex md:hidden items-center justify-between mt-5 px-3">
                                      <div className="flex items-center gap-1">
                                        <Typography
                                          variant="paragraph-small"
                                          className="!text-text-secondary"
                                        >
                                          {product?.count}
                                        </Typography>
                                        <Typography
                                          variant="paragraph-extra-small"
                                          className="!text-text-quinary"
                                        >
                                          {product.unit}
                                        </Typography>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {product.specialPrice ? (
                                          <>
                                            <Typography
                                              variant="paragraph-small"
                                              className="!text-text-secondary"
                                            >
                                              ฿
                                              {product.specialPrice
                                                ? product.specialPrice.toLocaleString()
                                                : '0'}
                                            </Typography>
                                            <Typography
                                              variant="paragraph-extra-small"
                                              className="!text-text-quinary !line-through"
                                            >
                                              ฿{product.price.toLocaleString()}
                                            </Typography>
                                          </>
                                        ) : (
                                          <div className="flex items-center">
                                            <Typography
                                              variant="paragraph-small"
                                              className="!text-text-secondary"
                                            >
                                              ฿{product.price.toLocaleString()}
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </div>
            ))}
            {remainingQuantity > 0 && (
              <div
                className="w-full mt-2 border border-dashed border-border-brand-lighter bg-white hover:bg-primary-hover rounded-2xl flex justify-center py-[30px]"
                onClick={() => handleOpenDrawerGradully(null)}
              >
                <Button variant="link" icon={<i className="ri-add-fill" />}>
                  เพิ่มรอบการจัดส่ง
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>
      <DrawerDeliveryGradully
        isOpen={isOpenDrawerGradully}
        onClose={() => {
          setIsOpenDrawerGradully(false);
          setEditStep(null); // Reset editStep when closing
        }}
        onCreateFinish={(values) => {
          add(values);
          setEditStep(null); // Reset editStep after creation
        }}
        onMergeFinish={(value: any, index: number) => {
          const existingProducts = orderInfomationValue[index].products || [];
          const newProducts = value || [];

          const sumProduct = [...existingProducts];

          newProducts?.forEach((newProduct: any) => {
            const existingIndex = sumProduct.findIndex(
              (existing: any) => existing.productId === newProduct.productId
            );

            if (existingIndex >= 0) {
              sumProduct[existingIndex] = {
                ...sumProduct[existingIndex],
                count:
                  (sumProduct[existingIndex].count || 0) +
                  (newProduct.quantity || 0),
                quantity:
                  (sumProduct[existingIndex].quantity || 0) +
                  (newProduct.quantity || 0),
              };
            } else {
              sumProduct.push({
                ...newProduct,
                count: newProduct.quantity || 0,
              });
            }
          });
          form.setFieldValue(
            ['orderInfomation', index, 'products'],
            sumProduct
          );
        }}
        onEditFinish={handleEditFinish}
        currentOrderIndex={currentOrderIndex}
        remainingProducts={remainingProducts}
        editStep={editStep}
        orderInfomationValue={orderInfomationValue}
      />
      <MobileConfirmDrawer />
    </div>
  );
};

export default MultiDeliverySection;
