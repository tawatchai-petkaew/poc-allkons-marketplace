import {
  createProject,
  CreateProjectRequest,
  deleteProject,
  getMyProjects,
} from '@/common/api/customer-service/project.api';
import { AddressType } from '@/common/enum/address.enum';
import Button from '@/components/Button';
import ProductVariantButton from '@/components/Button/ProductVariant';
import TextField from '@/components/DataEntry/TextField';
import Typography from '@/components/Typography';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AutoComplete,
  AutoCompleteProps,
  Divider,
  Form,
  FormInstance,
  Input,
  Select,
  Spin,
} from 'antd';
import { FC, useState } from 'react';
import { useEffect } from 'react';
import { useGlobalStore } from '@/store/global.store';
import './custom.css';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import { useSelectAddressStore } from '@/store/select-address.store';
import { getLocations } from '@/common/api/customer-service/location.api';
import { LoadingOutlined } from '@ant-design/icons';
import useConfirmModal from '@/hooks/useConfirmModal';
export interface IAddressForm {
  contactName: string; // field ชื่อผู้รับ
  contactPhoneNumber: string; // field หมายเลขโทรศัพท์ผู้ติดต่อ
  country: number;
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  zipcodeId: number;
  countryName: string;
  provinceName: string;
  districtName: string;
  subDistrictName: string;
  zipcodeName: string;
  projectId: number[]; // field รหัสโครงการ
  addressType: AddressType; //  enum address type
  addressName: string; // field ชื่อที่อยู่
  addressInfo: string; // field รายละเอียดที่อยู่
  remark: string; // field หมายเหตุ
  latitude: string;
  longitude: string;
  isDefault: boolean; // field ใช้เป็นที่อยู่ตั้งต้น
}

type FormAddressProps = {
  form: FormInstance<IAddressForm>;
  onFinish: (values: IAddressForm) => void;
  initialValues?: IAddressForm | null;
  onDeleteAddress?: () => void;
  handleCancel?: () => void;
  loading?: boolean;
  disabledIsDefault?: boolean;
};

const FormAddress: FC<FormAddressProps> = ({
  form,
  onFinish: onFinishProps,
  initialValues,
  onDeleteAddress,
  loading = false,
  handleCancel,
  disabledIsDefault = false,
}) => {
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [addressOptions, setAddressOptions] = useState<any[]>([]);
  const [name, setName] = useState<string>('');
  const [searchAddressText, setSearchAddressText] = useState<string>('');
  const [address, setAddress] = useState<any>(null);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const [selectedDeleteProjectId, setSelectedDeleteProjectId] = useState<
    number | null
  >(null);
  const [errorAddress, setErrorAddress] = useState<boolean>(false);

  const { profile } = useGlobalStore();
  const { selectedAddressId } = useSelectAddressStore();
  const { confirmDelete, MobileConfirmDrawer } = useConfirmModal();
  const isDefault = Form.useWatch('isDefault', form);

  const { data: projects, refetch } = useQuery({
    queryKey: ['getMyProjects', name],
    queryFn: async () => {
      const response = await getMyProjects({ name });
      return response;
    },
  });

  const { data: addressAutocomplete } = useQuery({
    queryKey: ['addressAutocomplete', searchAddressText],
    queryFn: async () => {
      if (!searchAddressText) return [];
      const response = await getLocations(searchAddressText);
      return response;
    },
  });

  const { mutate } = useMutation({
    mutationKey: ['createProject'],
    mutationFn: async (data: CreateProjectRequest) => {
      const response = await createProject(data);
      if (response) {
        form.setFieldsValue({
          projectId: [response.id],
        });
        refetch();
      }
    },
    onSuccess: () => {},
    onError: (error) => {
      form.setFieldsValue({
        projectId: [],
      });
      refetch();
    },
  });

  const { mutate: deleteProjectById } = useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (id: number) => {
      await deleteProject(id);
      const selectedProjectId = form.getFieldValue('projectId') || [];
      if (id === selectedProjectId[0]) {
        form.setFieldsValue({
          projectId: [],
        });
      }
      refetch();
    },
  });

  const getPanelValue = (searchText: string) =>
    !searchText
      ? []
      : [
          {
            value: `${searchText} (New Label)`,
            label: `${searchText} (New Label)`,
          },
        ];

  const onSelect = (val: string | number) => {
    if (typeof val === 'number') return;
    if (val.includes(' (New Label)')) {
      const labelWithoutNewLabel = val.replace(' (New Label)', '');
      if (profile) {
        mutate({
          name: labelWithoutNewLabel,
          userId: profile.id,
          organizeId: 4,
        });
        setName('');
      }
    }
  };

  const checkFormChanged = () => {
    if (selectedAddressId) {
      const currentValues = {
        ...form.getFieldsValue(),
        provinceId: initialValues?.provinceId || null,
        districtId: initialValues?.districtId || null,
        subDistrictId: initialValues?.subDistrictId || null,
        zipcodeId: initialValues?.zipcodeId || null,
        provinceName: initialValues?.provinceName || '',
        districtName: initialValues?.districtName || '',
        subDistrictName: initialValues?.subDistrictName || '',
        zipcodeName: initialValues?.zipcodeName || '',
      };
      const initialValuesTest = {
        addressInfo: initialValues?.addressInfo || '',
        addressName: initialValues?.addressName || '',
        addressType: initialValues?.addressType || AddressType.SHIPPING_ADDRESS,
        contactName: initialValues?.contactName || '',
        contactPhoneNumber: initialValues?.contactPhoneNumber || '',
        isDefault: initialValues?.isDefault || false,
        projectId: initialValues?.projectId || [],
        remark: initialValues?.remark || null,
        provinceId: address?.provinceId || null,
        districtId: address?.districtId || null,
        subDistrictId: address?.subDistrictId || null,
        zipcodeId: address?.zipcodeId || null,
        provinceName: address?.provinceName || '',
        districtName: address?.districtName || '',
        subDistrictName: address?.subDistrictName || '',
        zipcodeName: address?.zipcodeName || '',
      };
      const isEqual =
        currentValues.addressInfo === initialValuesTest.addressInfo &&
        currentValues.addressName === initialValuesTest.addressName &&
        currentValues.addressType === initialValuesTest.addressType &&
        currentValues.contactName === initialValuesTest.contactName &&
        currentValues.contactPhoneNumber ===
          initialValuesTest.contactPhoneNumber &&
        currentValues.isDefault === initialValuesTest.isDefault &&
        currentValues.projectId.length === initialValuesTest.projectId.length &&
        currentValues.remark === initialValuesTest.remark &&
        currentValues.provinceId === initialValuesTest.provinceId &&
        currentValues.districtId === initialValuesTest.districtId &&
        currentValues.subDistrictId === initialValuesTest.subDistrictId &&
        currentValues.zipcodeId === initialValuesTest.zipcodeId &&
        currentValues.provinceName === initialValuesTest.provinceName &&
        currentValues.districtName === initialValuesTest.districtName &&
        currentValues.subDistrictName === initialValuesTest.subDistrictName &&
        currentValues.zipcodeName === initialValuesTest.zipcodeName;
      setIsFormChanged(!isEqual);
    }
  };

  const handleDeleteProject = async () => {
    if (selectedDeleteProjectId) {
      await deleteProjectById(selectedDeleteProjectId);
      setSelectedDeleteProjectId(null);
      refetch();
    }
  };

  const onFinish = (values: IAddressForm) => {
    if (!address) {
      setErrorAddress(true);
      return;
    }
    const payload = {
      ...values,
      ...address,
      country: 1,
      countryName: 'ประเทศไทย',
      addressName: values.addressName || '',
    };

    onFinishProps(payload);
  };

  useEffect(() => {
    if (selectedAddressId) {
      checkFormChanged();
    }
  }, [address]);

  useEffect(() => {
    if (initialValues && selectedAddressId) {
      setSearchAddressText(
        `${initialValues?.subDistrictName || ''} ${
          initialValues?.districtName || ''
        } ${initialValues?.provinceName || ''} ${
          initialValues?.zipcodeName || ''
        }`
      );
      setAddress({
        provinceId: initialValues.provinceId,
        provinceName: initialValues.provinceName,
        districtId: initialValues.districtId,
        districtName: initialValues.districtName,
        subDistrictId: initialValues.subDistrictId,
        subDistrictName: initialValues.subDistrictName,
        zipcodeId: initialValues.zipcodeId,
        zipcodeName: initialValues.zipcodeName,
      });
    } else {
      setSearchAddressText('');
      setAddress(null);
    }
  }, [initialValues, form, selectedAddressId]);

  useEffect(() => {
    const projectValues =
      projects?.map((project) => ({
        value: project.id,
        label: project.name,
      })) || [];
    const panelOptions = getPanelValue(name) || [];
    setOptions([...panelOptions, ...projectValues]);
  }, [projects, name]);

  useEffect(() => {
    const addressOptions =
      addressAutocomplete?.map((location: any) => ({
        value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        ...location,
      })) || [];

    setAddressOptions(addressOptions);
  }, [addressAutocomplete]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin indicator={<LoadingOutlined spin size={100} />} size="large" />
        </div>
      ) : (
        <>
          <Form
            initialValues={{
              addressType: AddressType.SHIPPING_ADDRESS,
            }}
            layout="vertical"
            form={form}
            className="grid grid-cols-2 gap-4 relative !pb-[72px]"
            onFinish={onFinish}
            onValuesChange={() => {
              checkFormChanged();
            }}
            onFinishFailed={() => {
              if (!address) {
                setErrorAddress(true);
                return;
              }
            }}
          >
            <div className="col-span-2 md:col-span-1">
              <TextField
                name="contactName"
                label="ชื่อผู้รับ"
                placeholder="กรอกชื่อ-นามสกุล"
                required
                rules={[
                  { required: true, message: 'กรุณากรอกชื่อผู้รับ' },
                  {
                    max: 50,
                    message:
                      'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                  },
                ]}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <TextField
                name="contactPhoneNumber"
                label="หมายเลขโทรศัพท์ผู้ติดต่อ"
                placeholder="กรอกหมายเลขโทรศัพท์"
                maxLength={10}
                required
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกเบอร์โทรศัพท์',
                  },
                  {
                    pattern: /^0[689]\d{8}$/,
                    message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                  },
                ]}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, ''); // Allow only numeric input
                }}
              />
            </div>
            <Form.Item
              className="col-span-2 !mb-0"
              label={
                <div className="flex gap-1 items-center">
                  <Typography
                    variant="paragraph-medium"
                    className="!text-text-secondary"
                  >
                    ที่อยู่
                  </Typography>
                  <span className="text-primary">*</span>
                </div>
              }
              help={
                errorAddress ? (
                  <>
                    {searchAddressText ? (
                      <div className="text-error">
                        กรุณาเลือกที่อยู่ให้ถูกต้อง
                      </div>
                    ) : (
                      <div className="text-error">กรณากรอกที่อยู่</div>
                    )}
                  </>
                ) : (
                  ''
                )
              }
            >
              <AutoComplete
                className="w-full"
                size="large"
                placeholder="ค้นหาจังหวัด, อำเภอ/เขต, แขวง/ตำบล, รหัสไปรษณีย์"
                allowClear
                value={searchAddressText}
                status={errorAddress ? 'error' : ''}
                onSearch={(text) => {
                  setSearchAddressText(text);
                }}
                onClear={() => {
                  setSearchAddressText('');
                  setAddress(null);
                }}
                onBlur={() => {
                  if (searchAddressText && !address) {
                    setErrorAddress(true);
                  } else {
                    setSearchAddressText(
                      `${address?.subDistrictName || ''} ${
                        address?.districtName || ''
                      } ${address?.provinceName || ''} ${
                        address?.zipcodeName || ''
                      }`
                    );
                    setErrorAddress(false);
                  }
                }}
                onSelect={(_, option) => {
                  const addressValue = {
                    provinceId: option.province_id,
                    provinceName: option.province,
                    districtId: option.district_id,
                    districtName: option.district,
                    subDistrictId: option.subdistrict_id,
                    subDistrictName: option.subdistrict,
                    zipcodeId: option.zip_code_id
                      ? Number(option.zip_code_id)
                      : null,
                    zipcodeName: option.zip_code,
                  };
                  setSearchAddressText(
                    `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`
                  );
                  setAddress(addressValue);
                  setErrorAddress(false);
                }}
                options={addressOptions}
              />
            </Form.Item>
            <div className="col-span-2">
              <TextField
                name="addressInfo"
                label="เลขที่"
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                required
                rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
              />
            </div>
            <div className="col-span-2 mt-4">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary !font-medium"
              >
                ข้อมูลเพิ่มเติม
              </Typography>
              <Divider className="!my-3" />
            </div>
            <div className="col-span-2">
              <TextField
                name="addressName"
                label="ชื่อที่อยู่"
                placeholder="กรอกชื่อที่อยู่ (โครงการ, แลนด์มาร์ค, ไซต์งาน)"
              />
            </div>
            <Form.Item
              className="col-span-2 !mb-0"
              name="projectId"
              label={
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary"
                >
                  โครงการ
                </Typography>
              }
            >
              <Select
                mode="multiple"
                options={options}
                showSearch
                filterOption={false}
                onSearch={(text) => {
                  setName(text);
                }}
                onSelect={(val) => {
                  onSelect(val);
                }}
                onBlur={() => {
                  setName('');
                }}
                classNames={{
                  popup: {
                    root: 'custom-select-project-dropdown',
                  },
                }}
                maxCount={1}
                placeholder="เลือกโครงการ"
                size="large"
                optionRender={(option) => {
                  return (
                    <div className="flex justify-between items-center">
                      <div>{option.data.label}</div>
                      {typeof option.data.value === 'string' &&
                      option.data.value.includes(' (New Label)') ? null : (
                        <Button
                          variant="link"
                          onClick={(e) => {
                            if (e) {
                              e.stopPropagation();
                              setSelectedDeleteProjectId(
                                option.data.value as number
                              );
                              confirmDelete({
                                title: 'คุณต้องการลบหรือไม่?',
                                description:
                                  'หากคุณลบ คุณจะไม่สามารถเลือกโครงการสำหรับการจัดส่งได้',
                                onOk: () => {
                                  handleDeleteProject();
                                },
                                okText: 'ลบโครงการ',
                              });
                            }
                          }}
                          fitContent
                          disabled={
                            form.getFieldValue(['projectId', 0]) ===
                            option.data.value
                          }
                          icon={
                            <i
                              className={`ri-delete-bin-2-line ${
                                form.getFieldValue(['projectId', 0]) ===
                                option.data.value
                                  ? 'text-text-disabled'
                                  : 'text-error'
                              }`}
                            ></i>
                          }
                          className="!mr-2"
                        />
                      )}
                    </div>
                  );
                }}
              />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue, setFieldsValue }) => {
                const addressType = getFieldValue('addressType');
                return (
                  <Form.Item
                    name="addressType"
                    label={
                      <Typography
                        variant="paragraph-medium"
                        className="!text-text-secondary"
                      >
                        ประเภทที่อยู่
                      </Typography>
                    }
                    className="col-span-2 !mb-0"
                  >
                    <div className="w-full flex gap-2">
                      <ProductVariantButton
                        isActive={addressType === AddressType.SHIPPING_ADDRESS}
                        onClick={() => {
                          setFieldsValue({
                            addressType: AddressType.SHIPPING_ADDRESS,
                          });
                        }}
                      >
                        ที่อยู่จัดส่งสินค้า
                      </ProductVariantButton>
                      <ProductVariantButton
                        isActive={addressType === AddressType.WORK_SITE_ADDRESS}
                        onClick={() => {
                          setFieldsValue({
                            addressType: AddressType.WORK_SITE_ADDRESS,
                          });
                        }}
                      >
                        ไซต์งาน
                      </ProductVariantButton>
                    </div>
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item
              className="col-span-2 !mb-0"
              name="remark"
              label={
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary"
                >
                  หมายเหตุ
                </Typography>
              }
            >
              <Input.TextArea
                className="!text-base"
                rows={4}
                placeholder="รายละเอียด"
              />
            </Form.Item>
            <Form.Item className="col-span-2 " name="isDefault">
              <ToggleSwitch
                type="text"
                isChecked={isDefault}
                showLabel={false}
                isDisabled={disabledIsDefault}
                title="ใช้เป็นที่อยู่ตั้งต้น"
                onChange={(checked) => {
                  form.setFieldsValue({ isDefault: checked });
                }}
              />
            </Form.Item>
            <div className="fixed bottom-0 right-0 p-6 bg-white z-20 w-full md:w-[600px]">
              {selectedAddressId ? (
                <div className="flex gap-3">
                  <Button
                    variant="outlined"
                    color="neutral"
                    fullWidth
                    disabled={isDefault}
                    onClick={() => {
                      if (onDeleteAddress) {
                        onDeleteAddress();
                      }
                    }}
                  >
                    ลบ
                  </Button>
                  <Button
                    fullWidth
                    htmlType="submit"
                    disabled={!isFormChanged && selectedAddressId !== null}
                  >
                    บันทึก
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="outlined"
                    color="neutral"
                    fullWidth
                    onClick={() => {
                      if (handleCancel) {
                        handleCancel();
                      }
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button fullWidth htmlType="submit">
                    ยืนยัน
                  </Button>
                </div>
              )}
            </div>
          </Form>
          <MobileConfirmDrawer />
        </>
      )}
    </>
  );
};

export default FormAddress;
