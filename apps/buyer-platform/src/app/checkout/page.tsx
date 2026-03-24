'use client';
import { getAdresses } from '@/common/api/customer-service/address.api';
import {
  DeliveryReceiveType,
  DeliveryTime,
  DeliveryType,
  DeliveryBy,
  PaymentMethod,
} from '@/common/enum/payment.enum';
import Button from '@/components/Button';
import { FloatButtons } from '@/components/FloatButtons';
import Typography from '@/components/Typography';
import { ICheckoutProductItem, useCheckoutStore } from '@/store/checkout.store';
import { useGlobalStore } from '@/store/global.store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Grid } from 'antd';
import Image from 'next/image';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormPaymentMethod, {
  IPaymentMethodForm,
} from './components/FormPaymentMethod';
import Confirmation from './components/Confirmation';
import FormPayment from './components/FormPayment';
import FormDelivery, {
  IDeliveryForm,
  IOrderInformationDeliveryForm,
} from './components/FormDelivery/FormDelivery';
import usePopup from '@/hooks/usePopup';
import dayjs from 'dayjs';
import { getUserDataFromToken } from '@/utils/cookies';
import { Label } from '@/components/Label';
import {
  IOrderRequest,
  ISubOrderResponse,
} from '@/common/interfaces/order.interface';
import { createOrder, getOrderById } from '@/common/api/order-service/order.api';
import { getCount } from '@/common/api/order-service/cart.api';
import Cookies from 'js-cookie';
import { formatThaiBaht, getOrderPrices } from '@/utils/format';
import {
  getOrderPaymentById,
  IPaymentMethodSubOrderRequest,
  updatePaymentMethodSubOrder,
  updatePaymentSubOrder,
} from '@/common/api/order-service/payment.api';

const steps = [
  {
    id: 1,
    title: 'การจัดส่ง',
    description: 'กรอกข้อมูลการในจัดส่งสินค้า',
    icon: '/assets/icons/location.svg',
    iconType: 'svg',
  },
  {
    id: 2,
    title: 'ยืนยันคำสั่งซื้อ',
    description: 'ตรวจสอบความถูกต้องคำสั่งซื้อ',
    icon: '/assets/icons/order-history-menu.svg',
    iconType: 'svg',
  },
  {
    id: 3,
    title: 'วิธีการชำระเงิน',
    description: 'เลือกช่องทางการชำระเงิน',
    icon: '/assets/icons/checkout-menu.svg',
    iconType: 'svg',
  },
  {
    id: 4,
    title: 'สถานะการชำระ',
    description: 'ติดตามสถานะการชำระเงิน',
    icon: 'ri-shopping-bag-3-line',
    iconType: 'remixicon',
  },
];

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedSubOrders, setSelectedSubOrders] = useState<
    ISubOrderResponse[]
  >([]);
  const [selectedSubOrderIndices, setSelectedSubOrderIndices] = useState<
    number[]
  >([]);
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const isMountedRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    carts,
    cartIds,
    setCarts,
    setCartIds,
    deliveryFormValue,
    setDeliveryFormValue,
  } = useCheckoutStore();
  const { profile } = useGlobalStore();

  // Check if orderId exists in query string
  const isCreate = searchParams?.get('orderId') === null;

  const { showPopup, PopupComponent } = usePopup();

  const [deliveryForm] = Form.useForm<IDeliveryForm>();
  const [paymentInfoForm] = Form.useForm<IPaymentMethodForm>();

  const { refetch: refetchCount } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => {
      const auth = Cookies.get('auth');
      const authData = auth ? JSON.parse(auth) : null;
      return getCount(authData?.accessToken);
    },
  });

  const [orderId, setOrderId] = useState<string | null>(
    searchParams.get('orderId')
  );

  const [orderPaymentId, setOrderPaymentId] = useState<string | null>(
    searchParams.get('orderPaymentId')
  );

  const { data: orderData, refetch: refetchOrder } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  const { data: orderPaymentData, refetch: refetchOrderPayment } = useQuery({
    queryKey: ['orderPayment', orderPaymentId],
    queryFn: () => getOrderPaymentById(Number(orderPaymentId)),
    enabled: !!orderPaymentId,
  });

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

  useEffect(() => {
    if (deliveryFormValue) {
      const { orderInfomation, deliveryReceiveType } =
        deliveryFormValue as IDeliveryForm;
      const formattedOrderInfo = orderInfomation.map((order) => {
        const formattedOrder: IOrderInformationDeliveryForm = {
          ...order,
          deliveryDate: order.deliveryDate
            ? (dayjs(order.deliveryDate) as any)
            : undefined,
        };
        return formattedOrder;
      });
      deliveryForm.setFieldsValue({
        ...deliveryFormValue,
        orderInfomation:
          orderInfomation.length === 0 &&
          deliveryReceiveType === DeliveryReceiveType.GRADUALLY
            ? []
            : formattedOrderInfo,
      });
    } else {
      deliveryForm.setFieldsValue({
        deliveryType: DeliveryType.AGENT_SERVICE,
        deliveryReceiveType: DeliveryReceiveType.SENDONCE,
        orderInfomation: [
          {
            address: addressDefault || null,
            deliveryBy: DeliveryBy.AGENT,
            deliveryDate: '',
            deliveryTime: DeliveryTime.ANYTIME,
            name: profile?.name || '',
            phoneNumber: profile?.tel || '',
            remark: '',
            products: carts,
          },
        ],
      });
    }
  }, [deliveryFormValue, addressDefault]);

  useEffect(() => {
    const orderIdFromParams = searchParams.get('orderId');
    if (orderIdFromParams && orderIdFromParams !== orderId) {
      setOrderId(orderIdFromParams);
    }
  }, [searchParams, orderId]);

  useEffect(() => {
    const orderIdFromParams = searchParams.get('orderPaymentId');
    setOrderPaymentId(orderIdFromParams);
  }, [searchParams]);

  useEffect(() => {
    if (orderData) {
      if (orderPaymentId) {
        if (!orderPaymentData?.paymentMethod) {
          paymentInfoForm.setFieldValue(
            'paymentMethod',
            PaymentMethod.BANK_TRANSFER
          );
          setCurrentStep(3);
        } else {
          setCurrentStep(4);
        }
      } else {
        setCurrentStep(2);
      }
    } else {
      setCurrentStep(1);
    }
  }, [orderData, orderPaymentData]);

  const { mutate: handleCreateOrder, isPending: isLoadingCreateOrder } =
    useMutation({
      mutationFn: createOrder,
      onSuccess: (data) => {
        if (data.orderId) {
          setCartIds([]);
          setCarts([]);
          setDeliveryFormValue(null);
          setCurrentStep(currentStep + 1);
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('orderId', data.orderId);
          router.replace(currentUrl.toString());
          setOrderId(data.orderId);
          refetchCount();
        }
      },
      onError: (error) => {
        showPopup('error', {
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง',
        });
      },
    });

  const { mutate: handleUpdatePayment, isPending: isLoadingUpdatePayment } =
    useMutation({
      mutationFn: updatePaymentSubOrder,
      onSuccess: (data) => {
        if (data) {
          refetchOrder();
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('orderPaymentId', data.data.id);
          router.replace(currentUrl.toString());
          paymentInfoForm.setFieldValue(
            'paymentMethod',
            PaymentMethod.BANK_TRANSFER
          );
          setCurrentStep(currentStep + 1);
        }
      },
      onError: (error) => {
        showPopup('error', {
          title: 'เกิดข้อผิดพลาด',
          description:
            'ไม่สามารถอัปเดตข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
        });
      },
    });

  const { mutate: handleConfirmPayment, isPending: isLoadingConfirmPayment } =
    useMutation({
      mutationFn: (data: IPaymentMethodSubOrderRequest) =>
        updatePaymentMethodSubOrder(data, Number(orderPaymentId)),
      onSuccess: (data) => {
        if (data) {
          refetchOrderPayment();
          setCurrentStep(currentStep + 1);
        }
      },
      onError: (error) => {
        showPopup('error', {
          title: 'เกิดข้อผิดพลาด',
          description:
            'ไม่สามารถอัปเดตข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
        });
      },
    });

  const handleSubOrderSelect = (index: number, checked: boolean) => {
    // Check if the sub-order at this index has 'NEW' status
    const subOrder = orderData?.subOrders?.[index];
    if (!subOrder || subOrder.status !== 'NEW') {
      return; // Don't allow selection of non-NEW sub-orders
    }

    let newSelectedSubOrders: number[];
    if (checked) {
      newSelectedSubOrders = [...selectedSubOrderIndices, index];
    } else {
      newSelectedSubOrders = selectedSubOrderIndices.filter(
        (i: number) => i !== index
      );
    }

    const selectedSubOrdersData = newSelectedSubOrders
      .map((i: number) => orderData?.subOrders?.[i])
      .filter(Boolean);

    setSelectedSubOrderIndices(newSelectedSubOrders);
    setSelectedSubOrders(selectedSubOrdersData);
  };

  const handleSelectAll = (checked: boolean) => {
    let newSelectedSubOrders: number[];
    if (checked) {
      // Only select sub-orders with 'NEW' status
      newSelectedSubOrders =
        orderData?.subOrders
          ?.map((subOrder: ISubOrderResponse, index: number) =>
            subOrder.status === 'NEW' ? index : -1
          )
          .filter((index: number) => index !== -1) || [];
    } else {
      newSelectedSubOrders = [];
    }

    const selectedSubOrdersData = newSelectedSubOrders
      .map((i: number) => orderData?.subOrders?.[i])
      .filter(Boolean);

    setSelectedSubOrderIndices(newSelectedSubOrders);
    setSelectedSubOrders(selectedSubOrdersData);
  };

  useEffect(() => {
    if (orderData?.subOrders) {
      const shouldShowCheckboxes =
        orderData?.deliveryReceiveType !== DeliveryReceiveType.SENDONCE;

      // Filter only sub-orders with 'NEW' status
      const newSubOrders = orderData.subOrders.filter(
        (subOrder: ISubOrderResponse) => subOrder.status === 'NEW'
      );

      const newSubOrderIndices = orderData.subOrders
        .map((subOrder: ISubOrderResponse, index: number) =>
          subOrder.status === 'NEW' ? index : -1
        )
        .filter((index: number) => index !== -1);

      if (!shouldShowCheckboxes) {
        // For single delivery, select all NEW sub-orders
        setSelectedSubOrderIndices(newSubOrderIndices);
        setSelectedSubOrders(newSubOrders);
      } else if (selectedSubOrderIndices.length === 0) {
        // For multiple delivery, initially select all NEW sub-orders
        setSelectedSubOrderIndices(newSubOrderIndices);
        setSelectedSubOrders(newSubOrders);
      }
    }
  }, [orderData]);

  const newSubOrdersCount =
    orderData?.subOrders?.filter(
      (subOrder: ISubOrderResponse) => subOrder.status === 'NEW'
    ).length || 0;

  const isAllSelected =
    newSubOrdersCount > 0 &&
    selectedSubOrderIndices.length === newSubOrdersCount;
  const isIndeterminate =
    selectedSubOrderIndices.length > 0 &&
    selectedSubOrderIndices.length < newSubOrdersCount;

  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <FormDelivery form={deliveryForm} />;
      case 2:
        return (
          <Confirmation
            orderData={orderData}
            selectedSubOrderIndices={selectedSubOrderIndices}
            onSubOrderSelect={handleSubOrderSelect}
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
          />
        );
      case 3:
        return (
          <FormPaymentMethod form={paymentInfoForm} orderData={orderData} />
        );
      case 4:
        return (
          <FormPayment
            orderData={orderData}
            orderPaymentData={orderPaymentData}
            refetchOrderPayment={refetchOrderPayment}
            handleConfirmPayment={handleConfirmPayment}
          />
        );
      default:
        return <></>;
    }
  }, [
    currentStep,
    deliveryForm,
    isCreate,
    orderData,
    selectedSubOrderIndices,
    isAllSelected,
    isIndeterminate,
    orderPaymentData,
  ]);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      try {
        const deliveryValues = await deliveryForm.validateFields();
        if (currentStep < steps.length) {
          const userData = getUserDataFromToken();
          const userId = (userData as any)?.userId;
          const organizeId = (userData as any)?.organizeId;
          const sumProducts = deliveryValues.orderInfomation.map((info) => {
            return info.products.reduce((sum, product) => {
              const productPrice =
                product.specialPrice !== product.price
                  ? product.specialPrice
                  : product.price;
              return sum + product.count * productPrice;
            }, 0);
          });
          const totalSumProduct = sumProducts.reduce(
            (total, sum) => total + sum,
            0
          );
          if (!cartIds || cartIds.length === 0) return;
          // Check if address is required but not provided
          const hasInvalidAddress = deliveryValues.orderInfomation.some(
            (info) => !info.address || !info.address.addressInfo
          );

          if (hasInvalidAddress) {
            showPopup('warning', {
              title: 'กรุณากรอกที่อยู่จัดส่ง',
              description:
                'กรุณาเลือกหรือเพิ่มที่อยู่จัดส่งสำหรับทุกรอบการจัดส่ง',
            });
            return;
          }
          const testPayload: IOrderRequest = {
            userId,
            organizeId,
            cartId: cartIds[0],
            totalPrice: totalSumProduct,
            totalDeliveryPrice: 0,
            grandTotal: totalSumProduct,
            deliveryType: deliveryValues.deliveryType,
            deliveryReceiveType: deliveryValues.deliveryReceiveType,
            deliveries: deliveryValues.orderInfomation.map((info) => ({
              refPONumber: info.poNumber || '',
              deliveryDate: dayjs(info.deliveryDate).format('YYYY-MM-DD'),
              deliveryTime: info.deliveryTime,
              deliveryBy: info.deliveryBy,
              deliveryNote: info.remark || '',
              documents: {
                po:
                  info.poFiles?.map((file) => ({
                    fileId: file.response.id,
                  })) || [],
              },
              products: info.products.map((product) => ({
                productItemId: product.productItemId,
                quantity: product.count,
                price:
                  product.price !== product.specialPrice
                    ? product.specialPrice
                    : product.price,
                unit: product.unit,
                productItemName: product.name,
                productItemImageUrl: product.imagePath || '',
              })),
              address: {
                shipping: {
                  addressName: info.address?.addressName || '',
                  address: info.address?.addressInfo || '',
                  countryId: info.address?.countryId || '',
                  provinceId: info.address?.provinceId || '',
                  districtId: info.address?.districtId || '',
                  subDistrictId: info.address?.subDistrictId || '',
                  zipCodeId: info.address?.zipcodeId || '',
                  receiverName: info.address?.contactName || '',
                  receiverPhone: info.address?.contactPhoneNumber || '',
                  projectName: info.address?.projectName || '',
                  remark: info.address?.remark || '',
                },
              },
            })),
          };

          // Use mutation to create order
          handleCreateOrder(testPayload);
        }
      } catch (errorInfo: any) {
        const firstErrorField = errorInfo.errorFields?.[0]?.name;
        if (firstErrorField) {
          deliveryForm.scrollToField(firstErrorField);
        }
        return;
      }
    } else if (currentStep === 2) {
      if (selectedSubOrders.length === 0) {
        showPopup('warning', {
          title: 'กรุณาเลือกรอบจัดส่ง',
          description: 'กรุณาเลือกอย่างน้อย 1 รอบจัดส่ง เพื่อดำเนินการต่อ',
        });
        return;
      }
      const price = getOrderPrices({
        ...orderData,
        subOrders: selectedSubOrders,
      }).priceIncludeVat;
      const payload = {
        orderId: orderData?.id,
        subOrderIds: selectedSubOrders.map((subOrder) => subOrder.id),
        amount: price,
      };

      handleUpdatePayment(payload);
    } else if (currentStep === 3) {
      const { paymentMethod } = paymentInfoForm.getFieldsValue();
      if (!paymentMethod) {
        showPopup('warning', {
          title: 'กรุณาเลือกวิธีการชำระเงิน',
          description: 'กรุณาเลือกวิธีการชำระเงิน เพื่อดำเนินการต่อ',
        });
        return;
      }
      const payload = {
        paymentMethod: paymentMethod,
      };
      handleConfirmPayment(payload);
    } else {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1 && isCreate) {
      setCarts([]);
      router.push('/cart');
    } else {
      if (currentStep === 3) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('orderPaymentId');
        router.replace(currentUrl.toString());
        setCurrentStep(currentStep - 1);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (carts.length === 0 || cartIds.length === 0) &&
        isCreate &&
        currentStep === 1
      ) {
        showPopup('warning', {
          title: 'ไม่มีสินค้าในตะกร้านี้',
          description: 'ไม่สามารถทำรายการต่อได้',
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [carts, isCreate, currentStep]);

  // Cleanup all checkout data when component is unmounted
  useEffect(() => {
    // Set a flag after initial mount phase to ensure we're past React's initialization
    const timer = setTimeout(() => {
      isMountedRef.current = true;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (isMountedRef.current) {
        console.log('Cleanup checkout data');
        setDeliveryFormValue(null);
        setCartIds([]);
        setCarts([]);
      }
    };
  }, []);

  const loading =
    isLoadingCreateOrder || isLoadingUpdatePayment || isLoadingConfirmPayment;

  return (
    <div className="bg-background-secondary">
      <div className="container mx-auto p-0 md:p-4">
        {/* Stepper Header */}
        <div className="relative flex justify-between items-start">
          <div
            className="absolute top-[32px] md:top-[60px] h-0.5 bg-gray-300 z-0"
            style={{
              left: isMobile
                ? `calc(${100 / steps.length / 2}% + 16px)`
                : `calc(${100 / steps.length / 2}% + 32px)`,
              right: isMobile
                ? `calc(${100 / steps.length / 2}% + 16px)`
                : `calc(${100 / steps.length / 2}% + 32px)`,
            }}
          >
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1 relative py-4 md:py-8"
              >
                <div
                  className={`w-8 h-8 md:w-[64px] md:h-[64px] rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : isCompleted
                        ? 'bg-primary text-white'
                        : 'bg-[#BDC3CD] text-gray-600'
                  }`}
                >
                  {step.iconType === 'svg' ? (
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={isMobile ? 16 : 32}
                      height={isMobile ? 16 : 32}
                      className={`${
                        isActive || isCompleted
                          ? 'filter brightness-0 invert'
                          : ''
                      }`}
                    />
                  ) : (
                    <i
                      className={`${step.icon} text-base  md:text-[32px] text-white`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="mt-4 text-center max-w-32">
                  <Typography
                    variant={
                      isMobile ? 'paragraph-extra-small' : 'paragraph-big'
                    }
                    className={`${
                      isCompleted || isActive
                        ? '!text-primary'
                        : '!text-text-secondary'
                    } !font-medium`}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-quinary hidden md:block"
                  >
                    {step.description}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-8 rounded-3xl shadow-lg p-4 md:p-8 bg-white">
          {renderStepContent}
          {currentStep < 4 && (
            <>
              {currentStep === 2 ? (
                <div className="fixed bottom-0 left-0 right-0 bg-background-primary z-50 py-3 px-4 md:px-0">
                  <div
                    className="bg-background-primary z-40 absolute top-0 -translate-y-5 right-0 -translate-x-7 flex items-center justify-center shadow-2xl w-[2rem] h-6 rounded-t-lg cursor-pointer"
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                  >
                    <i
                      className={
                        isSummaryOpen
                          ? 'ri-arrow-down-s-line text-xl'
                          : 'ri-arrow-up-s-line text-xl'
                      }
                    ></i>
                  </div>
                  <div className="container mx-auto">
                    {isSummaryOpen && (
                      <div className="my-2">
                        <Typography variant="h3">สรุปคำสั่งซื้อ</Typography>
                        <div className="flex flex-col gap-3 bg-background-secondary p-3 mt-2 rounded-md">
                          <div className="flex items-center justify-between">
                            <Typography variant="paragraph-small">
                              ราคา
                            </Typography>
                            <Typography variant="paragraph-medium">
                              {formatThaiBaht(
                                getOrderPrices({
                                  ...orderData,
                                  subOrders: selectedSubOrders,
                                }).originalPriceIncludeVat,
                                2
                              )}
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between">
                            <Typography variant="paragraph-small">
                              ส่วนลด
                            </Typography>
                            <Typography variant="paragraph-medium">
                              {formatThaiBaht(
                                getOrderPrices({
                                  ...orderData,
                                  subOrders: selectedSubOrders,
                                }).discountPriceIncludeVat,
                                2
                              )}
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between">
                            <Typography variant="paragraph-small">
                              ค่าจัดส่ง
                            </Typography>
                            <Typography variant="paragraph-medium">
                              {getOrderPrices({
                                ...orderData,
                                subOrders: selectedSubOrders,
                              }).priceDelivery !== 0
                                ? formatThaiBaht(
                                    getOrderPrices({
                                      ...orderData,
                                      subOrders: selectedSubOrders,
                                    }).priceDelivery,
                                    2
                                  )
                                : 'FREE'}
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between">
                            <Typography variant="paragraph-small">
                              ราคาก่อนภาษี
                            </Typography>
                            <Typography variant="paragraph-medium">
                              {formatThaiBaht(
                                getOrderPrices({
                                  ...orderData,
                                  subOrders: selectedSubOrders,
                                }).priceExcludeVat,
                                2
                              )}
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between">
                            <Typography variant="paragraph-small">
                              ภาษีมูลค่าเพิ่ม
                            </Typography>
                            <Typography variant="paragraph-medium">
                              {formatThaiBaht(
                                getOrderPrices({
                                  ...orderData,
                                  subOrders: selectedSubOrders,
                                }).priceVat,
                                2
                              )}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="paragraph-big"
                            className="!font-semibold"
                          >
                            ราคารวมสุทธิ
                          </Typography>
                          <Label
                            text={`${selectedSubOrders.reduce(
                              (total, subOrder) =>
                                total + (subOrder.orderItems?.length || 0),
                              0
                            )} รายการ`}
                            variant="ghost"
                            rounding="pill"
                          />
                        </div>
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-quinary"
                        >
                          *ไม่รวมค่าจัดส่ง
                        </Typography>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Typography
                            variant="h3"
                            className="!text-icon-brand-dark !font-bold"
                          >
                            {formatThaiBaht(
                              getOrderPrices({
                                ...orderData,
                                subOrders: selectedSubOrders,
                              }).priceIncludeVat,
                              2
                            )}
                          </Typography>
                          <Typography
                            variant="paragraph-medium"
                            className="!text-text-disabled line-through"
                          >
                            {formatThaiBaht(
                              getOrderPrices({
                                ...orderData,
                                subOrders: selectedSubOrders,
                              }).originalPriceIncludeVat,
                              2
                            )}
                          </Typography>
                        </div>
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-quinary"
                        >
                          รวมภาษีมูลค่าเพิ่ม 7%
                        </Typography>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      {/* <Button
                        variant="outlined"
                        color="neutral"
                        onClick={handlePrevStep}
                      >
                        ย้อนกลับ
                      </Button> */}
                      <Button
                        variant="solid"
                        color="primary"
                        onClick={handleNextStep}
                        icon={<i className="ri-arrow-right-line"></i>}
                        iconPosition="end"
                        loading={loading}
                        disabled={loading}
                      >
                        {loading ? 'กำลังสร้างคำสั่งซื้อ...' : 'ดำเนินการต่อ'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`fixed md:static bottom-0 z-50 bg-white px-4 py-6 md:px-0 md:py-0 inset-x-0 flex mt-6 ${
                    (currentStep === 3 &&
                      orderData.subOrders.filter(
                        (sub: any) =>
                          sub?.payment?.id === Number(orderPaymentId)
                      ).length !== orderData.subOrders.length) ||
                    currentStep === 1
                      ? 'justify-between'
                      : 'justify-end'
                  }`}
                >
                  {((currentStep === 3 &&
                    orderData.subOrders.filter(
                      (sub: any) => sub?.payment?.id === Number(orderPaymentId)
                    ).length !== orderData.subOrders.length) ||
                    currentStep === 1) && (
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={handlePrevStep}
                    >
                      {currentStep === 3 ? 'ย้อนกลับ' : 'ยกเลิก'}
                    </Button>
                  )}

                  {currentStep < steps.length && (
                    <>
                      {currentStep === 1 && (
                        <Form form={deliveryForm}>
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const orderInfomation =
                                getFieldValue('orderInfomation') || [];
                              const deliveryReceiveType = getFieldValue(
                                'deliveryReceiveType'
                              );
                              const allProducts = orderInfomation.map(
                                (item: IOrderInformationDeliveryForm) => {
                                  return item.products;
                                }
                              );
                              // Sum products by id across all delivery rounds
                              const summedProducts: Record<
                                number,
                                ICheckoutProductItem
                              > = {};
                              allProducts
                                .flat()
                                .forEach((product: ICheckoutProductItem) => {
                                  if (summedProducts[product?.productId]) {
                                    summedProducts[product?.productId] = {
                                      ...product,
                                      count:
                                        summedProducts[product?.productId]
                                          .count + product.count,
                                    };
                                  } else {
                                    summedProducts[product?.productId] = {
                                      ...product,
                                    };
                                  }
                                });
                              const resultProducts =
                                Object.values(summedProducts);
                              // เปรียบเทียบ resultProducts กับ carts และคืน array ของสินค้าที่เหลือ (count ใน carts - count ใน resultProducts)
                              const remainingProducts = carts
                                .map((cartProduct: ICheckoutProductItem) => {
                                  const matched = resultProducts.find(
                                    (p: ICheckoutProductItem) =>
                                      p.productId === cartProduct.productId
                                  );
                                  if (matched) {
                                    const remainingCount =
                                      cartProduct.count - matched.count;
                                    if (remainingCount > 0) {
                                      return {
                                        ...cartProduct,
                                        count: remainingCount,
                                      };
                                    }
                                    return null;
                                  }
                                  return cartProduct;
                                })
                                .filter(Boolean);

                              const remainingQuantity =
                                remainingProducts.reduce((acc, item) => {
                                  return acc + (item?.count || 0);
                                }, 0);
                              const isDisabled =
                                remainingQuantity > 0 &&
                                deliveryReceiveType ===
                                  DeliveryReceiveType.GRADUALLY;
                              return (
                                <Button
                                  variant="solid"
                                  color="primary"
                                  onClick={handleNextStep}
                                  icon={<i className="ri-arrow-right-line"></i>}
                                  iconPosition="end"
                                  disabled={isDisabled || loading}
                                  loading={loading}
                                >
                                  {loading
                                    ? 'กำลังสร้างคำสั่งซื้อ...'
                                    : 'ดำเนินการต่อ'}
                                </Button>
                              );
                            }}
                          </Form.Item>
                        </Form>
                      )}

                      {currentStep === 3 && (
                        <Button
                          variant="solid"
                          color="primary"
                          onClick={handleNextStep}
                          icon={<i className="ri-arrow-right-line"></i>}
                          iconPosition="end"
                          loading={loading}
                          disabled={loading}
                        >
                          {loading ? 'กำลังสร้างคำสั่งซื้อ...' : 'ดำเนินการต่อ'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <FloatButtons bottom={isMobile && isSummaryOpen ? 400 : 168} />
      <PopupComponent />
    </div>
  );
};

export default CheckoutPage;
