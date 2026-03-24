import { getAdresses } from '@/common/api/customer-service/address.api';
import {
  DeliveryReceiveType,
  DeliveryTime,
  DeliveryType,
  DeliveryBy,
} from '@/common/enum/payment.enum';
import CardSelection from '@/components/Card/Selection';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import DrawerSelectAddress, {
  IAddress,
} from '@/components/Drawer/SelectAddress';
import Typography from '@/components/Typography';
import { ICheckoutProductItem, useCheckoutStore } from '@/store/checkout.store';
import {
  modeSelectAddress,
  useSelectAddressStore,
} from '@/store/select-address.store';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Col, Divider, Form, FormInstance, Grid, Row, UploadFile } from 'antd';
import { FC, useEffect, useState, useRef, useMemo } from 'react';
import useConfirmModal from '@/hooks/useConfirmModal';
import ProductTransferPopup from '../ProductTransferPopup';
import DeliveryFormSection from './DeliveryFormSection';
import MultiDeliverySection from './MultiDeliverySection';

export interface IDeliveryForm {
  deliveryType: DeliveryType;
  deliveryReceiveType: DeliveryReceiveType;
  orderInfomation: IOrderInformationDeliveryForm[];
}

export interface IOrderInformationDeliveryForm {
  address: IAddress | null;
  deliveryBy: DeliveryBy;
  deliveryDate: string;
  deliveryTime: string;
  name?: string;
  phoneNumber?: string;
  remark?: string;
  products: ICheckoutProductItem[];
  poNumber?: string;
  poFiles?: UploadFile[];
  remarkPo?: string;
  isTaxInvoice?: boolean;
}

type FormDeliveryProps = {
  form: FormInstance<IDeliveryForm>;
};

const FormDelivery: FC<FormDeliveryProps> = ({ form }) => {
  const [isOpenAddressDrawer, setIsOpenAddressDrawer] =
    useState<boolean>(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number | null>(
    null
  );
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);

  const { confirmDelete, MobileConfirmDrawer } = useConfirmModal();

  const [transferProductForm] = Form.useForm();
  const [productTransferProps, setProductTransferProps] = useState<{
    isOpen: boolean;
    transferToIndex: number;
    productForm: FormInstance<any>;
  }>({
    isOpen: false,
    transferToIndex: 0,
    productForm: transferProductForm,
  });

  const { setSelectedAddressId, setMode } = useSelectAddressStore();
  const { carts } = useCheckoutStore();

  const { sm } = Grid.useBreakpoint();

  const isMobile = !sm;

  const orderInfomationValue = Form.useWatch(
    'orderInfomation',
    form
  ) as IOrderInformationDeliveryForm[];

  const deliveryReceiveType = Form.useWatch(
    'deliveryReceiveType',
    form
  ) as DeliveryReceiveType;

  const { data } = useInfiniteQuery({
    queryKey: ['addresses'],
    queryFn: async ({ pageParam = 1 }) => {
      const safeParams = { page: pageParam, pageLimit: 10 };
      const response = await getAdresses(safeParams);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.meta) return undefined;
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });

  const addressDataInfinite = data?.pages.flatMap((page) => page.items) || [];

  const { data: addressData } = useQuery({
    queryKey: ['addresses', { page: 1, pageLimit: 100 }],
    queryFn: async () => {
      const response = await getAdresses({ page: 1, pageLimit: 100 });
      return response.items;
    },
  });
  const addressDefault = addressData?.find(
    (address: any) => address.isDefault === true
  );

  // Memoized calculation for remaining products
  const remainingProducts = useMemo(() => {
    if (!orderInfomationValue || !carts) return [];

    const allProducts = orderInfomationValue.map(
      (item: IOrderInformationDeliveryForm) => {
        return item.products || [];
      }
    );
    // Sum products by id across all delivery rounds
    const summedProducts: Record<number, ICheckoutProductItem> = {};
    allProducts.flat().forEach((product: ICheckoutProductItem) => {
      if (summedProducts[product.productId]) {
        summedProducts[product.productId] = {
          ...product,
          count: summedProducts[product.productId].count + product.count,
        };
      } else {
        summedProducts[product.productId] = { ...product };
      }
    });

    const resultProducts = Object.values(summedProducts);

    // Compare resultProducts with carts and return array of remaining products
    const remaining = carts
      .map((cartProduct) => {
        const matched = resultProducts.find(
          (p) => p.productId === cartProduct.productId
        );
        if (matched) {
          const remainingCount = cartProduct.count - matched.count;
          if (remainingCount > 0) {
            return { ...cartProduct, count: remainingCount };
          }
          return null;
        }
        return cartProduct;
      })
      .filter(Boolean);

    return remaining;
  }, [orderInfomationValue, carts]);

  // Memoized calculation for remaining quantity
  const remainingQuantity = useMemo(() => {
    return remainingProducts.reduce((acc, item) => {
      return acc + (item?.count || 0);
    }, 0);
  }, [remainingProducts]);

  const handleOpenAddressDrawer = (
    orderIndex: number,
    addressId: number | null,
    mode: modeSelectAddress = modeSelectAddress.SELECT_ADDRESS
  ) => {
    setCurrentOrderIndex(orderIndex);
    setSelectedAddress(
      form.getFieldValue(['orderInfomation', orderIndex, 'address'])
    );
    if (addressId) {
      setSelectedAddressId(addressId);
    } else {
      setMode(mode);
    }
    setIsOpenAddressDrawer(true);
  };

  const selectAddressToForm = (address: IAddress) => {
    const orderInfomation = form.getFieldValue('orderInfomation') || [];
    const updatedOrderInfomation = [...orderInfomation];
    if (currentOrderIndex !== null) {
      updatedOrderInfomation[currentOrderIndex] = {
        ...updatedOrderInfomation[currentOrderIndex],
        address: address,
      };
      form.setFieldsValue({ orderInfomation: updatedOrderInfomation });
    }
    setIsOpenAddressDrawer(false);
    setSelectedAddressId(null);
  };

  const handleOpenTransferProductPopup = (
    product: any,
    currentIndex: number,
    transferToIndex: number
  ) => {
    transferProductForm.setFieldsValue({
      product: {
        ...product,
        quantity: 0,
        count: product.count,
      },
    });
    setCurrentOrderIndex(currentIndex);
    setProductTransferProps({
      isOpen: true,
      transferToIndex: transferToIndex,
      productForm: transferProductForm,
    });
  };

  const handleTransferProducts = (values: any) => {
    if (currentOrderIndex !== null) {
      const productCurrent = orderInfomationValue[currentOrderIndex].products;

      const updatedCurrentProducts = productCurrent
        .map((product) => {
          if (product.productId === values.productId) {
            return {
              ...product,
              count: product.count - values.quantity,
            };
          }
          return product;
        })
        .filter((product) => product.count > 0);

      const productsTransfer =
        orderInfomationValue[productTransferProps.transferToIndex].products;

      let found = false;
      const productsToTransfer = productsTransfer.map((product) => {
        if (product.productId === values.productId) {
          found = true;
          return {
            ...product,
            count: product.count + values.quantity,
          };
        }
        return product;
      });

      if (!found) {
        productsToTransfer.push({
          ...values,
          count: values.quantity,
        });
      }

      form.setFieldValue(
        ['orderInfomation', currentOrderIndex, 'products'],
        updatedCurrentProducts
      );
      form.setFieldValue(
        ['orderInfomation', productTransferProps.transferToIndex, 'products'],
        productsToTransfer
      );

      setProductTransferProps({
        isOpen: false,
        transferToIndex: 0,
        productForm: transferProductForm,
      });
    }
  };

  const { setDeliveryFormValue } = useCheckoutStore();
  return (
    <Form
      form={form}
      className="w-full"
      layout="vertical"
      onFieldsChange={() => {
        setDeliveryFormValue(form.getFieldsValue() as IDeliveryForm);
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={isMobile ? 24 : 8}>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
          >
            รูปแบบการรับสินค้า
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            คุณสามารถเลือกรูปแบบการรับสินค้าได้ที่นี้
          </Typography>
        </Col>
        <Col span={isMobile ? 24 : 16}>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue, setFieldsValue }) => {
              const deliveryType = getFieldValue('deliveryType');

              const handleSelectdeliveryType = (type: string) => {
                setFieldsValue({ deliveryType: type });
              };

              return (
                <Form.Item
                  name="deliveryType"
                  label={
                    <Typography
                      variant="paragraph-medium"
                      className="!text-text-secondary !font-medium"
                    >
                      การรับสินค้า
                    </Typography>
                  }
                >
                  <div className="w-full flex gap-2">
                    <CardSelection
                      isSelected={deliveryType === DeliveryType.AGENT_SERVICE}
                      icon="ri-truck-line"
                      label="จัดส่งโดยร้าน"
                      onClick={() =>
                        handleSelectdeliveryType(DeliveryType.AGENT_SERVICE)
                      }
                    />
                    <CardSelection
                      isSelected={deliveryType === DeliveryType.PICKUP}
                      icon="ri-store-2-line"
                      label="รับสินค้าเอง"
                      onClick={() =>
                        handleSelectdeliveryType(DeliveryType.PICKUP)
                      }
                    />
                  </div>
                </Form.Item>
              );
            }}
          </Form.Item>
          <RadioGroup
            label={
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !font-medium"
              >
                รอบจัดส่ง
              </Typography>
            }
            name="deliveryReceiveType"
            vertical
            size="large"
            options={[
              {
                label: 'ส่งครั้งเดียว',
                value: DeliveryReceiveType.SENDONCE,
              },
              {
                label: 'ทยอยส่ง',
                value: DeliveryReceiveType.GRADUALLY,
              },
            ]}
            onChange={(e) => {
              if (e.target.value === DeliveryReceiveType.GRADUALLY) {
                form.setFieldValue('orderInfomation', []);
                setDeliveryFormValue({
                  deliveryType: form.getFieldValue('deliveryType'),
                  deliveryReceiveType: e.target.value,
                  orderInfomation: [],
                });
              } else {
                form.setFieldsValue({
                  orderInfomation: [
                    {
                      address: addressDefault || null,
                      deliveryBy: DeliveryBy.AGENT,
                      deliveryTime: DeliveryTime.ANYTIME,
                      products: carts,
                    },
                  ],
                });
                setDeliveryFormValue({
                  deliveryType: form.getFieldValue('deliveryType'),
                  deliveryReceiveType: e.target.value,
                  orderInfomation: [
                    {
                      address: addressDefault || null,
                      deliveryBy: DeliveryBy.AGENT,
                      deliveryTime: DeliveryTime.ANYTIME,
                      products: carts,
                      deliveryDate: '',
                    },
                  ],
                });
              }
            }}
          />
        </Col>
      </Row>
      <Divider />
      <Form.Item name="orderInfomation" noStyle />
      <Form.List name="orderInfomation">
        {(fields, { add, remove }) => {
          return (
            <>
              {deliveryReceiveType === DeliveryReceiveType.SENDONCE ? (
                <DeliveryFormSection
                  fields={fields}
                  form={form}
                  addressDataInfinite={addressDataInfinite}
                  handleOpenAddressDrawer={handleOpenAddressDrawer}
                />
              ) : (
                <MultiDeliverySection
                  fields={fields}
                  orderInfomationValue={orderInfomationValue}
                  remainingQuantity={remainingQuantity}
                  currentOrderIndex={currentOrderIndex}
                  setCurrentOrderIndex={setCurrentOrderIndex}
                  remainingProducts={remainingProducts}
                  handleOpenAddressDrawer={handleOpenAddressDrawer}
                  handleOpenTransferProductPopup={
                    handleOpenTransferProductPopup
                  }
                  remove={remove}
                  add={add}
                  form={form}
                />
              )}
            </>
          );
        }}
      </Form.List>

      <DrawerSelectAddress
        isOpen={isOpenAddressDrawer}
        onClose={() => {
          setIsOpenAddressDrawer(false);
          setMode(modeSelectAddress.SELECT_ADDRESS);
        }}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        onSelectAddress={(address) => {
          selectAddressToForm(address);
        }}
        formShipping={form}
        currentOrderIndex={currentOrderIndex}
      />
      <MobileConfirmDrawer />

      <ProductTransferPopup
        form={productTransferProps.productForm}
        transferToIndex={productTransferProps.transferToIndex}
        isOpen={productTransferProps.isOpen}
        onFinish={handleTransferProducts}
        onClose={() =>
          setProductTransferProps({
            isOpen: false,
            transferToIndex: 0,
            productForm: transferProductForm,
          })
        }
      />
    </Form>
  );
};

export default FormDelivery;
