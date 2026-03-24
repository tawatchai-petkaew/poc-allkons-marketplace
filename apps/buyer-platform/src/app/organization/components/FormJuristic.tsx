import {
  checkTaxId,
  getOrganizationJuristicTypeMasterData,
} from '@/common/api/customer-service/organization.api';
import { businessTypeList } from '@/common/constants/organization';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { JurigisticTypes } from '@/common/enum/organization.enum';
import { IOrganizationJuristicTypeMasterDataResponse } from '@/common/interfaces/organization/organization.response.interface';
import Button from '@/components/Button';
import Select from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import Typography from '@/components/Typography';
import { getJuristicTypeSuffixAndPrefix } from '@/utils/format';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Checkbox, Form, FormInstance } from 'antd';
import { useState, useEffect } from 'react';

type Props = {
  form: FormInstance;
  setIsConsentVisible: (visible: boolean) => void;
  setFormReady: (ready: boolean) => void;
};

const CheckboxGroup = Checkbox.Group;

const FormJuristic = ({ form, setIsConsentVisible, setFormReady }: Props) => {
  const businessType = Form.useWatch('businessType', form);
  const juristicType = Form.useWatch('juristicType', form);
  const isOtherSelected = businessType?.includes('OTHER');
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(false);
  const { data: juristicOrgs } = useQuery({
    queryKey: ['juristic-type-master-data'],
    queryFn: getOrganizationJuristicTypeMasterData,
  });
  const [isPrefilled, setIsPrefilled] = useState(false);

  const { mutate: checkTaxIdMutate, isPending: isCheckingTaxId } = useMutation({
    mutationKey: ['taxId'],
    mutationFn: async (taxId: string) => {
      const response = await checkTaxId({
        taxId,
        organizeBranchNumber: '00000',
      });
      return response.data;
    },
    onSuccess: (data) => {
      setIsPrefilled(false);
      if (data.status === 'DISSOLVED') {
        form.setFields([
          {
            name: 'taxId',
            errors: ['เลขประจำตัวนิติบุคคลนี้เลิกกิจการแล้ว'],
          },
        ]);
      } else {
        setIsSuccessCheckTaxId(true);
        form.setFieldsValue({
          juristicName: data.organizeName,
          juristicType: data.juristicType.value,
          juristicTypeId: data.juristicType.id,
          ...(data.juristicType.value === 'OTHER'
            ? { juristicTypeRemark: data.juristicType.otherValue }
            : {}),
          branchName: 'สำนักงานใหญ่',
        });
        setIsPrefilled(true);
      }
    },
    onError: (e: any) => {
      console.log(e.response);
      setIsSuccessCheckTaxId(false);
      if (e?.response?.data?.error?.code === ErrorCode.TAX_ALREADY_EXISTS) {
        form.setFields([
          {
            name: 'taxId',
            errors: ['เลขประจำตัวนิติบุคคลถูกใช้สมัครแล้ว'],
          },
        ]);
      } else if (e?.response?.data?.data?.exists === false) {
        form.setFields([
          {
            name: 'taxId',
            errors: ['ไม่พบข้อมูลในระบบ DBD กรุณาลองใหม่อีกครั้ง'],
          },
        ]);
      } else {
        form.setFields([
          {
            name: 'taxId',
            errors: ['เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวนิติบุคคล'],
          },
        ]);
      }
    },
  });

  const formValues = Form.useWatch([], form);

  useEffect(() => {
    const values = form.getFieldsValue();
    console.log(values);
    const isAllFieldsFilled = Object.entries(values).every(([key, value]) => {
      if (key === 'businessTypeRemark' && !isOtherSelected) return true;
      if (key === 'isCheckedMarketingConsent') return value;
      if (
        key === 'juristicTypeRemark' &&
        values['juristicType'] !== JurigisticTypes.OTHER
      )
        return true;
      if (Array.isArray(value)) return value.length > 0;
      return (
        value !== undefined && value !== null && String(value).trim() !== ''
      );
    });

    const isReady =
      isSuccessCheckTaxId &&
      form.getFieldsError().every(({ errors }) => errors.length === 0) &&
      isAllFieldsFilled;

    setFormReady(isReady);
  }, [form, setFormReady, isSuccessCheckTaxId, isOtherSelected, formValues]);

  const juristicTypeOptions: IOrganizationJuristicTypeMasterDataResponse[] =
    juristicOrgs?.data
      ?.map((item: IOrganizationJuristicTypeMasterDataResponse) => ({
        label: item.label,
        value: item.value,
      }))
      .reverse()
      .filter(
        (item: IOrganizationJuristicTypeMasterDataResponse) =>
          item.value !== 'PERSONAL'
      ) || [];

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-4">
        <Form.Item
          name="businessType"
          className="!mb-0"
          label={
            <Typography
              variant="paragraph-small"
              className="!text-text-secondary !font-medium"
            >
              ประเภทธุรกิจ <span className="text-primary text-xs">*</span>
            </Typography>
          }
          rules={[
            {
              required: true,
              message: 'กรุณาเลือกประเภทธุรกิจ',
            },
          ]}
        >
          <CheckboxGroup
            options={businessTypeList}
            className="flex flex-col gap-2"
          />
        </Form.Item>
        {isOtherSelected && (
          <TextField
            name="businessTypeRemark"
            label="ประเภทธุรกิจ"
            placeholder="กรุณากรอกประเภทธุรกิจ"
            rules={[
              {
                required: true,
                message: 'กรุณากรอกประเภทธุรกิจ',
              },
              {
                pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                message: 'รูปแบบไม่ถูกต้อง',
              },
            ]}
          />
        )}
        <div className="flex items-start gap-2">
          <div className="w-full">
            <TextField
              name="taxId"
              type="numberOnly"
              label={'เลขประจำตัวนิติบุคคล'}
              placeholder={'กรุณากรอกเลขประจำตัวนิติบุคคล'}
              className={`${
                isSuccessCheckTaxId ? 'border !border-primary' : ''
              } `}
              rules={[
                {
                  required: true,
                  message: 'กรุณากรอกเลขประจำตัวนิติบุคคล',
                },
                {
                  pattern: /^[0-9]{13}$/,
                  message:
                    'รูปแบบไม่ถูกต้อง กรุณาใส่เลขประจำตัวนิติบุคคล 13 หลักเท่านั้น',
                },
              ]}
              maxLength={13}
              suffix={
                <>
                  {isSuccessCheckTaxId && (
                    <i className="ri-check-line text-primary"></i>
                  )}
                </>
              }
              validateStatus={isSuccessCheckTaxId ? 'success' : ''}
              help={
                isSuccessCheckTaxId
                  ? 'สามารถใช้เลขประจำตัวนิติบุคคลได้'
                  : undefined
              }
              onChange={() => {
                setIsSuccessCheckTaxId(false);
                setIsPrefilled(false);
                form.setFieldsValue({
                  juristicName: undefined,
                  juristicType: undefined,
                  branchName: undefined,
                });
              }}
            />
          </div>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldError, getFieldValue }) => {
              const hasError = getFieldError('taxId').length > 0;
              return (
                <div className={hasError ? 'mt-[32px]' : 'mt-8'}>
                  <Button
                    disabled={hasError || isSuccessCheckTaxId}
                    onClick={() => checkTaxIdMutate(getFieldValue('taxId'))}
                    loading={isCheckingTaxId}
                  >
                    {isSuccessCheckTaxId ? 'ยืนยันแล้ว' : 'ตรวจสอบ'}
                  </Button>
                </div>
              );
            }}
          </Form.Item>
        </div>
        <Select
          name="juristicType"
          label="ประเภทนิติบุคคล"
          options={juristicTypeOptions}
          placeholder="กรุณาเลือกประเภทนิติบุคคล"
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
          disabled={isPrefilled}
          rules={[
            {
              required: true,
              message: 'กรุณาเลือกประเภทนิติบุคคล',
            },
          ]}
          onChange={(value) => {
            const juristicTypeId = juristicOrgs?.data?.find(
              (juristic: IOrganizationJuristicTypeMasterDataResponse) =>
                juristic.value === value
            )?.id;
            form.setFieldsValue({
              juristicTypeId: juristicTypeId,
            });
          }}
        />
        {juristicType === 'OTHER' && (
          <TextField
            disabled={isPrefilled}
            name="juristicTypeRemark"
            label="ประเภทอื่นๆ"
            placeholder="กรุณากรอกประเภทอื่นๆ"
            rules={[
              {
                required: true,
                message: 'กรุณากรอกประเภทอื่นๆ',
              },
              {
                pattern: /^[a-zA-Zก-๙0-9\s]+$/,
                message: 'รูปแบบไม่ถูกต้อง',
              },
            ]}
          />
        )}
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const juristicType = getFieldValue('juristicType');
            const addOnBefore =
              getJuristicTypeSuffixAndPrefix(juristicType)?.prefix;
            const addonAfterText =
              getJuristicTypeSuffixAndPrefix(juristicType)?.suffix;

            return (
              <TextField
                disabled={isPrefilled}
                name="juristicName"
                label="ชื่อองค์กร"
                placeholder="กรุณากรอกชื่อองค์กร"
                addonBefore={addOnBefore}
                addonAfter={addonAfterText}
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
                    validator: (_: unknown, value: string) => {
                      if (value && value.trim() === '') {
                        return Promise.reject('กรุณากรอกชื่อองค์กร');
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
            );
          }}
        </Form.Item>
        <TextField
          name="branchName"
          label="ชื่อสาขา"
          placeholder="กรุณากรอกชื่อสาขา"
          defaultValue={'สำนักงานใหญ่'}
          disabled
          rules={[
            {
              required: true,
              message: 'กรุณากรอกชื่อสาขา',
            },
            {
              max: 100,
              message: 'ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร)',
            },
          ]}
        />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <Form.Item
          name="isCheckedMarketingConsent"
          valuePropName="checked"
          noStyle
        >
          <Checkbox />
        </Form.Item>
        <div className="flex gap-1">
          <Typography variant="paragraph-small-regular">
            ยินยอมการรับข่าวสาร
          </Typography>
          <Typography
            variant="paragraph-small-regular"
            className="!text-primary !underline cursor-pointer"
            onClick={() => {
              setIsConsentVisible(true);
            }}
          >
            นโยบายทางการตลาด
          </Typography>
        </div>
      </div>
    </Form>
  );
};

export default FormJuristic;
