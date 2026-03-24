import { getLocations } from '@/common/api/customer-service/location.api';
import Button from '@/components/Button';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import Select from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import Typography from '@/components/Typography';
import { useQuery } from '@tanstack/react-query';
import { AutoComplete, Form, FormInstance, Grid } from 'antd';
import { useEffect, useState } from 'react';

interface FormDraftAddressInfoProps {
  visible: boolean;
  onClose: () => void;
  form: FormInstance;
  onFinish: (values: any) => void;
  isInPopup?: boolean;
  onSaveDraft?: () => void;
  isLoadingSaveDraft?: boolean;
}
const countryOptions = [{ label: 'ประเทศไทย', value: '1' }];

const FormDraftAddressInfo = ({
  visible,
  onClose,
  form,
  onFinish: onFinishProps,
  isInPopup = true,
  onSaveDraft,
  isLoadingSaveDraft = false,
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

  const { data: registeredAddressAutocomplete } = useQuery({
    queryKey: ['registeredAddressAutocomplete', searchRegisteredAddressText],
    queryFn: async () => {
      if (!searchRegisteredAddressText) return [];
      const response = await getLocations(searchRegisteredAddressText);
      return response;
    },
    enabled: visible,
  });

  const { data: currentAddressAutocomplete } = useQuery({
    queryKey: ['currentAddressAutocomplete', searchCurrentAddressText],
    queryFn: async () => {
      if (!searchCurrentAddressText) return [];
      const response = await getLocations(searchCurrentAddressText);
      return response;
    },
    enabled: visible,
  });

  const { data: taxAddressAutocomplete } = useQuery({
    queryKey: ['taxAddressAutocomplete', searchTaxAddressText],
    queryFn: async () => {
      if (!searchTaxAddressText) return [];
      const response = await getLocations(searchTaxAddressText);
      return response;
    },
    enabled: visible,
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

  useEffect(() => {
    if (form && visible) {
      const formValues = form.getFieldsValue();
      const registeredAddressData = formValues.registeredAddress;
      const currentAddressData = formValues.currentAddress;
      const taxAddressData = formValues.taxAddress;

      if (
        registeredAddressData &&
        (registeredAddressData.provinceId || registeredAddressData.provinceName)
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
          zipcodeId: registeredAddressData?.zipcodeId,
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
          zipcodeId: currentAddressData?.zipcodeId,
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
          zipcodeId: taxAddressData?.zipcodeId,
          zipcodeName: taxAddressData?.zipcodeName,
        });
      } else {
        setSearchTaxAddressText('');
        setTaxAddress(null);
      }
    }
  }, [form, visible]);

  return (
    <Form
      layout="vertical"
      className="relative"
      form={form}
      scrollToFirstError
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{
        taxAddress: {
          usedAddress: '',
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
                paddingBottom: '70px',
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
                if (searchRegisteredAddressText && !registeredAddress) {
                  setErrorRegisteredAddress(true);
                } else {
                  setSearchRegisteredAddressText(
                    `${registeredAddress?.subDistrictName || ''} ${
                      registeredAddress?.districtName || ''
                    } ${registeredAddress?.provinceName || ''} ${
                      registeredAddress?.zipcodeName || ''
                    }`
                  );
                  setErrorRegisteredAddress(false);
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
                setSearchRegisteredAddressText(
                  `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`
                );
                setRegisteredAddress(addressValue);
                setErrorRegisteredAddress(false);
              }}
              options={registeredAddressOptions}
            />
          </Form.Item>
          <TextField
            name={['registeredAddress', 'address']}
            label="เลขที่"
            placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
            required
            rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
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
                  form.setFieldValue(['currentAddress', 'countryId'], '');
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
                    if (searchCurrentAddressText && !currentAddress) {
                      setErrorCurrentAddress(true);
                    } else {
                      setSearchCurrentAddressText(
                        `${currentAddress?.subDistrictName || ''} ${
                          currentAddress?.districtName || ''
                        } ${currentAddress?.provinceName || ''} ${
                          currentAddress?.zipcodeName || ''
                        }`
                      );
                      setErrorCurrentAddress(false);
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
                    setSearchCurrentAddressText(
                      `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`
                    );
                    setCurrentAddress(addressValue);
                    setErrorCurrentAddress(false);
                  }}
                  options={currentAddressOptions}
                />
              </Form.Item>
              <TextField
                name={['currentAddress', 'address']}
                label="เลขที่"
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                required
                rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
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
                form.setFieldValue(['taxAddress', 'countryId'], '');
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
                    if (searchTaxAddressText && !taxAddress) {
                      setErrorTaxAddress(true);
                    } else {
                      setSearchTaxAddressText(
                        `${taxAddress?.subDistrictName || ''} ${
                          taxAddress?.districtName || ''
                        } ${taxAddress?.provinceName || ''} ${
                          taxAddress?.zipcodeName || ''
                        }`
                      );
                      setErrorTaxAddress(false);
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
                    setSearchTaxAddressText(
                      `${option.subdistrict} ${option.district} ${option.province} ${option.zip_code}`
                    );
                    setTaxAddress(addressValue);
                    setErrorTaxAddress(false);
                  }}
                  options={taxAddressOptions}
                />
              </Form.Item>
              <TextField
                name={['taxAddress', 'address']}
                label="เลขที่"
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                required
                rules={[{ required: true, message: 'กรุณากรอกเลขที่' }]}
              />
            </>
          )}
        </div>
      </div>
      {isInPopup ? (
        <Form.Item noStyle>
          <div className="fixed md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex justify-end bg-white py-4 pr-4 md:pr-0">
            <Button htmlType="submit" bold="600" loading={isLoadingSaveDraft}>
              บันทึกข้อมูล
            </Button>
          </div>
        </Form.Item>
      ) : (
        <div className="fixed bottom-0 w-full inset-x-0 py-4 bg-white shadow-xl">
          <div className="w-full container mx-auto flex flex-col-reverse md:flex-row px-4 justify-end gap-2">
            <Button
              variant="outlined"
              bold="600"
              onClick={() => {
                if (onSaveDraft) {
                  onSaveDraft();
                }
              }}
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
    </Form>
  );
};

export default FormDraftAddressInfo;
