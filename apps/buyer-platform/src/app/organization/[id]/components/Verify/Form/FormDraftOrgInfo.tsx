'use client';

import { Form, Divider, Checkbox, Grid } from 'antd';
import { FormInstance } from 'antd';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { Label } from '@/components/Label';
import TextField from '@/components/DataEntry/TextField';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import Select from '@/components/DataEntry/Select';
import { idCardCheck, isValidThaiJuristicId } from '@/utils/validate';
import {
  checkTaxId,
  getJuristicTypeList,
} from '@/common/api/customer-service/organization.api';
import {
  KycOrganizationStatus,
  OrganizationTypes,
} from '@/common/enum/organization.enum';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import {
  checkIdCard,
  checkRegisNumber,
} from '@/common/api/customer-service/user.api';
import useConfirmModal from '@/hooks/useConfirmModal';

const CheckboxGroup = Checkbox.Group;

interface FormDraftOrgInfoProps {
  visible: boolean;
  onClose: () => void;
  form: FormInstance;
  onFinish?: (values: any) => void;
  isInPopup?: boolean;
  onSaveDraft?: () => void;
  isLoadingSaveDraft?: boolean;
  orgInfoData?: any;
  kycStatus: KycOrganizationStatus;
}

const optionBusinessType = [
  {
    label: 'ร้านค้าตัวแทนจําหน่าย (AGENT)',
    value: 'AGENT',
  },
  {
    label: 'ร้านค้าขนาดใหญ่ (BIGBOX)',
    value: 'BIXBOX',
  },
  {
    label: 'ห้าง Modern trade (MDT)',
    value: 'MDT',
  },
  {
    label: 'ขาย Online (ONL) / SP นักขายอิสระ (SP)',
    value: 'ONL',
  },
  {
    label: 'ร้านค้าตัวแทนจำหน่าย (FAC)',
    value: 'FAC',
  },
];

const FormDraftOrgInfo = ({
  visible,
  onClose,
  form,
  onFinish: onFinishProp,
  isInPopup = true,
  onSaveDraft,
  isLoadingSaveDraft = false,
  orgInfoData,
  kycStatus = KycOrganizationStatus.NONE,
}: FormDraftOrgInfoProps) => {
  const [isSuccessCheckIdCard, setIsSuccessCheckIdCard] = useState(true);
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(true);
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(true);
  const [errorMessageCheckTaxId, setErrorMessageCheckTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const accountTypeValue = Form.useWatch('accountType', form);
  const branchTypeValue = Form.useWatch('branchType', form);
  const juristicTypeValue = Form.useWatch('juristicType', form);
  const taxIdValue = Form.useWatch('taxId', form);
  const branchNumberValue = Form.useWatch('branchNumber', form);
  const { confirmWarning, MobileConfirmDrawer } = useConfirmModal();
  const {
    juristicType: orgJuristicType,
    idCard,
    registrationNumber,
    taxId,
  } = orgInfoData || {};
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

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
    form.setFieldsValue({ idCard: value });
    setIsSuccessCheckIdCard(false);
  };

  const handleChangeRegistrationNumber = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ registrationNumber: value });
    setIsSuccessCheckRegistrationNumber(false);
  };

  const handleCheckIdCard = async () => {
    const value = form.getFieldValue('idCard') || '';
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      form.setFields([
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
          form.setFields([
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
        form.setFields([
          {
            name: 'idCard',
            errors: [
              'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี',
            ],
          },
        ]);
      }
    } else {
      form.validateFields(['idCard']);
      setIsSuccessCheckIdCard(false);
    }
  };

  const handleCheckRegistrationNumber = async () => {
    const value = form.getFieldValue('registrationNumber') || '';
    const isValid = idCardCheck(value);

    if (!isValid || value.length !== 13) {
      form.setFields([
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
          form.setFields([
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
        form.setFields([
          {
            name: 'registrationNumber',
            errors: [
              'เกิดข้อผิดพลาดในการตรวจสอบเลขทะเบียนพาณิชย์หรือเลขประจำตัวประชาชน',
            ],
          },
        ]);
      }
    } else {
      form.validateFields(['registrationNumber']);
      setIsSuccessCheckRegistrationNumber(false);
    }
  };

  const handleCheckTaxId = async () => {
    const taxIdValue = form.getFieldValue('taxId') || '';
    const branchNumber = form.getFieldValue('branchNumber') || '';
    const isValid = isValidThaiJuristicId(taxIdValue);

    if (!isValid) {
      form.setFields([
        {
          name: 'taxId',
          errors: ['เลขประจำตัวนิติบุคคลไม่ถูกต้อง'],
        },
      ]);
      setIsSuccessCheckTaxId(false);
      return;
    }

    try {
      await form.validateFields(['branchNumber']);
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
      form.setFieldsValue({
        juristicTypeId: juristicTypeList?.find(
          (juristic: any) => juristic.value === data.juristicType.value
        )?.value,
        branchName: data.branchName,
        organizeName: data.organizeName,
      });
      setIsSuccessCheckTaxId(true);
      setErrorMessageCheckTaxId('');
      form.validateFields(['juristicName']);
    } catch (error: any) {
      setIsSuccessCheckTaxId(false);
      if (error.response.data.data.exists) {
        setErrorMessageCheckTaxId(
          'เลขทะเบียนนิติบุคคลนี้ได้ถูกใช้ไปแล้วในระบบ'
        );
      } else {
        setErrorMessageCheckTaxId(
          'ไม่พบข้อมูลเลขทะเบียนนิติบุคคลนี้ในระบบ DBD กรุณาตรวจสอบอีกครั้ง'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      setIsSuccessCheckIdCard(false);
      setIsSuccessCheckTaxId(false);
      setErrorMessageCheckTaxId('');
      setIsSuccessCheckRegistrationNumber(false);
      form.resetFields();
    }
  }, [visible]);

  const onFinish = async (values: any) => {
    if (onFinishProp) {
      onFinishProp(values);
    }
  };

  const renderLabelByStatus = (status: KycOrganizationStatus) => {
    switch (status) {
      case KycOrganizationStatus.NONE:
        return (
          <Label
            prefix={<i className="ri-information-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ยังไม่ยืนยันตัวตน"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.WAIT_FOR_APPROVE:
        return (
          <Label
            prefix={<i className="ri-information-line text-warning"></i>}
            variant="ghost"
            color="warning"
            text="รอการอนุมัติ"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REQUEST_MORE:
        return (
          <Label
            prefix={<i className="ri-draft-line text-[#508EB9]"></i>}
            variant="ghost"
            color="info"
            text="ขอข้อมูลเพิ่มเติม"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.APPROVE:
        return (
          <Label
            prefix={<i className="ri-verified-badge-line text-success"></i>}
            variant="ghost"
            color="success"
            text="ยืนยันตัวตนแล้ว"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REJECT:
        return (
          <Label
            prefix={<i className="ri-close-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ถูกปฏิเสธ"
            rounding="pill"
          />
        );
    }
  };

  return (
    <>
      <div className="mt-6">
        <Form
          className="relative"
          layout="vertical"
          form={form}
          scrollToFirstError
          onFinish={onFinish}
          initialValues={{
            businessType: [],
            juristicType: 'PERSONAL',
            mainPhoneNumber: '',
            mainEmail: '',
            idCard: '',
            organizeName: '',
            commercialName: '',
            registrationNumber: '',
            isUseFullName: '',
            taxId: '',
            type: '',
            branchNumber: '',
            juristicTypeId: '',
            branchName: '',
            otherContactNumber: '',
          }}
        >
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
                    paddingBottom: isMobile ? '110px' : '70px',
                  }
            }
          >
            <div className="flex flex-col gap-4">
              <Typography
                variant="paragraph-big"
                className="!text-text-primary"
              >
                ขั้นตอนที่ 1 : ข้อมูลเกี่ยวกับองค์กร
              </Typography>
              <div className="flex justify-between">
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-tertiary"
                >
                  สถานะการยืนยันตัวตนองค์กร
                </Typography>
                {renderLabelByStatus(kycStatus)}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              <Form.Item noStyle name="juristicType" />
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const juristicType = getFieldValue('juristicType');
                  if (
                    juristicType === OrganizationTypes.PERSONAL ||
                    juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL
                  ) {
                    return (
                      <Select
                        label="ประเภทองค์กร"
                        value={juristicType}
                        placeholder="เลือกประเภทองค์กร"
                        options={[
                          {
                            label: 'บุคคลธรรมดา',
                            value: OrganizationTypes.PERSONAL,
                            disabled:
                              juristicType ===
                              OrganizationTypes.REGISTERED_INDIVIDUAL,
                          },
                          {
                            label: 'บุคคลธรรมดาจดทะเบียนพาณิชย์',
                            value: OrganizationTypes.REGISTERED_INDIVIDUAL,
                          },
                          {
                            label: 'นิติบุคคล',
                            value: OrganizationTypes.JURISTIC,
                            disabled: true,
                          },
                        ]}
                        required
                        rules={[
                          {
                            required: true,
                            message: 'กรุณาเลือกประเภทองค์กร',
                          },
                        ]}
                        onChange={(value) => {
                          confirmWarning({
                            title: 'เปลี่ยนประเภทองค์กร',
                            description:
                              'คุณกำลังจะเปลี่ยนประเภทองค์กรเป็น “บุคคลธรรมดาจดทะเบียนพาณิชย์” เมื่อไปขั้นตอนต่อไปแล้ว จะไม่สามารถเปลี่ยนกลับเป็น “บุคคลธรรมดา” ได้อีก',
                            onOk: () => {
                              form.setFieldsValue({
                                juristicType: value,
                                organizeName: '',
                                idCard: '',
                                registrationNumber: '',
                              });
                              setIsSuccessCheckIdCard(false);
                              setIsSuccessCheckRegistrationNumber(false);
                            },
                            okText: 'ยืนยันการเปลี่ยน',
                          });
                        }}
                      />
                    );
                  }
                }}
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const juristicType = getFieldValue('juristicType');
                  if (juristicType === OrganizationTypes.PERSONAL) {
                    return (
                      <>
                        <div
                          className={`flex gap-2 ${
                            form.getFieldError('idCard').length > 0 ||
                            isSuccessCheckIdCard
                              ? 'items-center'
                              : 'items-end'
                          }`}
                        >
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
                                !form.getFieldError('idCard').length
                                  ? 'border !border-primary'
                                  : ''
                              } `}
                              suffix={
                                <>
                                  {form.getFieldError('idCard')[0] ===
                                    'เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว' && (
                                    <i className="ri-information-line text-error"></i>
                                  )}
                                  {isSuccessCheckIdCard &&
                                    !form.getFieldError('idCard').length && (
                                      <i className="ri-check-line text-primary"></i>
                                    )}
                                </>
                              }
                              validateStatus={
                                form.getFieldError('idCard').length > 0
                                  ? 'error'
                                  : isSuccessCheckIdCard
                                  ? 'success'
                                  : ''
                              }
                              help={
                                form.getFieldError('idCard').length > 0
                                  ? form.getFieldError('idCard')[0]
                                  : isSuccessCheckIdCard
                                  ? 'สามารถใช้เลขประจำตัวประชาชนได้'
                                  : ''
                              }
                            />
                          </div>

                          <div className="mt-2">
                            <Button
                              onClick={handleCheckIdCard}
                              disabled={
                                orgJuristicType === 'PERSONAL' &&
                                form.getFieldValue('idCard') === idCard
                              }
                            >
                              ตรวจสอบ
                            </Button>
                          </div>
                        </div>
                        <TextField
                          name="organizeName"
                          label="ชื่อบุคคลธรรมดา"
                          required
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อบุคคลธรรมดา',
                            },
                            {
                              max: 50,
                              message:
                                'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                            },
                          ]}
                          placeholder="กรุณากรอกชื่อบุคคลธรรมดา"
                        />
                      </>
                    );
                  } else if (
                    juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL
                  ) {
                    return (
                      <>
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
                                !form.getFieldError('registrationNumber').length
                                  ? 'border !border-primary'
                                  : ''
                              } `}
                              suffix={
                                <>
                                  {form.getFieldError(
                                    'registrationNumber'
                                  )[0] ===
                                    'เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว' && (
                                    <i className="ri-information-line text-error"></i>
                                  )}
                                  {isSuccessCheckRegistrationNumber &&
                                    !form.getFieldError('registrationNumber')
                                      .length && (
                                      <i className="ri-check-line text-primary"></i>
                                    )}
                                </>
                              }
                              validateStatus={
                                form.getFieldError('registrationNumber')
                                  .length > 0
                                  ? 'error'
                                  : isSuccessCheckRegistrationNumber
                                  ? 'success'
                                  : ''
                              }
                              help={
                                form.getFieldError('registrationNumber')
                                  .length > 0
                                  ? form.getFieldError('registrationNumber')[0]
                                  : isSuccessCheckRegistrationNumber
                                  ? 'สามารถใช้เลขทะเบียนพาณิชย์ได้'
                                  : 'กดปุ่มตรวจสอบเพื่อยืนยันเลขทะเบียนพาณิชย์'
                              }
                            />
                          </div>
                          <div className="mt-2">
                            <Button
                              onClick={handleCheckRegistrationNumber}
                              disabled={
                                form.getFieldValue('juristicType') ===
                                  'REGISTERED_INDIVIDUAL' &&
                                form.getFieldValue('registrationNumber') ===
                                  registrationNumber
                              }
                            >
                              ตรวจสอบ
                            </Button>
                          </div>
                        </div>
                        <TextField
                          //   name="registrationName"
                          name="organizeName"
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
                        <TextField
                          //   name="registrationName"
                          name="commercialName"
                          label="ออกให้"
                          placeholder="ออกให้บุคคล"
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อที่ออกให้บุคคล',
                            },
                          ]}
                        />
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
                            {
                              validator: (_: unknown, value: string) => {
                                if (!value) return Promise.resolve();

                                if (!idCardCheck(value)) {
                                  return Promise.reject(
                                    'เลขประจำตัวประชาชนไม่ถูกต้อง'
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          maxLength={13}
                        />
                      </>
                    );
                  } else if (juristicType === OrganizationTypes.JURISTIC) {
                    return (
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
                              form.setFieldsValue({
                                branchNumber: '00000',
                              });
                            } else {
                              form.setFieldsValue({
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
                                    const target = e.target as HTMLInputElement;
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
                            taxIdValue === '' ||
                            (orgJuristicType === 'JURISTIC' &&
                              form.getFieldValue('taxId') === taxId)
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

                        <Divider className="!my-0" />

                        <Select
                          name="juristicTypeId"
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
                            form.setFieldsValue({
                              juristicTypeId: juristicTypeId,
                            });
                          }}
                        />
                        <Form.Item name="juristicTypeId" noStyle />
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => {
                            const juristicType = getFieldValue('juristicType');
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
                                        message: 'กรุณากรอกประเภทนิติบุคคล',
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
                                              'กรุณากรอกประเภทนิติบุคคล'
                                            );
                                          }
                                          if (
                                            [
                                              'บริษัทมหาชนจำกัด',
                                              'บมจ',
                                              'บริษัทจำกัด',
                                              'บจก',
                                              'ห้างหุ้นส่วนจำกัด',
                                              'หจก',
                                              'ห้างหุ้นส่วนสามัญ',
                                              'หสม',
                                            ].some((type) =>
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
                                        target.value = target.value.trimStart();
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
                            name="organizeName"
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
                                max: 50,
                                message:
                                  'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                              },
                              {
                                validator: (_: unknown, value: string) => {
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
                      </div>
                    );
                  }
                  return null;
                }}
              </Form.Item>
              <Divider className="!my-0" />
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                ข้อมูลประเภทธุรกิจ
              </Typography>
              <Form.Item
                name="businessType"
                className="!mb-0"
                label={
                  <Typography
                    variant="paragraph-small"
                    className="!text-text-secondary !font-medium"
                  >
                    ช่องทางชำระ <span className="text-primary text-xs">*</span>
                  </Typography>
                }
              >
                <CheckboxGroup
                  options={optionBusinessType}
                  value={['']}
                  className="flex flex-col gap-2"
                />
              </Form.Item>
              <Divider className="!my-0" />
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                ข้อมูลติดต่อ
              </Typography>
              <TextField
                name="mainPhoneNumber"
                label="เบอร์โทรศัพท์"
                required
                maxLength={10}
                type="tel"
                placeholder="เบอร์โทร 10 หลัก"
                rules={[
                  { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                  {
                    pattern: /^0[689]\d{8}$/,
                    message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                  },
                ]}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '');
                }}
              />
              <TextField
                name="otherContactNumber"
                label="เบอร์ติดต่ออื่นๆ"
                maxLength={10}
                type="tel"
                placeholder="เบอร์โทร 10 หลัก"
                rules={[
                  {
                    pattern: /^0[689]\d{8}$/,
                    message: 'กรุณากรอกเบอร์มือถือที่ถูกต้อง',
                  },
                ]}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '');
                }}
              />
              <TextField
                name="mainEmail"
                label="อีเมล"
                placeholder="กรอกอีเมล"
                type="email"
                rules={[
                  {
                    type: 'email',
                    message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                  },
                ]}
              />
            </div>
          </div>
          {isInPopup ? (
            <Form.Item shouldUpdate noStyle>
              {({ getFieldsError, getFieldValue }) => {
                const juristicType = getFieldValue('juristicType');
                return (
                  <div className="fixed md:absolute bottom-0 inset-x-0 md:bottom-[-16px] w-full flex justify-end bg-white py-4 pr-4 md:pr-0">
                    <Button
                      htmlType="submit"
                      bold="600"
                      disabled={
                        (juristicType === OrganizationTypes.PERSONAL &&
                          !isSuccessCheckIdCard) ||
                        (juristicType ===
                          OrganizationTypes.REGISTERED_INDIVIDUAL &&
                          !isSuccessCheckRegistrationNumber) ||
                        (juristicType === OrganizationTypes.JURISTIC &&
                          !isSuccessCheckTaxId)
                      }
                      loading={isLoadingSaveDraft}
                    >
                      บันทึกข้อมูล
                    </Button>
                  </div>
                );
              }}
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
                  fullWidth={isMobile}
                >
                  บันทึกแบบร่าง
                </Button>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldsError, getFieldValue }) => {
                    const juristicType = getFieldValue('juristicType');
                    return (
                      <Button
                        htmlType="submit"
                        bold="600"
                        disabled={
                          (juristicType === OrganizationTypes.PERSONAL &&
                            !isSuccessCheckIdCard) ||
                          (juristicType ===
                            OrganizationTypes.REGISTERED_INDIVIDUAL &&
                            !isSuccessCheckRegistrationNumber) ||
                          (juristicType === OrganizationTypes.JURISTIC &&
                            !isSuccessCheckTaxId)
                        }
                        loading={isLoadingSaveDraft}
                        fullWidth={isMobile}
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
      </div>
      <MobileConfirmDrawer />
    </>
  );
};

export default FormDraftOrgInfo;
