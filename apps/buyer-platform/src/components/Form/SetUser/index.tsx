'use client';

import { idCardCheck, isValidThaiJuristicId } from '@/utils/validate';
import { Divider, Form, FormInstance } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../Button';
import Checkbox from '../../DataEntry/Checkbox';
import RadioGroup from '../../DataEntry/RadioGroup';
import Select from '../../DataEntry/Select';
import TextField from '../../DataEntry/TextField';
import { Label } from '../../Label';
import Typography from '../../Typography';
import CardSelection from '@/components/Card/Selection';
import { OrganizationTypes } from '@/common/enum/organization.enum';
import {
  checkIdCard,
  checkRegisNumber,
} from '@/common/api/customer-service/user.api';
import {
  checkTaxId,
  getJuristicTypeList,
} from '@/common/api/customer-service/organization.api';
import { useQuery } from '@tanstack/react-query';

// juristicType
type juristicType =
  | 'PUBLIC_LIMITED_COMPANY'
  | 'LIMITED_COMPANY'
  | 'LIMITED_PARTNERSHIP'
  | 'GENERAL_PARTNERSHIP'
  | 'OTHER';

type BranchType = 'HEAD_OFFICE' | 'BRANCH';

export interface FormSetUserFields {
  firstName: string;
  lastName: string;
  telNumber: string;
  accountType: OrganizationTypes;
  consent: boolean;

  // PERSONAL
  idCard: string;

  // REGISTERED_INDIVIDUAL
  registrationNumber: string;
  registrationName: string;

  // JURISTIC
  juristicType: juristicType;
  juristicTypeId: number;
  taxId: string;
  juristicName: string;
  remarkTypeOther: string;
  branchType: BranchType;
  branchNumber: string;
  branchName: string;
}

interface FormSetUserProps {
  loading?: boolean;
  setUserForm: FormInstance<FormSetUserFields>;
  onFinish?: (values: FormSetUserFields) => Promise<void>;
  handleSwitchToLogin: () => void;
}

const preventBusinessType = [
  'บริษัทมหาชนจำกัด',
  'บมจ',
  'บริษัทจำกัด',
  'บจก',
  'ห้างหุ้นส่วนจำกัด',
  'หจก',
  'ห้างหุ้นส่วนสามัญ',
  'หสม',
];

const FormSetUser: FC<FormSetUserProps> = ({
  setUserForm,
  loading,
  onFinish: onFinishProp,
  handleSwitchToLogin,
}) => {
  const [isSuccessCheckIdCard, setIsSuccessCheckIdCard] = useState(false);
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(false);
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(false);
  const [errorMessageCheckTaxId, setErrorMessageCheckTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExistTaxId, setIsExistTaxId] = useState(false);

  const accountTypeValue = Form.useWatch('accountType', setUserForm);
  const branchTypeValue = Form.useWatch('branchType', setUserForm);
  const juristicTypeValue = Form.useWatch('juristicType', setUserForm);
  const taxIdValue = Form.useWatch('taxId', setUserForm);
  const branchNumberValue = Form.useWatch('branchNumber', setUserForm);

  const { data: juristicTypeList } = useQuery({
    queryKey: ['juristicTypeList'],
    queryFn: async () => {
      const response = await getJuristicTypeList();
      return response.data;
    },
    enabled: accountTypeValue === OrganizationTypes.JURISTIC,
  });

  const juristicTypeOptions = juristicTypeList
    ?.map((item: any) => ({
      label: item.label,
      value: item.value,
    }))
    .reverse()
    .filter((item: any) => item.value !== 'PERSONAL');

  const prefix = useMemo(() => {
    return juristicTypeList?.find(
      (item: any) => item.value === juristicTypeValue
    )?.prefix;
  }, [juristicTypeValue, juristicTypeList, isSuccessCheckTaxId]);

  const suffix = useMemo(() => {
    return juristicTypeList?.find(
      (item: any) => item.value === juristicTypeValue
    )?.subfix;
  }, [juristicTypeValue, juristicTypeList, isSuccessCheckTaxId]);

  const handleChangeIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setUserForm.setFieldsValue({ idCard: value });
    setIsSuccessCheckIdCard(false);
  };

  const handleChangeRegistrationNumber = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setUserForm.setFieldsValue({ registrationNumber: value });
    setIsSuccessCheckRegistrationNumber(false);
  };

  const handleCheckIdCard = async () => {
    const value = setUserForm.getFieldValue('idCard') || '';
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      setUserForm.setFields([
        {
          name: 'idCard',
          errors: ['เลขประจำตัวประชาชนไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckIdCard(false);
      return;
    }

    if (value.length === 13) {
      try {
        const { data } = await checkIdCard({ idCard: value });
        if (data && data.exists === true) {
          setUserForm.setFields([
            {
              name: 'idCard',
              errors: ['เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว'],
            },
          ]);
          setIsSuccessCheckIdCard(false);
        } else if (data && data.exists === false) {
          setIsSuccessCheckIdCard(true);
        }
      } catch (error) {
        setIsSuccessCheckIdCard(false);
        setUserForm.setFields([
          {
            name: 'idCard',
            errors: [
              'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี',
            ],
          },
        ]);
      }
    } else {
      setUserForm.validateFields(['idCard']);
      setIsSuccessCheckIdCard(false);
    }
  };

  const handleCheckRegistrationNumber = async () => {
    const value = setUserForm.getFieldValue('registrationNumber') || '';
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      setUserForm.setFields([
        {
          name: 'registrationNumber',
          errors: ['เลขทะเบียนพาณิชย์ไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckRegistrationNumber(false);
      return;
    }

    if (value.length === 13) {
      try {
        const { data } = await checkRegisNumber({ registrationNumber: value });
        if (data && data.exists === true) {
          setUserForm.setFields([
            {
              name: 'registrationNumber',
              errors: ['เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว'],
            },
          ]);
          setIsSuccessCheckRegistrationNumber(false);
        } else if (data && data.exists === false) {
          setIsSuccessCheckRegistrationNumber(true);
        }
      } catch (error) {
        setIsSuccessCheckRegistrationNumber(false);
        setUserForm.setFields([
          {
            name: 'registrationNumber',
            errors: [
              'เกิดข้อผิดพลาดในการตรวจสอบเลขทะเบียนพาณิชย์หรือเลขประจำตัวประชาชน',
            ],
          },
        ]);
      }
    } else {
      setUserForm.validateFields(['registrationNumber']);
      setIsSuccessCheckRegistrationNumber(false);
    }
  };

  const handleCheckTaxId = async () => {
    const taxIdValue = setUserForm.getFieldValue('taxId') || '';
    const branchNumber = setUserForm.getFieldValue('branchNumber') || '';
    const isValid = isValidThaiJuristicId(taxIdValue);

    if (!isValid) {
      setUserForm.setFields([
        {
          name: 'taxId',
          errors: ['เลขประจำตัวนิติบุคคลไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckTaxId(false);
      return;
    }

    try {
      await setUserForm.validateFields(['branchNumber']);
    } catch (error) {
      setIsSuccessCheckTaxId(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await checkTaxId({
        taxId: taxIdValue,
        organizeBranchNumber: branchNumber,
      });
      setUserForm.setFieldsValue({
        juristicType: data.juristicType.value,
        juristicTypeId: juristicTypeList.find(
          (juristic: any) => juristic.value === data.juristicType.value
        )?.id,
        juristicName: data.organizeName,
        branchName: data.branchName,
      });
      setIsSuccessCheckTaxId(true);
      setErrorMessageCheckTaxId('');
      setUserForm.validateFields(['juristicName']);
    } catch (error: any) {
      setIsSuccessCheckTaxId(false);
      if (error.response.data.data.exists) {
        setIsExistTaxId(true);
      } else {
        setErrorMessageCheckTaxId(
          'ไม่พบข้อมูลเลขทะเบียนนิติบุคคลนี้ในระบบ DBD กรุณาตรวจสอบอีกครั้ง'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (values: FormSetUserFields) => {
    if (onFinishProp) {
      await onFinishProp(values);
    }
  };

  useEffect(() => {
    if (accountTypeValue === OrganizationTypes.JURISTIC) {
      setUserForm.setFieldsValue({
        branchType: 'HEAD_OFFICE',
        branchNumber: '00000',
      });
    }
    setUserForm.setFieldsValue({
      idCard: '',
      taxId: '',
      registrationNumber: '',
      registrationName: '',
    });
  }, [accountTypeValue]);

  useEffect(() => {
    if (isSuccessCheckTaxId) {
      setIsSuccessCheckTaxId(false);
    }
  }, [branchTypeValue, taxIdValue, branchNumberValue]);

  return (
    <Form
      form={setUserForm}
      className="w-full md:w-[600px] h-full relative"
      layout="vertical"
      onFinish={onFinish}
    >
      <div className="flex justify-between sticky top-0">
        <div>
          <Typography
            variant="h4"
            className="!text-text-primary !text-xl md:!text-2xl"
          >
            ลงทะเบียน
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-tertiary"
          >
            กรุณากรอกข้อมูลเกี่ยวกับคุณ
          </Typography>
        </div>
        <Label
          text="ขั้นตอน 2/2"
          size="small"
          variant="ghost"
          rounding="pill"
        />
      </div>
      <div className="mt-6">
        <div className="max-h-[calc(100vh_-_350px)] md:max-h-[462px] overflow-y-auto mt-6 px-0 md:px-4">
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            คุณต้องการสร้างบัญชีใช้งานบน Allkons ในนาม?
          </Typography>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const accountType = getFieldValue('accountType');
              return (
                <Form.Item name="accountType">
                  <div className="w-full flex flex-col md:flex-row gap-2 mt-2">
                    <CardSelection
                      isSelected={accountType === OrganizationTypes.PERSONAL}
                      icon="ri-user-line"
                      label="บุคคลธรรมดา"
                      onClick={() =>
                        setUserForm.setFieldsValue({
                          accountType: OrganizationTypes.PERSONAL,
                        })
                      }
                    />
                    <CardSelection
                      isSelected={
                        accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
                      }
                      icon="ri-file-list-3-line"
                      label="บุคคลธรรมดาที่จดทะเบียนพาณิชย์"
                      onClick={() =>
                        setUserForm.setFieldsValue({
                          accountType: OrganizationTypes.REGISTERED_INDIVIDUAL,
                        })
                      }
                    />
                    <CardSelection
                      isSelected={accountType === OrganizationTypes.JURISTIC}
                      icon="ri-briefcase-2-line"
                      label="นิติบุคคล"
                      onClick={() =>
                        setUserForm.setFieldsValue({
                          accountType: OrganizationTypes.JURISTIC,
                        })
                      }
                    />
                  </div>
                </Form.Item>
              );
            }}
          </Form.Item>
          <div className="mt-6">
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary !font-medium"
            >
              ข้อมูลส่วนตัว
            </Typography>
            <div className="flex flex-col mt-2 gap-4">
              <TextField
                name="firstName"
                label="ชื่อ"
                placeholder="กรุณากรอกชื่อ"
                rules={[
                  { required: true, message: 'กรุณากรอกชื่อ' },
                  {
                    max: 50,
                    message:
                      'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                  },
                  {
                    pattern: /^[a-zA-Zก-๙\s]+$/,
                    message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                  },
                ]}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\s/g, '');
                }}
              />
              <TextField
                name="lastName"
                label="นามสกุล"
                placeholder="กรุณากรอกนามสกุล"
                rules={[
                  { required: true, message: 'กรุณากรอกนามสกุล' },
                  {
                    max: 50,
                    message:
                      'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                  },
                  {
                    pattern: /^[a-zA-Zก-๙\s]+$/,
                    message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                  },
                ]}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\s/g, '');
                }}
              />
              <TextField
                name="telNumber"
                label="เบอร์โทรศัพท์"
                required
                disabled
              />
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const accountType = getFieldValue(
                    'accountType'
                  ) as OrganizationTypes;
                  if (accountType === OrganizationTypes.PERSONAL) {
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-full">
                          <TextField
                            name="idCard"
                            label={'เลขประจำตัวประชาชน'}
                            placeholder={'กรุณากรอกเลขประจำตัวประชาชน'}
                            onChange={handleChangeIdCard}
                            rules={[
                              {
                                required: true,
                                message: 'กรุณากรอกเลขประจำตัวประชาชน',
                              },
                            ]}
                            maxLength={13}
                            className={`${
                              isSuccessCheckIdCard &&
                              !setUserForm.getFieldError('idCard').length
                                ? 'border !border-primary'
                                : ''
                            } `}
                            suffix={
                              <>
                                {setUserForm.getFieldError('idCard')[0] ===
                                  'เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว' && (
                                  <i className="ri-information-line text-error"></i>
                                )}
                                {isSuccessCheckIdCard &&
                                  !setUserForm.getFieldError('idCard')
                                    .length && (
                                    <i className="ri-check-line text-primary"></i>
                                  )}
                              </>
                            }
                            validateStatus={
                              setUserForm.getFieldError('idCard').length > 0
                                ? 'error'
                                : isSuccessCheckIdCard
                                ? 'success'
                                : ''
                            }
                            help={
                              setUserForm.getFieldError('idCard').length > 0
                                ? setUserForm.getFieldError('idCard')[0]
                                : isSuccessCheckIdCard
                                ? 'สามารถใช้เลขประจำตัวประชาชนได้'
                                : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขประจำตัวประชาชน'
                            }
                          />
                        </div>
                        <div className="mt-2">
                          <Button onClick={handleCheckIdCard}>ตรวจสอบ</Button>
                        </div>
                      </div>
                    );
                  } else if (
                    accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
                  ) {
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-full">
                            <TextField
                              name="registrationNumber"
                              label={'เลขทะเบียนพาณิชย์'}
                              placeholder={'กรุณากรอกเลขทะเบียนพาณิชย์'}
                              onChange={handleChangeRegistrationNumber}
                              rules={[
                                {
                                  required: true,
                                  message: 'กรุณากรอกเลขทะเบียนพาณิชย์',
                                },
                              ]}
                              maxLength={13}
                              className={`${
                                isSuccessCheckRegistrationNumber &&
                                !setUserForm.getFieldError('registrationNumber')
                                  .length
                                  ? 'border !border-primary'
                                  : ''
                              } `}
                              suffix={
                                <>
                                  {setUserForm.getFieldError(
                                    'registrationNumber'
                                  )[0] ===
                                    'เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว' && (
                                    <i className="ri-information-line text-error"></i>
                                  )}
                                  {isSuccessCheckRegistrationNumber &&
                                    !setUserForm.getFieldError(
                                      'registrationNumber'
                                    ).length && (
                                      <i className="ri-check-line text-primary"></i>
                                    )}
                                </>
                              }
                              validateStatus={
                                setUserForm.getFieldError('registrationNumber')
                                  .length > 0
                                  ? 'error'
                                  : isSuccessCheckRegistrationNumber
                                  ? 'success'
                                  : ''
                              }
                              help={
                                setUserForm.getFieldError('registrationNumber')
                                  .length > 0
                                  ? setUserForm.getFieldError(
                                      'registrationNumber'
                                    )[0]
                                  : isSuccessCheckRegistrationNumber
                                  ? 'สามารถใช้เลขทะเบียนพาณิชย์ได้'
                                  : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขทะเบียนพาณิชย์'
                              }
                            />
                          </div>
                          <div className="mt-2">
                            <Button onClick={handleCheckRegistrationNumber}>
                              ตรวจสอบ
                            </Button>
                          </div>
                        </div>
                        <TextField
                          name="registrationName"
                          label="ชื่อที่ใช้ในการประกอบพาณิชยกิจ"
                          placeholder="กรอกชื่อร้าน"
                          addonBefore="ร้าน"
                          rules={[
                            {
                              required: true,
                              message:
                                'กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ',
                            },
                          ]}
                        />
                      </div>
                    );
                  } else if (accountType === OrganizationTypes.JURISTIC) {
                    return (
                      <div className="flex flex-col gap-4">
                        <Typography
                          variant="paragraph-medium"
                          className="!text-text-secondary !font-medium"
                        >
                          ข้อมูลส่วนตัว
                        </Typography>
                        <div className="flex flex-col gap-4 p-4 border border-border-primary rounded-xl">
                          <TextField
                            name="taxId"
                            label={'เลขประจำตัวนิติบุคคล'}
                            placeholder={'กรุณากรอกเลขประจำตัวนิติบุคคล'}
                            rules={[
                              {
                                required: true,
                                message: 'กรุณากรอกเลขประจำตัวนิติบุคคล',
                              },
                              () => ({
                                validator(_: unknown, value: string) {
                                  if (!value) return Promise.resolve();

                                  if (!isValidThaiJuristicId(value)) {
                                    return Promise.reject(
                                      'เลขประจำตัวนิติบุคคลไม่ถูกต้อง'
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                            maxLength={13}
                          />
                          <RadioGroup
                            label="สำนักงาน"
                            name="branchType"
                            options={[
                              {
                                label: 'สำนักงานใหญ่',
                                value: 'HEAD_OFFICE',
                              },
                              {
                                label: 'สาขา',
                                value: 'BRANCH',
                              },
                            ]}
                            onChange={(e) => {
                              if (e.target.value === 'HEAD_OFFICE') {
                                setUserForm.setFieldsValue({
                                  branchNumber: '00000',
                                });
                              } else {
                                setUserForm.setFieldsValue({
                                  branchNumber: '',
                                });
                              }
                            }}
                          />
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const branchType = getFieldValue('branchType');
                              return (
                                <div className="flex flex-col gap-4">
                                  <TextField
                                    name="branchNumber"
                                    label="เลขที่สาขา"
                                    placeholder="กรุณากรอกเลขที่สาขา"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'กรุณากรอกเลขที่สาขา',
                                      },
                                      {
                                        pattern: /^[0-9]+$/,
                                        message: 'กรุณากรอกตัวเลขเท่านั้น',
                                      },
                                      {
                                        max: 5,
                                        message:
                                          'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (10 ตัวอักษร)',
                                      },
                                      {
                                        validator: (
                                          _: unknown,
                                          value: string
                                        ) => {
                                          if (
                                            value === '00000' &&
                                            branchType === 'BRANCH'
                                          ) {
                                            return Promise.reject(
                                              'เลขที่สาขาต้องไม่ซ้ำกับสำนักงานใหญ่'
                                            );
                                          }
                                          return Promise.resolve();
                                        },
                                      },
                                    ]}
                                    disabled={branchType === 'HEAD_OFFICE'}
                                    onInput={(e) => {
                                      const target =
                                        e.target as HTMLInputElement;
                                      target.value = target.value.replace(
                                        /[^0-9]/g,
                                        ''
                                      );
                                      if (target.value.startsWith(' ')) {
                                        target.value = target.value.trimStart();
                                      }
                                    }}
                                  />
                                </div>
                              );
                            }}
                          </Form.Item>
                          <Button
                            icon={<i className="ri-search-line" />}
                            bold="600"
                            onClick={handleCheckTaxId}
                            disabled={
                              (branchNumberValue === '00000' &&
                                branchTypeValue === 'BRANCH') ||
                              taxIdValue === ''
                            }
                            loading={isLoading}
                          >
                            ตรวจสอบ
                          </Button>
                          {errorMessageCheckTaxId && !isSuccessCheckTaxId && (
                            <Typography
                              variant="paragraph-small"
                              className="!text-error"
                            >
                              {errorMessageCheckTaxId}
                            </Typography>
                          )}
                          {isExistTaxId && !isSuccessCheckTaxId && (
                            <div className="flex justify-between items-center p-4 bg-background-secondary rounded-xl">
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-tertiary"
                              >
                                มีบัญชีสำหรับนิติบุคคลและสาขานี้อยู่แล้ว
                              </Typography>
                              <Button onClick={handleSwitchToLogin}>
                                เข้าสู่ระบบ
                              </Button>
                            </div>
                          )}
                          <Divider className="!my-0" />
                          {isSuccessCheckTaxId && (
                            <>
                              <Select
                                name="juristicType"
                                label="ประเภทนิติบุคคล"
                                options={juristicTypeOptions}
                                placeholder="กรุณาเลือกประเภทนิติบุคคล"
                                getPopupContainer={(triggerNode) =>
                                  triggerNode.parentElement || document.body
                                }
                                rules={[
                                  {
                                    required: true,
                                    message: 'กรุณาเลือกประเภทนิติบุคคล',
                                  },
                                ]}
                                onChange={(value) => {
                                  const juristicTypeId = juristicTypeList.find(
                                    (juristic: any) => juristic.value === value
                                  )?.id;
                                  setUserForm.setFieldsValue({
                                    juristicTypeId: juristicTypeId,
                                  });
                                }}
                              />
                              <Form.Item name="juristicTypeId" noStyle />
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const juristicType =
                                    getFieldValue('juristicType');
                                  if (juristicType === 'OTHER') {
                                    return (
                                      <div>
                                        <TextField
                                          name="remarkTypeOther"
                                          label="ประเภทนิติบุคคล"
                                          placeholder="กรุณากรอกประเภทนิติบุคคล"
                                          rules={[
                                            {
                                              required: true,
                                              message:
                                                'กรุณากรอกประเภทนิติบุคคล',
                                            },
                                            {
                                              pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                                              message:
                                                'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                                            },
                                            {
                                              max: 50,
                                              message:
                                                'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                                            },
                                            {
                                              validator: (
                                                _: unknown,
                                                value: string
                                              ) => {
                                                if (
                                                  value &&
                                                  value.trim() === ''
                                                ) {
                                                  return Promise.reject(
                                                    'กรุณากรอกประเภทนิติบุคคล'
                                                  );
                                                }
                                                if (
                                                  preventBusinessType.some(
                                                    (type) =>
                                                      value.includes(type)
                                                  )
                                                ) {
                                                  return Promise.reject(
                                                    'ไม่อนุญาตให้กรอกประเภทนิติบุคคลที่ระบุไว้'
                                                  );
                                                }
                                                return Promise.resolve();
                                              },
                                            },
                                          ]}
                                          onInput={(e) => {
                                            const target =
                                              e.target as HTMLInputElement;
                                            if (target.value.startsWith(' ')) {
                                              target.value =
                                                target.value.trimStart();
                                            }
                                          }}
                                        />
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              </Form.Item>
                              <div className="flex flex-col gap-4 p-4 border border-border-primary rounded-xl">
                                <TextField
                                  name="juristicName"
                                  label="ชื่อองค์กร"
                                  placeholder="กรุณากรอกชื่อองค์กร"
                                  addonBefore={prefix}
                                  addonAfter={suffix}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'กรุณากรอกชื่อองค์กร',
                                    },
                                    {
                                      pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                                      message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
                                    },
                                    {
                                      max: 50,
                                      message:
                                        'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                                    },
                                    {
                                      validator: (
                                        _: unknown,
                                        value: string
                                      ) => {
                                        if (value && value.trim() === '') {
                                          return Promise.reject(
                                            'กรุณากรอกชื่อองค์กร'
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                  onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.startsWith(' ')) {
                                      target.value = target.value.trimStart();
                                    }
                                  }}
                                />
                                <TextField
                                  name="branchName"
                                  label="ชื่อสาขา"
                                  placeholder="กรุณากรอกชื่อสาขา"
                                  disabled={branchTypeValue === 'HEAD_OFFICE'}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'กรุณากรอกชื่อสาขา',
                                    },
                                    {
                                      max: 100,
                                      message:
                                        'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)',
                                    },
                                  ]}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                }}
              </Form.Item>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center">
              <Checkbox
                name="consent"
                label="ยินยอมการรับข่าวสาร"
                size="small"
              />
              <span
                className="text-primary underline pt-[1px] cursor-pointer"
                onClick={() => window.open('/privacy#marketing', '_blank')}
              >
                นโยบายทางการตลาด
              </span>
            </div>
            <div className="mt-4 text-center">
              <Typography
                variant="paragraph-small"
                className="!text-text-quinary"
              >
                เมื่อกด "ยอมรับและลงทะเบียน" เป็นการยอมรับ
              </Typography>
              <Typography
                variant="paragraph-small"
                className="!text-text-quinary"
              >
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  เงื่อนไขการให้บริการ
                </span>{' '}
                และ{' '}
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() => window.open('/privacy#privacy', '_blank')}
                >
                  นโยบายความเป็นส่วนตัว
                </span>
              </Typography>
            </div>
          </div>
        </div>
      </div>
      {/* submit button */}
      <div className="absolute bottom-0 w-full">
        <Form.Item className="!mb-0">
          <Form.Item shouldUpdate noStyle>
            {({ getFieldsError, getFieldValue }) => {
              const hasErrors = getFieldsError().some(
                ({ errors }) => errors.length
              );
              let requiredFields: (keyof FormSetUserFields)[] = [
                'firstName',
                'lastName',
                'accountType',
              ];
              const accountType = getFieldValue('accountType');

              // Add required fields based on account type
              if (accountType === OrganizationTypes.PERSONAL) {
                requiredFields.push('idCard');
              } else if (
                accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
              ) {
                requiredFields.push('registrationNumber', 'registrationName');
              } else if (accountType === OrganizationTypes.JURISTIC) {
                requiredFields.push(
                  'taxId',
                  'branchType',
                  'branchNumber',
                  'juristicType',
                  'juristicName',
                  'branchName'
                );
                const juristicType = getFieldValue('juristicType');
                if (juristicType === 'OTHER') {
                  requiredFields.push('remarkTypeOther');
                }
              }

              const hasEmptyFields = requiredFields.some(
                (field) => !getFieldValue(field)
              );

              return (
                <Button
                  htmlType="submit"
                  fullWidth
                  disabled={
                    hasErrors ||
                    hasEmptyFields ||
                    (accountType === OrganizationTypes.PERSONAL &&
                      !isSuccessCheckIdCard) ||
                    (accountType === OrganizationTypes.REGISTERED_INDIVIDUAL &&
                      !isSuccessCheckRegistrationNumber) ||
                    (accountType === OrganizationTypes.JURISTIC &&
                      !isSuccessCheckTaxId)
                  }
                  loading={loading}
                  bold="600"
                >
                  ยอมรับและลงทะเบียน
                </Button>
              );
            }}
          </Form.Item>
        </Form.Item>
      </div>
    </Form>
  );
};

export default FormSetUser;
