import { FC, useEffect, useState } from 'react';
import { Divider, Drawer, Form, Grid, Skeleton } from 'antd';
import Typography from '../../Typography';
import Button from '../../Button';
import CardSelection from '../../Card/Selection';
import CardSelectionAddress from '@/components/Card/Selection/Address';
import FormAddress, { IAddressForm } from '@/components/Form/Address';
import { AddressType } from '@/common/enum/address.enum';
import {
  createAddress,
  getAddressById,
  updateAddress,
  deleteAddressById,
  getAdresses,
} from '@/common/api/customer-service/address.api';
import { useGlobalStore } from '@/store/global.store';
import {
  modeSelectAddress,
  useSelectAddressStore,
} from '@/store/select-address.store';
import { FormInstance } from 'antd/lib';
import { useNotification } from '@/hooks/notification.hook';
import { AxiosError } from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import useConfirmModal from '@/hooks/useConfirmModal';
import { IDeliveryForm } from '@/app/checkout/components/FormDelivery/FormDelivery';
import usePopup from '@/hooks/usePopup';

export interface IAddress {
  addressInfo: string;
  addressName: string;
  addressType: AddressType | string;
  cisNumber: string;
  contactName: string;
  contactPhoneNumber: string;
  countryId: number;
  countryName: string;
  createdAt: string;
  deletedAt: string | null;
  districtId: number;
  districtName: string;
  id: number;
  isDefault: boolean;
  latitude: string;
  longitude: string;
  organizeId: number;
  projectId: number;
  provinceId: number;
  provinceName: string;
  remark: string;
  status: string;
  subDistrictId: number;
  subDistrictName: string;
  updatedAt: string;
  userId: number;
  zipcodeId: number;
  zipcodeName: string;
  projectName?: string;
}

type DrawerSelectAddressProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: any) => void;
  selectedAddress?: IAddress | null;
  setSelectedAddress?: (address: IAddress | null) => void;
  formShipping?: FormInstance<IDeliveryForm>;
  currentOrderIndex?: number | null;
};

type SelectAddressProps = {
  selectAddressPage: modeSelectAddress;
  setSelectAddressPage: (page: modeSelectAddress) => void;
  addressData: IAddress[];
  selectedAddress: IAddress | null;
  onSelectAddress: (address: any) => void;
  formAddress: FormInstance<IAddressForm>;
  initialValues: IAddressForm | null;
  loading: boolean;
  onFinish: (values: IAddressForm) => Promise<void>;
  handleCancel: () => void;
  onDeleteAddress: () => void;
  isFetchingNextPage?: boolean;
  className?: string;
};

type SelectAddressContentProps = {
  addressData?: IAddress[];
  onSelectAddress?: (address: any) => void;
  selectedAddress?: IAddress | null;
  isFetchingNextPage?: boolean;
};

export const SelectAddress: FC<SelectAddressProps> = ({
  selectAddressPage,
  setSelectAddressPage,
  addressData,
  selectedAddress,
  onSelectAddress,
  formAddress,
  initialValues,
  loading,
  onFinish,
  handleCancel,
  onDeleteAddress,
  className = '',
  isFetchingNextPage,
}) => {
  return (
    <>
      {selectAddressPage !== modeSelectAddress.EDIT_ADDRESS && (
        <div className="w-full flex gap-2">
          <CardSelection
            isSelected={selectAddressPage === 'select-address'}
            icon="ri-map-pin-line"
            label="เลือกที่อยู่"
            onClick={() =>
              setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS)
            }
          />
          <CardSelection
            isSelected={selectAddressPage === 'create-address'}
            icon="ri-map-pin-add-line"
            label="เพิ่มที่อยู่ใหม่"
            onClick={() => {
              setSelectAddressPage(modeSelectAddress.CREATE_ADDRESS);
            }}
          />
        </div>
      )}
      {selectAddressPage === modeSelectAddress.SELECT_ADDRESS ? (
        <div className="mt-8">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary !font-medium"
          >
            ที่อยู่จัดส่งของคุณ
          </Typography>
          <Divider className="!my-3" />
          {addressData.length === 0 ? (
            <div
              className="w-full mt-2 border border-dashed border-border-brand-lighter bg-white hover:bg-primary-hover rounded-2xl flex justify-center py-[30px]"
              onClick={() => {
                setSelectAddressPage(modeSelectAddress.CREATE_ADDRESS);
              }}
            >
              <Button variant="link" icon={<i className="ri-add-fill" />}>
                เพิ่มที่อยู่ใหม่
              </Button>
            </div>
          ) : (
            <div className={className}>
              <SelectAddressContent
                addressData={addressData}
                selectedAddress={selectedAddress}
                onSelectAddress={onSelectAddress}
                isFetchingNextPage={isFetchingNextPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${
            selectAddressPage === modeSelectAddress.EDIT_ADDRESS
              ? 'mt-0'
              : 'mt-8'
          }`}
        >
          {selectAddressPage === modeSelectAddress.CREATE_ADDRESS && (
            <>
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !font-medium"
              >
                กรอกข้อมูลที่อยู่ใหม่
              </Typography>
              <Divider className="!my-3" />
            </>
          )}
          <FormAddress
            form={formAddress}
            onFinish={onFinish}
            initialValues={initialValues}
            loading={loading}
            disabledIsDefault={
              addressData.length < 1 ||
              (selectAddressPage === modeSelectAddress.EDIT_ADDRESS &&
                addressData.length === 1)
            }
            onDeleteAddress={onDeleteAddress}
            handleCancel={handleCancel}
          />
        </div>
      )}
    </>
  );
};

const SelectAddressContent: FC<SelectAddressContentProps> = ({
  addressData = [],
  onSelectAddress,
  selectedAddress,
  isFetchingNextPage = false,
}) => {
  const { setSelectedAddressId } = useSelectAddressStore();
  return (
    <div className="flex flex-col gap-4">
      {addressData?.map((address) => (
        <CardSelectionAddress
          key={address.id}
          isSelected={address.id === selectedAddress?.id}
          address={address}
          vertical
          onClick={() => {
            onSelectAddress?.(address);
          }}
          onEditing={() => {
            setSelectedAddressId(address.id);
          }}
        />
      ))}
      {isFetchingNextPage && (
        <Skeleton.Node
          className="!w-full !rounded-2xl !h-[122px]"
          active={true}
        />
      )}
    </div>
  );
};

const DrawerSelectAddress: FC<DrawerSelectAddressProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddress = null,
  formShipping,
  currentOrderIndex,
  setSelectedAddress,
}) => {
  const [selectAddressPage, setSelectAddressPage] = useState<modeSelectAddress>(
    modeSelectAddress.SELECT_ADDRESS
  );
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const [formAddress] = Form.useForm<IAddressForm>();
  const [initialValues, setInitialValues] = useState<IAddressForm | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const { profile } = useGlobalStore();
  const { selectedAddressId, setSelectedAddressId, mode } =
    useSelectAddressStore();
  const { notification } = useNotification();
  const { confirmDelete, MobileConfirmDrawer } = useConfirmModal();
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
            if (
              setSelectedAddress &&
              selectedAddress &&
              response.id === selectedAddress.id
            ) {
              onSelectAddress?.(response);
              setSelectedAddress(response);
            }
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
      if (currentOrderIndex && currentOrderIndex !== null) {
        const formValue = formShipping?.getFieldValue([
          'orderInfomation',
          currentOrderIndex,
          'address',
        ]);
        if (formValue && formValue.id === selectedAddressId) {
          formShipping?.setFieldValue(
            ['orderInfomation', currentOrderIndex, 'address'],
            null
          );
        }
      }
    } catch (error) {
      const errorStatusCode = (error as AxiosError).response?.status || 500;
      showPopup('error', {
        statusCode: errorStatusCode,
      });
    }
  };

  useEffect(() => {
    if (selectedAddressId !== null) {
      setAddress();
      setSelectAddressPage(modeSelectAddress.EDIT_ADDRESS);
    } else {
      formAddress.resetFields();
      setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
    }
  }, [selectedAddressId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAddressId(null);
      formAddress.resetFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode) {
      setSelectAddressPage(mode);
    }
  }, [mode]);

  useEffect(() => {
    if (selectAddressPage === modeSelectAddress.CREATE_ADDRESS) {
      if (addressDataInfinite.length === 0) {
        formAddress.setFieldValue('isDefault', true);
      }
      setInitialValues(null);
    }
  }, [selectAddressPage]);

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={onClose}
        placement={isMobile ? 'bottom' : 'right'}
        closable={false}
        width={isMobile ? '100%' : 600}
        height={'100%'}
        className="[&_.ant-drawer-body]:!py-3 
      [&_.ant-drawer-body]:!px-6  
      [&_.ant-drawer-header]:!border-b-0 
      [&_.ant-drawer-header]:!p-6"
        title={
          <div className="flex justify-between">
            {selectAddressPage !== 'edit-address' ? (
              <div>
                <Typography
                  variant="h4"
                  className="!text-text-secondary !font-semibold"
                >
                  ที่อยู่จัดส่ง
                </Typography>
              </div>
            ) : (
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
            )}

            <Button
              onClick={onClose}
              variant="outlined"
              className="absolute !right-0 !px-0"
              color="neutral"
              bold="400"
            >
              <i className="ri-close-line text-xl text-neutral-40"></i>
            </Button>
          </div>
        }
        afterOpenChange={(open) => {
          if (open) {
            // Attach scroll event after drawer opens
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
        <SelectAddress
          initialValues={initialValues}
          onFinish={onFinish}
          selectAddressPage={selectAddressPage}
          setSelectAddressPage={setSelectAddressPage}
          addressData={addressDataInfinite}
          selectedAddress={selectedAddress}
          formAddress={formAddress}
          loading={loading}
          onSelectAddress={onSelectAddress ?? (() => {})}
          handleCancel={() => {
            setSelectAddressPage(modeSelectAddress.SELECT_ADDRESS);
            setSelectedAddressId(null);
            formAddress.resetFields();
          }}
          isFetchingNextPage={isFetchingNextPage}
          onDeleteAddress={() => {
            confirmDelete({
              title: 'คุณต้องการลบที่อยู่นี้หรือไม่',
              description:
                'หากคุณลบที่อยู่นี้ คุณจะไม่สามารถเลือกที่อยู่นี้สำหรับการจัดส่งได้',
              onOk: () => {
                deleteAddress();
              },
              okText: 'ลบที่อยู่',
            });
          }}
        />
      </Drawer>
      <MobileConfirmDrawer />

      <PopupComponent />
    </>
  );
};

export default DrawerSelectAddress;
