import Button from '@/components/Button';
import { Label } from '@/components/Label';
import Typography from '@/components/Typography';
import { Drawer, Form, Grid } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import FormSelectProducts from './StepDeliveryGradully/FormSelectProducts';
import {
  modeSelectAddress,
  useSelectAddressStore,
} from '@/store/select-address.store';
import { IAddressForm } from '@/components/Form/Address';
import { IAddress, SelectAddress } from '@/components/Drawer/SelectAddress';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  createAddress,
  deleteAddressById,
  getAddressById,
  getAdresses,
  updateAddress,
} from '@/common/api/customer-service/address.api';
import FormShippingDate from './StepDeliveryGradully/FormShippingDate';
import FormPoFile from './StepDeliveryGradully/FormPofile';
import { DeliveryTime, DeliveryBy } from '@/common/enum/payment.enum';
import { useGlobalStore } from '@/store/global.store';
import { AxiosError } from 'axios';
import { useNotification } from '@/hooks/notification.hook';
import useConfirmModal from '@/hooks/useConfirmModal';
import { IOrderInformationDeliveryForm } from './FormDelivery/FormDelivery';
import usePopup from '@/hooks/usePopup';
import { useCheckoutStore } from '@/store/checkout.store';
import dayjs from 'dayjs';

const renderSubTitleByStep = (step: number) => {
  switch (step) {
    case 1:
      return 'เลือกสินค้าในรอบจัดส่งนี้';
    case 2:
      return 'เลือกที่อยู่จัดส่งในรอบจัดส่งนี้';
    case 3:
      return 'เลือกการจัดส่ง วันและช่วงเวลาในรอบจัดส่งนี้';
    case 4:
      return 'จัดการข้อมูลใบกำกับภาษี และเพิ่มเอกสารที่เกี่ยวข้อง';
    default:
      return '';
  }
};

type DrawerDeliveryGradullyProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateFinish: (value: IOrderInformationDeliveryForm) => void;
  onEditFinish: (value: any) => void;
  onMergeFinish: (value: any, orderIndex: number) => void;
  currentOrderIndex: number | null;
  remainingProducts: any[];
  editStep: number | null;
  orderInfomationValue?: any[];
};

const DrawerDeliveryGradully: React.FC<DrawerDeliveryGradullyProps> = ({
  isOpen,
  onClose,
  onCreateFinish,
  onEditFinish,
  onMergeFinish,
  currentOrderIndex,
  remainingProducts,
  editStep = null,
  orderInfomationValue = [],
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectAddressPage, setSelectAddressPage] = useState<modeSelectAddress>(
    modeSelectAddress.SELECT_ADDRESS
  );
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [initialValues, setInitialValues] = useState<IAddressForm | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectProductsForm] = Form.useForm();
  const [formAddress] = Form.useForm<IAddressForm>();
  const [formShippingDate] = Form.useForm();
  const [formPoFile] = Form.useForm();

  const poFiles = Form.useWatch('poFiles', formPoFile) || [];

  const isUploading = poFiles.some((f: any) => f.status === 'uploading');
  const selectProductValue = Form.useWatch('products', selectProductsForm);

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const { selectedAddressId, setSelectedAddressId, mode } =
    useSelectAddressStore();
  const { carts } = useCheckoutStore();
  const { profile } = useGlobalStore();
  const { notification } = useNotification();
  const { confirmDelete, confirmWarning, MobileConfirmDrawer } =
    useConfirmModal();
  const { showPopup, PopupComponent } = usePopup();

  const { data, fetchNextPage, refetch, isFetchingNextPage } = useInfiniteQuery(
    {
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
    }
  );

  const addressDataInfinite = data?.pages.flatMap((page) => page.items) || [];
  const addressDefault = addressDataInfinite.find(
    (address) => address.isDefault
  );

  const isCreate = useMemo(() => {
    return currentOrderIndex === null;
  }, [currentOrderIndex]);

  const onFinish = async (values: IAddressForm) => {
    if (profile) {
      try {
        setLoading(true);
        const payload = {
          userId: profile?.id,
          organizeId: 4,
          addressType: values.addressType,
          contactName: values.contactName,
          contactPhoneNumber: values.contactPhoneNumber,
          countryId: values.country,
          provinceId: values.provinceId,
          districtId: values.districtId,
          subDistrictId: values.subDistrictId,
          zipcodeId: values.zipcodeId,
          countryName: values.countryName,
          provinceName: values.provinceName,
          districtName: values.districtName,
          subDistrictName: values.subDistrictName,
          zipcodeName: values.zipcodeName,
          projectId: Array.isArray(values.projectId)
            ? values.projectId[0]
            : values.projectId,
          addressName: values.addressName,
          addressInfo: values.addressInfo,
          remark: values.remark,
          latitude: values.latitude ?? '',
          longitude: values.longitude ?? '',
          isDefault: values.isDefault ?? false,
          status: 'active',
          cisNumber: profile?.cisNumber,
        };
        if (selectedAddressId) {
          const response = await updateAddress(selectedAddressId, payload);
          if (response) {
            notification.success({
              message: 'บันทึกที่อยู่จัดส่งสำเร็จ',
              duration: 3,
              icon: <i className="ri-information-line text-primary"></i>,
            });
            refetch();
            setSelectedAddressId(null);
            setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
          }
        } else {
          setSelectedAddressId(null);
          const response = await createAddress(payload);
          if (response) {
            notification.success({
              message: 'เพิ่มที่อยู่จัดส่งสำเร็จ',
              duration: 3,
              icon: <i className="ri-information-line text-primary"></i>,
            });
            refetch();
            setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
            formAddress.resetFields();
            if (addressDataInfinite.length === 0 && setSelectedAddress) {
              setSelectedAddress(response);
            }
          }
        }
      } catch (error: any) {
        const errorStatusCode = (error as AxiosError).response?.status || 500;
        showPopup('error', {
          statusCode: errorStatusCode,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const setAddress = async () => {
    if (!selectedAddressId) return;
    try {
      setLoading(true);
      const response = await getAddressById(selectedAddressId as number);
      const values = {
        addressType: response.addressType,
        contactName: response.contactName,
        contactPhoneNumber: response.contactPhoneNumber,
        country: response.countryId,
        provinceId: response.provinceId,
        districtId: response.districtId,
        subDistrictId: response.subDistrictId,
        zipcodeId: response.zipcodeId,
        countryName: response.countryName,
        provinceName: response.provinceName,
        districtName: response.districtName,
        subDistrictName: response.subDistrictName,
        zipcodeName: response.zipcodeName,
        projectId: response.projectId ? [response.projectId] : [],
        addressName: response.addressName,
        addressInfo: response.addressInfo,
        remark: response.remark,
        isDefault: response.isDefault ?? false,
        latitude: response.latitude ?? '',
        longitude: response.longitude ?? '',
      };
      formAddress.setFieldsValue(values);
      setInitialValues(values);
    } catch (error) {
      const errorStatusCode = (error as AxiosError).response?.status || 500;
      showPopup('error', {
        statusCode: errorStatusCode,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async () => {
    if (!selectedAddressId) return;

    try {
      await deleteAddressById(selectedAddressId);
      notification.success({
        message: 'ลบที่อยู่สำเร็จ',
        duration: 3,
        icon: <i className="ri-information-line text-primary"></i>,
      });
      refetch();
      setSelectedAddressId(null);
      setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
      setInitialValues(null);
      formAddress.resetFields();
    } catch (error) {
      const errorStatusCode = (error as AxiosError).response?.status || 500;
      showPopup('error', {
        statusCode: errorStatusCode,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1) {
      confirmDelete({
        title: 'ยืนยันการปิด',
        description:
          'คุณกำลังจะปิดการสร้างรอบจัดส่ง ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก',
        onOk: () => {
          handleClose();
        },
        okText: 'ปิดโดยไม่บันทึก',
      });
    } else {
      if (currentStep === 4) {
        formShippingDate.setFieldsValue({
          deliveryDate: formShippingDate.getFieldValue('deliveryDate'),
          deliveryBy: DeliveryBy.AGENT,
          deliveryTime: DeliveryTime.ANYTIME,
        });
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 3) {
      await formShippingDate.validateFields();
      const { deliveryDate, deliveryBy, deliveryTime } =
        formShippingDate.getFieldsValue();
      const mergeOrderInfomationIndex = orderInfomationValue.findIndex(
        (orderItem) => {
          return (
            orderItem.deliveryBy === deliveryBy &&
            orderItem.deliveryTime === deliveryTime &&
            dayjs(orderItem.deliveryDate).isSame(dayjs(deliveryDate)) &&
            orderItem.address.id === selectedAddress?.id
          );
        }
      );
      const mergeOrderInfomation =
        mergeOrderInfomationIndex !== -1
          ? orderInfomationValue[mergeOrderInfomationIndex]
          : null;
      if (mergeOrderInfomation !== null) {
        confirmWarning({
          title: 'รอบจัดส่งนี้มีอยู่แล้ว',
          description: `คุณได้สร้างรอบจัดส่งในวันและเวลานี้ไว้แล้ว ต้องการรวมสินค้านี้เข้ากับ รอบที่ ${
            mergeOrderInfomationIndex + 1
          } หรือไม่`,
          onOk: () => {
            onMergeFinish(selectProductValue, mergeOrderInfomationIndex);
            handleClose();
          },
          okText: 'นำเข้าสู่รอบเดิม',
        });
        return;
      }
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 4) {
      await formPoFile.validateFields();
      const { poNumber, poFiles, remarkPo, isTaxInvoice } =
        formPoFile.getFieldsValue();

      const { deliveryDate, deliveryBy, deliveryTime } =
        formShippingDate.getFieldsValue();
      const values: IOrderInformationDeliveryForm = {
        products: selectProductValue
          .filter((product: any) => product.quantity > 0)
          .map((product: any) => {
            return {
              ...product,
              count: product.quantity || 0,
            };
          }),
        address: selectedAddress,
        deliveryDate,
        deliveryBy,
        deliveryTime,
        poFiles: poFiles || [],
        remarkPo: remarkPo || '',
        poNumber: poNumber || '',
        isTaxInvoice: isTaxInvoice || false,
      };
      onCreateFinish(values);
      handleClose();

      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    selectProductsForm.setFieldsValue({
      products: [],
    });
    formShippingDate.setFieldsValue({
      deliveryDate: null,
      deliveryBy: DeliveryBy.AGENT,
      deliveryTime: DeliveryTime.ANYTIME,
    });
    formPoFile.resetFields();
    setSelectedAddress(null);
    setSelectedAddressId(null);
    setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
    setInitialValues(null);
    onClose();
  };

  const handleEdit = async () => {
    if (currentStep === 1) {
      await selectProductsForm.validateFields();

      onEditFinish({
        products: selectProductValue
          .filter((product: any) => product.quantity > 0)
          .map((product: any) => {
            return {
              ...product,
              count: product.quantity || 0,
            };
          }),
      });
    }
    if (currentStep === 3) {
      await formShippingDate.validateFields();
      onEditFinish(formShippingDate.getFieldsValue());
    }
    if (currentStep === 4) {
      await formPoFile.validateFields();
      onEditFinish(formPoFile.getFieldsValue());
    }
  };

  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <FormSelectProducts form={selectProductsForm} />;
      case 2:
        return (
          <SelectAddress
            className="pb-[80px]"
            initialValues={initialValues}
            onFinish={onFinish}
            selectAddressPage={selectAddressPage}
            setSelectAddressPage={setSelectAddressPage}
            addressData={addressDataInfinite}
            selectedAddress={selectedAddress}
            formAddress={formAddress}
            loading={loading}
            isFetchingNextPage={isFetchingNextPage}
            onSelectAddress={(address) => {
              setSelectedAddress(address);
            }}
            handleCancel={() => {
              setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
              setSelectedAddressId(null);
              formAddress.resetFields();
            }}
            onDeleteAddress={() => {
              confirmDelete({
                title: 'ยืนยันการลบที่อยู่',
                description: 'คุณต้องการลบที่อยู่นี้หรือไม่?',
                onOk: () => {
                  deleteAddress();
                },
                okText: 'ลบ',
              });
            }}
          />
        );
      case 3:
        return (
          <FormShippingDate
            form={formShippingDate}
            orderInfomationValue={orderInfomationValue}
            editStep={editStep}
            currentOrderIndex={currentOrderIndex}
          />
        );
      case 4:
        return <FormPoFile form={formPoFile} />;
      default:
        return <></>;
    }
  }, [
    currentStep,
    selectAddressPage,
    selectedAddress,
    formAddress,
    formShippingDate,
    formPoFile,
    mode,
    loading,
    selectedAddressId,
    addressDataInfinite,
    isFetchingNextPage,
    orderInfomationValue,
    editStep,
    currentOrderIndex,
  ]);

  useEffect(() => {
    if (editStep !== null) {
      setCurrentStep(editStep);
      if (
        currentOrderIndex !== null &&
        orderInfomationValue &&
        orderInfomationValue[currentOrderIndex]
      ) {
        const currentOrderData = orderInfomationValue[currentOrderIndex];

        if (editStep === 1) {
          const productData =
            carts?.map((cartProduct) => {
              const orderProduct = currentOrderData.products?.find(
                (p: any) => p.productId === cartProduct.productId
              );
              const remainingProduct = remainingProducts.find(
                (p: any) => p.productId === cartProduct.productId
              );
              if (orderProduct) {
                return {
                  ...cartProduct,
                  quantity: remainingProduct
                    ? orderProduct.count
                    : orderProduct.quantity,
                  count: remainingProduct
                    ? remainingProduct.count + orderProduct.count
                    : orderProduct.count,
                };
              }

              return {
                ...cartProduct,
                quantity: 0,
              };
            }) || [];
          selectProductsForm.setFieldsValue({
            products: productData,
          });
        } else if (editStep === 3) {
          // Load shipping date form data
          formShippingDate.setFieldsValue({
            deliveryDate: currentOrderData.deliveryDate || null,
            deliveryBy: currentOrderData.deliveryBy || undefined,
            deliveryTime: currentOrderData.deliveryTime || undefined,
          });
        } else if (editStep === 4) {
          // Load PO form data
          formPoFile.setFieldsValue({
            poNumber: currentOrderData.poNumber || '',
            poFiles: currentOrderData.poFiles || [],
            remarkPo: currentOrderData.remarkPo || '',
            isTaxInvoice: currentOrderData.isTaxInvoice || false,
          });
        }
      }
    } else {
      formPoFile.resetFields();
      setCurrentStep(1);
    }
  }, [editStep, currentOrderIndex, orderInfomationValue]);

  useEffect(() => {
    const { products } = selectProductsForm.getFieldsValue();
    const test =
      products?.find((products: any) => products.quantity > 0) || null;
    if (test) return;
    if (currentStep === 1 && remainingProducts.length > 0) {
      selectProductsForm.setFieldsValue({
        products: remainingProducts.map((product) => ({
          ...product,
          quantity: 0,
        })),
      });
    }
  }, [remainingProducts, currentStep, editStep]);

  useEffect(() => {
    if (selectAddressPage === modeSelectAddress.CREATE_ADDRESS) {
      if (addressDataInfinite.length === 0) {
        formAddress.setFieldValue('isDefault', true);
      }
      setInitialValues(null);
    }
  }, [selectAddressPage]);

  useEffect(() => {
    if (addressDefault && currentStep === 2) {
      setSelectedAddress(addressDefault);
    }
  }, [addressDefault, currentStep]);

  useEffect(() => {
    if (isCreate) {
      formShippingDate.setFieldsValue({
        deliveryDate: null,
        deliveryBy: DeliveryBy.AGENT,
        deliveryTime: DeliveryTime.ANYTIME,
      });
    }
  }, [isCreate]);

  useEffect(() => {
    if (mode) {
      setSelectAddressPage(mode);
    }
  }, [mode]);

  useEffect(() => {
    if (selectedAddressId !== null) {
      setAddress();
      setSelectAddressPage(modeSelectAddress.EDIT_ADDRESS);
    } else {
      formAddress.resetFields();
      setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
    }
  }, [selectedAddressId]);

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={() => {
          if (editStep === null && isCreate) {
            confirmDelete({
              title: 'ยืนยันการปิด',
              description:
                'คุณกำลังจะปิดการสร้างรอบจัดส่ง ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก',
              onOk: () => {
                handleClose();
              },
              okText: 'ปิดโดยไม่บันทึก',
            });
          } else {
            handleClose();
          }
        }}
        push={false}
        placement={isMobile ? 'bottom' : 'right'}
        closable={false}
        width={isMobile ? '100%' : 600}
        height={'100%'}
        className="[&_.ant-drawer-body]:!py-3 
      [&_.ant-drawer-body]:!px-6  
      [&_.ant-drawer-header]:!border-b-0 
      [&_.ant-drawer-header]:!p-6"
        title={
          isCreate ? (
            <div className="flex justify-between">
              {selectAddressPage === modeSelectAddress.EDIT_ADDRESS &&
              currentStep === 2 ? (
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => {
                    setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
                    setSelectedAddressId(null);
                    formAddress.resetFields();
                  }}
                >
                  <i className="ri-arrow-left-line !text-text-secondary text-2xl" />
                  <Typography
                    variant="h4"
                    className="!text-text-secondary !font-semibold"
                  >
                    แก้ไขที่อยู่จัดส่ง
                  </Typography>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <Typography
                      variant="h4"
                      className="!text-text-secondary !font-semibold"
                    >
                      สร้างรอบจัดส่ง
                    </Typography>
                    <Label
                      text={`ขั้นตอนที่ ${currentStep}/4`}
                      variant="ghost"
                      rounding="pill"
                    />
                  </div>
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    {renderSubTitleByStep(currentStep)}
                  </Typography>
                </div>
              )}

              <Button
                onClick={() => {
                  confirmDelete({
                    title: 'ยืนยันการปิด',
                    description:
                      'คุณกำลังจะปิดการสร้างรอบจัดส่ง ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก',
                    onOk: () => {
                      handleClose();
                    },
                    okText: 'ปิดโดยไม่บันทึก',
                  });
                }}
                variant="outlined"
                className="absolute !right-0 !px-0"
                color="neutral"
                bold="400"
              >
                <i className="ri-close-line text-xl text-neutral-40"></i>
              </Button>
            </div>
          ) : (
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Typography
                    variant="h4"
                    className="!text-text-secondary !font-semibold"
                  >
                    แก้ไขรอบจัดส่ง
                  </Typography>
                  <Label
                    text={`ครั้งที่ ${(currentOrderIndex || 0) + 1}`}
                    variant="ghost"
                    rounding="pill"
                    color="success"
                  />
                </div>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary"
                >
                  {renderSubTitleByStep(currentStep)}
                </Typography>
              </div>
              <Button
                onClick={() => {
                  handleClose();
                }}
                variant="outlined"
                className="absolute !right-0 !px-0"
                color="neutral"
                bold="400"
              >
                <i className="ri-close-line text-xl text-neutral-40"></i>
              </Button>
            </div>
          )
        }
        afterOpenChange={(open) => {
          if (open) {
            setTimeout(() => {
              const drawerBody = document.querySelector(
                '.ant-drawer-body'
              ) as HTMLDivElement | null;
              if (drawerBody) {
                drawerBody.onscroll = (e) => {
                  const target = e.target as HTMLDivElement;
                  if (
                    target.scrollHeight - target.scrollTop ===
                    target.clientHeight
                  ) {
                    fetchNextPage();
                  }
                };
              }
            }, 100);
          }
        }}
      >
        <Form form={selectProductsForm}>
          <Form.Item name="products" noStyle />
        </Form>
        <Form form={formShippingDate}>
          <Form.Item name="deliveryDate" noStyle />
          <Form.Item name="deliveryBy" noStyle />
          <Form.Item name="deliveryTime" noStyle />
        </Form>
        <Form form={formPoFile}>
          <Form.Item name="poFiles" noStyle />
          <Form.Item name="poNumber" noStyle />
          <Form.Item name="remarkPo" noStyle />
        </Form>
        {renderStepContent}
        {!isCreate ? (
          <div className="fixed bottom-0 p-6 right-0 bg-white z-10 w-full md:w-[600px]">
            {currentStep === 1 && (
              <div className="flex justify-between mb-3">
                <div className="flex items-end gap-2">
                  <Typography
                    variant="paragraph-big"
                    className="!text-text-secondary"
                  >
                    ทั้งหมด
                  </Typography>
                  <Label
                    text={`${selectProductValue?.reduce(
                      (sum: number, p: any) => sum + (Number(p.quantity) || 0),
                      0
                    )} หน่วย`}
                    variant="ghost"
                    rounding="pill"
                  />
                </div>
                <Typography variant="h3" className="!text-icon-brand-dark">
                  ฿
                  {(selectProductValue &&
                    selectProductValue
                      .reduce(
                        (total: number, item: any) =>
                          total + (item.price || 0) * (item.quantity || 0),
                        0
                      )
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })) ||
                    '0.00'}
                </Typography>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outlined" color="neutral" fullWidth>
                ย้อนกลับ
              </Button>
              <Button fullWidth onClick={handleEdit} disabled={isUploading}>
                ตกลง
              </Button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 right-0 p-6 bg-white z-10 w-full md:w-[600px]">
            {currentStep === 1 && (
              <div className="flex justify-between mb-3">
                <div className="flex items-end gap-2">
                  <Typography
                    variant="paragraph-big"
                    className="!text-text-secondary"
                  >
                    ทั้งหมด
                  </Typography>
                  <Label
                    text={`${selectProductValue?.reduce(
                      (sum: number, p: any) => sum + (Number(p.quantity) || 0),
                      0
                    )} หน่วย`}
                    variant="ghost"
                    rounding="pill"
                  />
                </div>
                <Typography variant="h3" className="!text-icon-brand-dark">
                  ฿
                  {(selectProductValue &&
                    selectProductValue
                      .reduce(
                        (total: number, item: any) =>
                          total + (item.price || 0) * (item.quantity || 0),
                        0
                      )
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })) ||
                    '0.00'}
                </Typography>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outlined"
                color="neutral"
                fullWidth
                onClick={handlePrevStep}
              >
                {currentStep === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
              </Button>
              <Button
                fullWidth
                icon={
                  currentStep !== 4 ? (
                    <i className="ri-arrow-right-line"></i>
                  ) : undefined
                }
                iconPosition="end"
                disabled={
                  (currentStep === 1 &&
                    selectProductValue &&
                    selectProductValue.filter((p: any) => p.quantity > 0)
                      .length === 0) ||
                  (currentStep === 2 && !selectedAddress) ||
                  isUploading
                }
                onClick={handleNextStep}
              >
                {currentStep === 4 ? 'ยืนยันการสร้างรอบ' : 'ถัดไป'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
      <MobileConfirmDrawer />
      <PopupComponent />
    </>
  );
};

export default DrawerDeliveryGradully;
