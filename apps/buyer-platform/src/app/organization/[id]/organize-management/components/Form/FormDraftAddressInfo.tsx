// Re-export from Verify folder to avoid duplication
import { getLocations } from '@/common/api/customer-service/location.api';
import Button from '@/components/Button';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import Select from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import Typography from '@/components/Typography';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { AutoComplete, Form, FormInstance, Grid, Spin } from 'antd';
import { useEffect, useState } from 'react';

interface FormDraftAddressInfoProps {
  onClose: () => void;
  form: FormInstance;
  onFinish: (values: any) => void;
  isInPopup?: boolean;
  onSaveDraft?: (payload: any) => void;
  isLoadingSaveDraft?: boolean;
  currentStep?: number;
  onBack?: () => void;
}
const countryOptions = [{ label: 'ประเทศไทย', value: '1' }];

const FormDraftAddressInfo = ({
  onClose,
  form,
  onFinish: onFinishProps,
  isInPopup = true,
  onSaveDraft,
  isLoadingSaveDraft = false,
  currentStep = 3,
  onBack,
}: FormDraftAddressInfoProps) => {
  // Registered Address State
  const [searchRegisteredAddressText, setSearchRegisteredAddressText] =
    useState<string>('');
  const [registeredAddress, setRegisteredAddress] = useState<any>(null);
  const [errorRegisteredAddress, setErrorRegisteredAddress] =
    useState<boolean>(false);
  const [registeredAddressOptions, setRegisteredAddressOptions] = useState<
    any[]
  >([]);

  // Current Address State
  const [searchCurrentAddressText, setSearchCurrentAddressText] =
    useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<any>(null);
  const [errorCurrentAddress, setErrorCurrentAddress] =
    useState<boolean>(false);
  const [currentAddressOptions, setCurrentAddressOptions] = useState<any[]>([]);

  // Tax Address State
  const [searchTaxAddressText, setSearchTaxAddressText] = useState<string>('');
  const [taxAddress, setTaxAddress] = useState<any>(null);
  const [errorTaxAddress, setErrorTaxAddress] = useState<boolean>(false);
  const [taxAddressOptions, setTaxAddressOptions] = useState<any[]>([]);

  const debouncedRegisteredAddressText = useDebounce(
    searchRegisteredAddressText
  );
  const debouncedCurrentAddressText = useDebounce(searchCurrentAddressText);
  const debouncedTaxAddressText = useDebounce(searchTaxAddressText);

  const {
    data: registeredAddressAutocomplete,
    isFetching: isFetchingRegistered,
  } = useQuery({
    queryKey: ['registeredAddressAutocomplete', debouncedRegisteredAddressText],
    queryFn: async () => {
      if (!debouncedRegisteredAddressText) return [];
      const response = await getLocations(debouncedRegisteredAddressText);
      return response;
    },
    enabled: !!debouncedRegisteredAddressText,
  });

  const { data: currentAddressAutocomplete, isFetching: isFetchingCurrent } =
    useQuery({
      queryKey: ['currentAddressAutocomplete', debouncedCurrentAddressText],
      queryFn: async () => {
        if (!debouncedCurrentAddressText) return [];
        const response = await getLocations(debouncedCurrentAddressText);
        return response;
      },
      enabled: !!debouncedCurrentAddressText,
    });

  const { data: taxAddressAutocomplete, isFetching: isFetchingTax } = useQuery({
    queryKey: ['taxAddressAutocomplete', debouncedTaxAddressText],
    queryFn: async () => {
      if (!debouncedTaxAddressText) return [];
      const response = await getLocations(debouncedTaxAddressText);
      return response;
    },
    enabled: !!debouncedTaxAddressText,
  });

  const currentAddressIsSameRegisteredAddressValue = Form.useWatch(
    ['currentAddress', 'isSameRegisteredAddress'],
    form
  );
  const taxAddressUsedAddressValue = Form.useWatch(
    ['taxAddress', 'usedAddress'],
    form
  );

  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  useEffect(() => {
    const registeredOptions =
      registeredAddressAutocomplete?.map((location: any) => ({
        value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        ...location,
      })) || [];

    setRegisteredAddressOptions(registeredOptions);
  }, [registeredAddressAutocomplete]);

  useEffect(() => {
    const currentOptions =
      currentAddressAutocomplete?.map((location: any) => ({
        value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        ...location,
      })) || [];

    setCurrentAddressOptions(currentOptions);
  }, [currentAddressAutocomplete]);

  useEffect(() => {
    const taxOptions =
      taxAddressAutocomplete?.map((location: any) => ({
        value: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        label: `${location.subdistrict} ${location.district} ${location.province} ${location.zip_code}`,
        ...location,
      })) || [];

    setTaxAddressOptions(taxOptions);
  }, [taxAddressAutocomplete]);

  const onFinish = (values: any) => {
    if (!registeredAddress) {
      setErrorRegisteredAddress(true);
      return;
    }
    if (!currentAddress && !values.currentAddress?.isSameRegisteredAddress) {
      setErrorCurrentAddress(true);
      return;
    }
    if (!taxAddress && !values.taxAddress?.usedAddress) {
      setErrorTaxAddress(true);
      return;
    }
    const payload = {
      registeredAddress: {
        ...values.registeredAddress,
        ...registeredAddress,
      },
      taxAddress: {
        ...values.taxAddress,
        ...taxAddress,
      },
      currentAddress: {
        ...values.currentAddress,
        ...currentAddress,
      },
    };
    onFinishProps(payload);
  };
  const onFinishFailed = () => {
    if (!registeredAddress) {
      setErrorRegisteredAddress(true);
    }
    if (!currentAddress) {
      setErrorCurrentAddress(true);
    }
    if (!taxAddress) {
      setErrorTaxAddress(true);
    }
  };

  const handleSelectAddress = (
    option: any,
    type: 'registered' | 'current' | 'tax'
  ) => {
    const addressValue = {
      provinceId: option.province_id,
      provinceName: option.province,
      districtId: option.district_id,
      districtName: option.district,
      subDistrictId: option.subdistrict_id,
      subDistrictName: option.subdistrict,
      zipCode: option.zip_code_id ? Number(option.zip_code_id) : null,
      zipcodeName: option.zip_code,
    };

    const addressText = `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`;

    switch (type) {
      case 'registered':
        setSearchRegisteredAddressText(addressText);
        setRegisteredAddress(addressValue);
        setErrorRegisteredAddress(false);
        break;
      case 'current':
        setSearchCurrentAddressText(addressText);
        setCurrentAddress(addressValue);
        setErrorCurrentAddress(false);
        break;
      case 'tax':
        setSearchTaxAddressText(addressText);
        setTaxAddress(addressValue);
        setErrorTaxAddress(false);
        break;
    }
  };

  const handleBlurAddress = (type: 'registered' | 'current' | 'tax') => {
    switch (type) {
      case 'registered':
        if (searchRegisteredAddressText && !registeredAddress) {
          setErrorRegisteredAddress(true);
        } else {
          setSearchRegisteredAddressText(
            registeredAddress
              ? `${registeredAddress?.subDistrictName || ''} ${
                  registeredAddress?.districtName || ''
                } ${registeredAddress?.provinceName || ''} ${
                  registeredAddress?.zipcodeName || ''
                }`
              : ''
          );
          setErrorRegisteredAddress(false);
        }
        break;
      case 'current':
        if (searchCurrentAddressText && !currentAddress) {
          setErrorCurrentAddress(true);
        } else {
          setSearchCurrentAddressText(
            currentAddress
              ? `${currentAddress?.subDistrictName || ''} ${
                  currentAddress?.districtName || ''
                } ${currentAddress?.provinceName || ''} ${
                  currentAddress?.zipcodeName || ''
                }`
              : ''
          );
          setErrorCurrentAddress(false);
        }
        break;
      case 'tax':
        if (searchTaxAddressText && !taxAddress) {
          setErrorTaxAddress(true);
        } else {
          setSearchTaxAddressText(
            taxAddress
              ? `${taxAddress?.subDistrictName || ''} ${
                  taxAddress?.districtName || ''
                } ${taxAddress?.provinceName || ''} ${
                  taxAddress?.zipcodeName || ''
                }`
              : ''
          );
          setErrorTaxAddress(false);
        }
        break;
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const values = form.getFieldsValue();
      const payload = {
        registeredAddress: {
          ...values.registeredAddress,
          ...registeredAddress,
        },
        taxAddress: {
          ...values.taxAddress,
          ...taxAddress,
        },
        currentAddress: {
          ...values.currentAddress,
          ...currentAddress,
        },
      };
      onSaveDraft(payload);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form) {
        const formValues = form.getFieldsValue();
        const registeredAddressData = formValues.registeredAddress;
        const currentAddressData = formValues.currentAddress;
        const taxAddressData = formValues.taxAddress;

        if (
          registeredAddressData &&
          (registeredAddressData.provinceId ||
            registeredAddressData.provinceName)
        ) {
          setSearchRegisteredAddressText(
            `${registeredAddressData?.subDistrictName || ''} ${
              registeredAddressData?.districtName || ''
            } ${registeredAddressData?.provinceName || ''} ${
              registeredAddressData?.zipcodeName || ''
            }`.trim()
          );
          setRegisteredAddress({
            provinceId: registeredAddressData?.provinceId,
            provinceName: registeredAddressData?.provinceName,
            districtId: registeredAddressData?.districtId,
            districtName: registeredAddressData?.districtName,
            subDistrictId: registeredAddressData?.subDistrictId,
            subDistrictName: registeredAddressData?.subDistrictName,
            zipCode: registeredAddressData?.zipCode,
            zipcodeName: registeredAddressData?.zipcodeName,
          });
        } else {
          setSearchRegisteredAddressText('');
          setRegisteredAddress(null);
        }

        if (
          currentAddressData &&
          (currentAddressData.provinceId || currentAddressData.provinceName)
        ) {
          setSearchCurrentAddressText(
            `${currentAddressData?.subDistrictName || ''} ${
              currentAddressData?.districtName || ''
            } ${currentAddressData?.provinceName || ''} ${
              currentAddressData?.zipcodeName || ''
            }`.trim()
          );
          setCurrentAddress({
            provinceId: currentAddressData?.provinceId,
            provinceName: currentAddressData?.provinceName,
            districtId: currentAddressData?.districtId,
            districtName: currentAddressData?.districtName,
            subDistrictId: currentAddressData?.subDistrictId,
            subDistrictName: currentAddressData?.subDistrictName,
            zipCode: currentAddressData?.zipCode,
            zipcodeName: currentAddressData?.zipcodeName,
          });
        } else {
          setSearchCurrentAddressText('');
          setCurrentAddress(null);
        }

        if (
          taxAddressData &&
          (taxAddressData.provinceId || taxAddressData.provinceName)
        ) {
          setSearchTaxAddressText(
            `${taxAddressData?.subDistrictName || ''} ${
              taxAddressData?.districtName || ''
            } ${taxAddressData?.provinceName || ''} ${
              taxAddressData?.zipcodeName || ''
            }`.trim()
          );
          setTaxAddress({
            provinceId: taxAddressData?.provinceId,
            provinceName: taxAddressData?.provinceName,
            districtId: taxAddressData?.districtId,
            districtName: taxAddressData?.districtName,
            subDistrictId: taxAddressData?.subDistrictId,
            subDistrictName: taxAddressData?.subDistrictName,
            zipCode: taxAddressData?.zipCode,
            zipcodeName: taxAddressData?.zipcodeName,
          });
        } else {
          setSearchTaxAddressText('');
          setTaxAddress(null);
        }
      }
    }, 100); // Small delay to allow for data refetch

    return () => clearTimeout(timer);
  }, [form, currentStep]);

  return (
    <Form
      layout="vertical"
      className="relative"
      form={form}
      scrollToFirstError
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{
        registeredAddress: {
          countryId: '1',
        },
        currentAddress: {
          countryId: '1',
        },
        taxAddress: {
          usedAddress: '',
          countryId: '1',
        },
      }}
    >
      <Form.Item noStyle name={['registeredAddress']} />
      <Form.Item noStyle name={['currentAddress']} />
      <Form.Item noStyle name={['taxAddress']} />
      {isInPopup && (
        <div className="flex md:hidden justify-end">
          <Button
            onClick={onClose}
            variant="outlined"
            className="!px-0"
            color="neutral"
            bold="400"
            icon={<i className="ri-close-line text-xl text-neutral-40"></i>}
          />
        </div>
      )}
      <div
        style={
          isInPopup
            ? {
                marginTop: isMobile ? '0' : '24px',
                maxHeight: isMobile ? 'auto' : '564px',
                overflowY: isMobile ? 'visible' : 'auto',
                paddingBottom: '70px',
              }
            : {
                paddingBottom: '110px',
              }
        }
      >
        <div>
          <Typography variant="paragraph-big" className="!text-text-primary">
            ขั้นตอนที่ 3 : ข้อมูลที่อยู่
          </Typography>
        </div>
        {/* registeredAddress */}
        <div className="mt-4 p-4 border border-border-primary rounded-xl flex flex-col gap-5">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ที่อยู่ตามหนังสือรับรอง / ตามบัตรประชาชน
          </Typography>
          <div className="w-1/2">
            <Select
              label="ประเทศ"
              name={['registeredAddress', 'countryId']}
              placeholder="เลือกประเทศ"
              options={countryOptions}
              required
              rules={[{ required: true, message: 'กรุณาเลือกประเทศ' }]}
            />
          </div>
          <Form.Item
            className="col-span-2 !mb-0"
            label={
              <div className="flex gap-1 items-center">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-secondary"
                >
                  ที่อยู่
                </Typography>
                <span className="text-primary">*</span>
              </div>
            }
            help={
              errorRegisteredAddress ? (
                <>
                  {searchRegisteredAddressText ? (
                    <div className="text-error">
                      กรุณาเลือกที่อยู่ให้ถูกต้อง
                    </div>
                  ) : (
                    <div className="text-error">กรุณากรอกที่อยู่</div>
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
              value={searchRegisteredAddressText}
              status={errorRegisteredAddress ? 'error' : ''}
              onSearch={(text) => {
                setSearchRegisteredAddressText(text);
              }}
              onClear={() => {
                setSearchRegisteredAddressText('');
                setRegisteredAddress(null);
              }}
              onBlur={() => {
                handleBlurAddress('registered');
              }}
              onSelect={(_, option) => {
                handleSelectAddress(option, 'registered');
              }}
              options={registeredAddressOptions}
              notFoundContent={
                isFetchingRegistered ||
                (searchRegisteredAddressText && isFetchingRegistered) ? (
                  <div className="flex justify-center items-center py-4">
                    <Spin size="small" />
                  </div>
                ) : searchRegisteredAddressText &&
                  registeredAddressOptions.length === 0 ? (
                  <div className="text-center py-4 text-text-disabled">
                    ไม่พบที่อยู่ที่ค้นหา
                  </div>
                ) : null
              }
            />
          </Form.Item>
          <TextField
            name={['registeredAddress', 'address']}
            label="เลขที่"
            placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
            required
            rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
            maxLength={255}
          />
        </div>
        {/* currentAddress */}
        <div className="mt-4 p-4 border border-border-primary rounded-xl flex flex-col gap-5">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ที่อยู่ปัจจุบัน
          </Typography>
          <Form.Item
            name={['currentAddress', 'isSameRegisteredAddress']}
            className="!m-0 !pl-1"
          >
            <ToggleSwitch
              type="text"
              isChecked={currentAddressIsSameRegisteredAddressValue}
              showLabel={false}
              title="ใช้ที่อยู่เดียวกับหนังสือรับรอง/ตามบัตรประชาชน"
              onChange={(checked) => {
                form.setFieldValue(
                  ['currentAddress', 'isSameRegisteredAddress'],
                  checked
                );
                if (!checked) {
                  form.setFieldValue(['currentAddress', 'countryId'], '1');
                  form.setFieldValue(['currentAddress', 'address'], '');
                  setCurrentAddress(null);
                  setSearchCurrentAddressText('');
                }
              }}
            />
          </Form.Item>
          {!currentAddressIsSameRegisteredAddressValue && (
            <>
              <div className="w-1/2">
                <Select
                  label="ประเทศ"
                  name={['currentAddress', 'countryId']}
                  placeholder="เลือกประเทศ"
                  options={countryOptions}
                  required
                  rules={[{ required: true, message: 'กรุณาเลือกประเทศ' }]}
                />
              </div>
              <Form.Item
                className="col-span-2 !mb-0"
                label={
                  <div className="flex gap-1 items-center">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-secondary"
                    >
                      ที่อยู่
                    </Typography>
                    <span className="text-primary">*</span>
                  </div>
                }
                help={
                  errorCurrentAddress ? (
                    <>
                      {searchCurrentAddressText ? (
                        <div className="text-error">
                          กรุณาเลือกที่อยู่ให้ถูกต้อง
                        </div>
                      ) : (
                        <div className="text-error">กรุณากรอกที่อยู่</div>
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
                  value={searchCurrentAddressText}
                  status={errorCurrentAddress ? 'error' : ''}
                  onSearch={(text) => {
                    setSearchCurrentAddressText(text);
                  }}
                  onClear={() => {
                    setSearchCurrentAddressText('');
                    setCurrentAddress(null);
                  }}
                  onBlur={() => {
                    handleBlurAddress('current');
                  }}
                  onSelect={(_, option) => {
                    handleSelectAddress(option, 'current');
                  }}
                  options={currentAddressOptions}
                  notFoundContent={
                    isFetchingCurrent ||
                    (searchCurrentAddressText && isFetchingCurrent) ? (
                      <div className="flex justify-center items-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : searchCurrentAddressText &&
                      currentAddressOptions.length === 0 ? (
                      <div className="text-center py-4 text-text-disabled">
                        ไม่พบที่อยู่ที่ค้นหา
                      </div>
                    ) : null
                  }
                />
              </Form.Item>
              <TextField
                name={['currentAddress', 'address']}
                label="เลขที่"
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                required
                rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
                maxLength={255}
              />
            </>
          )}
        </div>
        {/* taxAddress */}
        <div className="mt-4 p-4 border border-border-primary rounded-xl flex flex-col gap-5">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ที่อยู่สำหรับการออกใบกำกับภาษี
          </Typography>
          <RadioGroup
            name={['taxAddress', 'usedAddress']}
            options={[
              {
                label: 'ใส่ที่อยู่ใหม่',
                value: '',
              },
              {
                label: 'ใช้ที่อยู่เดียวกับหนังสือรับรอง/ตามบัตรประชาชน',
                value: 'ID_CARD',
              },
              {
                label: 'ใช้ที่อยู่เดียวกับที่อยู่ปัจจุบัน',
                value: 'CURRENT_ADDRESS',
              },
            ]}
            onChange={(e) => {
              if (!e.target.value) {
                form.setFieldValue(['taxAddress', 'countryId'], '1');
                form.setFieldValue(['taxAddress', 'address'], '');
                setTaxAddress(null);
                setSearchTaxAddressText('');
              }
            }}
          />
          {!taxAddressUsedAddressValue && (
            <>
              <div className="w-1/2">
                <Select
                  label="ประเทศ"
                  name={['taxAddress', 'countryId']}
                  placeholder="เลือกประเทศ"
                  options={countryOptions}
                  required
                  rules={[{ required: true, message: 'กรุณาเลือกประเทศ' }]}
                />
              </div>
              <Form.Item
                className="col-span-2 !mb-0"
                label={
                  <div className="flex gap-1 items-center">
                    <Typography
                      variant="paragraph-small"
                      className="!text-text-secondary"
                    >
                      ที่อยู่
                    </Typography>
                    <span className="text-primary">*</span>
                  </div>
                }
                help={
                  errorTaxAddress ? (
                    <>
                      {searchTaxAddressText ? (
                        <div className="text-error">
                          กรุณาเลือกที่อยู่ให้ถูกต้อง
                        </div>
                      ) : (
                        <div className="text-error">กรุณากรอกที่อยู่</div>
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
                  value={searchTaxAddressText}
                  status={errorTaxAddress ? 'error' : ''}
                  onSearch={(text) => {
                    setSearchTaxAddressText(text);
                  }}
                  onClear={() => {
                    setSearchTaxAddressText('');
                    setTaxAddress(null);
                  }}
                  onBlur={() => {
                    handleBlurAddress('tax');
                  }}
                  onSelect={(_, option) => {
                    handleSelectAddress(option, 'tax');
                  }}
                  options={taxAddressOptions}
                  notFoundContent={
                    isFetchingTax || (searchTaxAddressText && isFetchingTax) ? (
                      <div className="flex justify-center items-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : searchTaxAddressText &&
                      taxAddressOptions.length === 0 ? (
                      <div className="text-center py-4 text-text-disabled">
                        ไม่พบที่อยู่ที่ค้นหา
                      </div>
                    ) : null
                  }
                />
              </Form.Item>
              <TextField
                name={['taxAddress', 'address']}
                label="เลขที่"
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                required
                rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
                maxLength={255}
              />
            </>
          )}
        </div>
      </div>
      {isInPopup ? (
        <Form.Item noStyle>
          <div className="fixed z-10 md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex justify-end bg-white py-4 pr-4 md:pr-0">
            <Button htmlType="submit" bold="600" loading={isLoadingSaveDraft}>
              บันทึกข้อมูล
            </Button>
          </div>
        </Form.Item>
      ) : (
        <div className="fixed z-10 bottom-0 w-full inset-x-0 py-4 bg-white shadow-xl">
          {isMobile ? (
            <div className="w-full container flex flex-col gap-2 justify-between mx-auto">
              <div className="px-4">
                <Form.Item shouldUpdate noStyle>
                  <Button
                    htmlType="submit"
                    bold="600"
                    loading={isLoadingSaveDraft}
                    fullWidth={isMobile}
                  >
                    ขั้นตอนต่อไป
                  </Button>
                </Form.Item>
              </div>
              <div className="flex px-4 gap-2">
                <Button
                  variant="outlined"
                  bold="600"
                  color="neutral"
                  onClick={() => {
                    if (onBack) {
                      onBack();
                    }
                  }}
                  fullWidth
                >
                  ย้อนกลับ
                </Button>
                <Button
                  variant="outlined"
                  bold="600"
                  onClick={() => handleSaveDraft()}
                  loading={isLoadingSaveDraft}
                  fullWidth
                >
                  บันทึกร่าง
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full container flex gap-2 justify-between mx-auto">
              <div className="w-full px-4 md:px-0">
                <Button
                  variant="outlined"
                  bold="600"
                  color="neutral"
                  onClick={() => {
                    if (onBack) {
                      onBack();
                    }
                  }}
                  fullWidth={isMobile}
                >
                  ย้อนกลับ
                </Button>
              </div>
              <div className="flex px-4 justify-end gap-2">
                <Button
                  variant="outlined"
                  bold="600"
                  onClick={() => handleSaveDraft()}
                  loading={isLoadingSaveDraft}
                >
                  บันทึกแบบร่าง
                </Button>
                <Form.Item shouldUpdate noStyle>
                  {() => {
                    return (
                      <Button
                        htmlType="submit"
                        bold="600"
                        loading={isLoadingSaveDraft}
                      >
                        ขั้นตอนต่อไป
                      </Button>
                    );
                  }}
                </Form.Item>
              </div>
            </div>
          )}
        </div>
      )}
    </Form>
  );
};

export default FormDraftAddressInfo;
