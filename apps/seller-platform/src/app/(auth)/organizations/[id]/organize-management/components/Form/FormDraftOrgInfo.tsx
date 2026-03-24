'use client';

import { Form, Divider, Checkbox, Grid } from 'antd';
import { FormInstance } from 'antd';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import BadgeLabel from '@/components/BadgeLabel';
import TextField from '@/components/DataEntry/TextField';
import RadioGroup from '@/components/DataEntry/RadioGroup';
import Select from '@/components/DataEntry/Select';
import { idCardCheck, isValidThaiJuristicId } from '@/utils/validate';
import { checkTaxId } from '@/api/organization.api';
import { KycOrganizationStatus, OrganizationTypes } from '@/constants/enum/organization.enum';
import { useState, useMemo, useEffect, ReactNode } from 'react';
import { checkIdCardToCis, checkRegisNumber } from '@/api/user.api';
import { useConfirmPopup } from '@/hooks/useConfirmPopup';
import { juristicTypeList } from '@/constants/organization';

const CheckboxGroup = Checkbox.Group;

export type FormDraftOrgInfoValues = {
  businessType?: string[];
  juristicType?: string;
  mainPhoneNumber?: string;
  mainEmail?: string;
  idCard?: string;
  organizeName?: string;
  commercialName?: string;
  registrationNumber?: string;
  isUseFullName?: boolean;
  taxId?: string;
  type?: string;
  branchNumber?: string;
  juristicTypeId?: number;
  branchName?: string;
  otherMainPhoneNumber?: string;
  originalJuristic?: Record<string, unknown>;
  originalIdCard?: string;
  originalRegistrationNumber?: string;
  branchType?: string;
  remarkTypeOther?: string;
};

interface FormDraftOrgInfoProps {
  visible: boolean;
  onClose: () => void;
  form: FormInstance;
  onFinish?: (values: FormDraftOrgInfoValues) => void;
  isInPopup?: boolean;
  onSaveDraft?: () => void;
  isLoadingSaveDraft?: boolean;
  orgInfoData?: Record<string, any> | null;
  kycStatus: KycOrganizationStatus;
}

const optionBusinessType = [
  {
    label: 'ร้านค้าตัวแทนจําหน่าย (AGENT)',
    value: 'AGENT',
  },
  {
    label: 'ร้านค้าตัวแทนขนาดใหญ่ (BIGBOX)',
    value: 'BIGBOX',
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
  const [isSuccessCheckRegistrationNumber, setIsSuccessCheckRegistrationNumber] = useState(true);
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(true);
  const [errorMessageCheckTaxId, setErrorMessageCheckTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const branchTypeValue = Form.useWatch('branchType', form);
  const juristicTypeValue = Form.useWatch('juristicType', form);
  const taxIdValue = Form.useWatch('taxId', form);
  const branchNumberValue = Form.useWatch('branchNumber', form);
  const { showConfirm, confirmPopup } = useConfirmPopup();
  const { juristicType: orgJuristicType, registrationNumber, taxId } = orgInfoData || {};
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const juristicTypeOptions = juristicTypeList
    ?.map((item: { label: string; value: string }) => ({
      label: item.label,
      value: item.value,
    }))
    .reverse()
    .filter((item: { value: string }) => item.value !== 'PERSONAL');

  const prefix = useMemo(() => {
    return juristicTypeList?.find(
      (item: { value: string; prefix?: string | null }) => item.value === juristicTypeValue
    )?.prefix;
  }, [juristicTypeValue, juristicTypeList, isSuccessCheckTaxId]);

  const suffix = useMemo(() => {
    return juristicTypeList?.find(
      (item: { value: string; subfix?: string | null }) => item.value === juristicTypeValue
    )?.subfix;
  }, [juristicTypeValue, juristicTypeList, isSuccessCheckTaxId]);

  const handleChangeIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ idCard: value });
    setIsSuccessCheckIdCard(false);
  };

  const handleChangeRegistrationNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ registrationNumber: value });
    setIsSuccessCheckRegistrationNumber(false);
  };

  const handleChangeTaxId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldsValue({ taxId: value });
    setIsSuccessCheckTaxId(false);
  };

  const handleCheckIdCard = async () => {
    const value = form.getFieldValue('idCard') || '';
    const originalIdCard = form.getFieldValue('originalIdCard') || '';
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

    if (value === originalIdCard) {
      setIsSuccessCheckIdCard(true);
      return;
    }

    if (value.length === 13) {
      try {
        const { data } = await checkIdCardToCis({ idCard: value });
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
            errors: ['เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวประชาชนหรือเลขประจำตัวผู้เสียภาษี'],
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
    const originalRegistrationNumber = form.getFieldValue('originalRegistrationNumber') || '';
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
    if (value === originalRegistrationNumber) {
      setIsSuccessCheckRegistrationNumber(true);
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
            errors: ['เกิดข้อผิดพลาดในการตรวจสอบเลขทะเบียนพาณิชย์หรือเลขประจำตัวประชาชน'],
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
    const originalJuristic = form.getFieldValue('originalJuristic') || '';

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

    if (taxIdValue === originalJuristic?.taxId) {
      form.setFieldsValue({
        juristicTypeId: originalJuristic?.juristicTypeId,
        juristicTypeName: juristicTypeList?.find(
          (juristic: { id: number; value: string }) =>
            juristic.id === originalJuristic?.juristicTypeId
        )?.value,
        branchName:
          originalJuristic?.branchName === 'HEAD_OFFICE'
            ? 'สำนักงานใหญ่'
            : originalJuristic?.branchName,
        organizeName: originalJuristic?.organizeName,
        branchType: originalJuristic?.type || originalJuristic?.branchType,
        branchNumber:
          originalJuristic?.branchName === 'HEAD_OFFICE' ? '00000' : originalJuristic?.branchNumber,
      });
      setIsSuccessCheckTaxId(true);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await checkTaxId({
        taxId: taxIdValue,
        organizeBranchNumber: branchNumber,
      });
      if (data?.status === 'DISSOLVED') {
        form.setFields([
          {
            name: 'taxId',
            errors: ['เลขประจำตัวนิติบุคคลนี้เลิกกิจการแล้ว'],
          },
        ]);
        setIsSuccessCheckTaxId(false);
        return;
      }
      if (data) {
        form.setFieldsValue({
          juristicTypeId: juristicTypeList?.find(
            (juristic: { value: string; id: number }) => juristic.value === data.juristicType?.value
          )?.id,
          juristicTypeName: juristicTypeList?.find(
            (juristic: { value: string }) => juristic.value === data.juristicType?.value
          )?.value,
          branchName: data.branchName,
          organizeName: data.organizeName,
          branchType: data.branchName === 'สำนักงานใหญ่' ? 'HEAD_OFFICE' : 'BRANCH',
          branchNumber: data.branchName === 'สำนักงานใหญ่' ? '00000' : '',
        });
        setIsSuccessCheckTaxId(true);
        setErrorMessageCheckTaxId('');
        form.validateFields(['juristicName']);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { data?: { exists?: boolean } } } };
      setIsSuccessCheckTaxId(false);
      if (err.response?.data?.data?.exists) {
        setErrorMessageCheckTaxId('เลขทะเบียนนิติบุคคลนี้ได้ถูกใช้ไปแล้วในระบบ');
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
  }, [visible, form]);

  const onFinish = async (values: FormDraftOrgInfoValues) => {
    if (onFinishProp) {
      onFinishProp(values);
    }
  };

  const renderLabelByStatus = (status: KycOrganizationStatus) => {
    switch (status) {
      case KycOrganizationStatus.NONE:
        return (
          <BadgeLabel
            prefix={<i className="ri-information-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ยังไม่ยืนยันตัวตน"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.WAIT_FOR_APPROVE:
        return (
          <BadgeLabel
            prefix={<i className="ri-information-line text-warning"></i>}
            variant="ghost"
            color="warning"
            text="รอการอนุมัติ"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REQUEST_MORE:
        return (
          <BadgeLabel
            prefix={<i className="ri-draft-line text-[#508EB9]"></i>}
            variant="ghost"
            color="info"
            text="ขอข้อมูลเพิ่มเติม"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.APPROVE:
        return (
          <BadgeLabel
            prefix={<i className="ri-verified-badge-line text-success"></i>}
            variant="ghost"
            color="success"
            text="ยืนยันตัวตนแล้ว"
            rounding="pill"
          />
        );
      case KycOrganizationStatus.REJECT:
        return (
          <BadgeLabel
            prefix={<i className="ri-close-line text-error"></i>}
            variant="ghost"
            color="error"
            text="ไม่ได้รับการอนุมัติ"
            rounding="pill"
          />
        );
      default:
        return null;
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
            otherMainPhoneNumber: '',
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
              <Typography variant="paragraph-big" className="!text-text-primary">
                ขั้นตอนที่ 1 : ข้อมูลเกี่ยวกับองค์กร
              </Typography>
              <div className="flex justify-between">
                <Typography variant="paragraph-medium" className="!text-text-tertiary">
                  สถานะการยืนยันตัวตนองค์กร
                </Typography>
                {renderLabelByStatus(kycStatus)}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              <Form.Item noStyle name="juristicType" />
              <Form.Item noStyle name="originalIdCard" />
              <Form.Item noStyle name="originalRegistrationNumber" />
              <Form.Item noStyle name="originalJuristic" />
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
                            disabled: juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL,
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
                          showConfirm({
                            title: 'เปลี่ยนประเภทองค์กร',
                            detail:
                              'คุณกำลังจะเปลี่ยนประเภทองค์กรเป็น "บุคคลธรรมดาจดทะเบียนพาณิชย์" เมื่อไปขั้นตอนต่อไปแล้ว จะไม่สามารถเปลี่ยนกลับเป็น "บุคคลธรรมดา" ได้อีก',
                            onConfirm: () => {
                              form.setFieldsValue({
                                juristicType: value,
                                organizeName: '',
                                idCard: '',
                                registrationNumber: '',
                              });
                              setIsSuccessCheckIdCard(false);
                              setIsSuccessCheckRegistrationNumber(false);
                            },
                            confirmText: 'ยืนยันการเปลี่ยน',
                            type: 'warn',
                          });
                        }}
                      />
                    );
                  }
                  return null;
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
                            form.getFieldError('idCard').length > 0 || isSuccessCheckIdCard
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
                                isSuccessCheckIdCard && !form.getFieldError('idCard').length
                                  ? 'border !border-primary'
                                  : ''
                              } `}
                              suffix={
                                <>
                                  {form.getFieldError('idCard')[0] ===
                                    'เลขบัตรประจำตัวประชาชนถูกใช้สมัครแล้ว' && (
                                    <i className="ri-information-line text-error"></i>
                                  )}
                                  {isSuccessCheckIdCard && !form.getFieldError('idCard').length && (
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
                            <Button onClick={handleCheckIdCard}>ตรวจสอบ</Button>
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
                              message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร)',
                            },
                          ]}
                          type="textOnly"
                          placeholder="กรุณากรอกชื่อบุคคลธรรมดา"
                        />
                      </>
                    );
                  } else if (juristicType === OrganizationTypes.REGISTERED_INDIVIDUAL) {
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
                                  {form.getFieldError('registrationNumber')[0] ===
                                    'เลขทะเบียนพาณิชย์ถูกใช้สมัครแล้ว' && (
                                    <i className="ri-information-line text-error"></i>
                                  )}
                                  {isSuccessCheckRegistrationNumber &&
                                    !form.getFieldError('registrationNumber').length && (
                                      <i className="ri-check-line text-primary"></i>
                                    )}
                                </>
                              }
                              validateStatus={
                                form.getFieldError('registrationNumber').length > 0
                                  ? 'error'
                                  : isSuccessCheckRegistrationNumber
                                    ? 'success'
                                    : ''
                              }
                              help={
                                form.getFieldError('registrationNumber').length > 0
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
                                form.getFieldValue('juristicType') === 'REGISTERED_INDIVIDUAL' &&
                                form.getFieldValue('registrationNumber') === registrationNumber
                              }
                            >
                              ตรวจสอบ
                            </Button>
                          </div>
                        </div>
                        <TextField
                          name="organizeName"
                          label="ชื่อที่ใช้ในการประกอบพาณิชยกิจ"
                          placeholder="กรอกชื่อร้าน"
                          addonBefore="ร้าน"
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อที่ใช้ในการประกอบพาณิชยกิจ',
                            },
                          ]}
                        />
                        <TextField
                          name="commercialName"
                          label="ออกให้"
                          placeholder="ออกให้บุคคล"
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อที่ออกให้บุคคล',
                            },
                            {
                              pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                              message: 'ไม่อนุญาตให้กรอกอักขระพิเศษ',
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
                                  return Promise.reject('เลขประจำตัวประชาชนไม่ถูกต้อง');
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
                                  return Promise.reject('เลขประจำตัวนิติบุคคลไม่ถูกต้อง');
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                          maxLength={13}
                          onChange={handleChangeTaxId}
                        />
                        <RadioGroup
                          label="สำนักงาน"
                          name="branchType"
                          options={[
                            {
                              label: 'สำนักงานใหญ่',
                              value: 'HEAD_OFFICE',
                            },
                          ]}
                          onChange={(e) => {
                            if (e.target.value === 'HEAD_OFFICE') {
                              form.setFieldsValue({
                                branchNumber: '00000',
                                branchName: 'สำนักงานใหญ่',
                              });
                            } else {
                              form.setFieldsValue({
                                branchNumber: '',
                                branchName: '',
                              });
                            }
                          }}
                        />
                        <TextField
                          name="branchNumber"
                          label="เลขที่สาขา"
                          placeholder="กรอกเลขที่สาขา"
                          required
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกเลขที่สาขา',
                            },
                          ]}
                        />
                        <TextField
                          name="branchName"
                          label="ชื่อสาขา"
                          placeholder="กรอกชื่อสาขา"
                          required
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อสาขา',
                            },
                          ]}
                        />
                        <TextField
                          name="organizeName"
                          label="ชื่อองค์กร"
                          placeholder="กรอกชื่อองค์กร"
                          required
                          rules={[
                            {
                              required: true,
                              message: 'กรุณากรอกชื่อองค์กร',
                            },
                          ]}
                        />
                      </div>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Form.Item name="businessType" label="ประเภทธุรกิจ (เลือกได้มากกว่า 1 ประเภท)">
                <CheckboxGroup options={optionBusinessType} className="flex flex-col gap-2" />
              </Form.Item>

              <TextField
                name="mainPhoneNumber"
                label="เบอร์ติดต่อหลัก"
                placeholder="กรุณากรอกเบอร์ติดต่อหลัก"
                required
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกเบอร์ติดต่อหลัก',
                  },
                ]}
              />

              <TextField
                name="mainEmail"
                label="อีเมล"
                placeholder="กรุณากรอกอีเมล"
                required
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกอีเมล',
                  },
                  {
                    type: 'email',
                    message: 'อีเมลไม่ถูกต้อง',
                  },
                ]}
              />
            </div>
          </div>

          {isInPopup ? (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border-primary">
              <div className="flex gap-4">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                  disabled={isLoadingSaveDraft}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  variant="solid"
                  color="primary"
                  htmlType="submit"
                  loading={isLoadingSaveDraft}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          ) : (
            <div className="fixed bottom-0 w-full inset-x-0 py-4 bg-white shadow-xl">
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
                      onClick={() => {
                        if (onSaveDraft) {
                          onSaveDraft();
                        }
                      }}
                      loading={isLoadingSaveDraft}
                      fullWidth
                    >
                      บันทึกร่าง
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full container flex gap-2 justify-end mx-auto">
                  <div className="flex px-4 justify-end gap-2">
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
                      <Button htmlType="submit" bold="600" loading={isLoadingSaveDraft}>
                        ขั้นตอนต่อไป
                      </Button>
                    </Form.Item>
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
      </div>
      {confirmPopup}
    </>
  );
};

export default FormDraftOrgInfo;
