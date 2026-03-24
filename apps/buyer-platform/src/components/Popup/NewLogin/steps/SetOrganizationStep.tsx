'use client';

import React, { useEffect, useState } from 'react';
import { Form, FormInstance } from 'antd';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import CardSelection from '@/components/Card/Selection';
import { Label } from '@/components/Label';
import { OrganizationTypes } from '@/common/enum/organization.enum';
import { OrganizationFormFields } from '../types';
import { PersonalOrganizationForm } from './organization-forms/PersonalOrganizationForm';
import { RegisteredIndividualForm } from './organization-forms/RegisteredIndividualForm';
import { JuristicOrganizationForm } from './organization-forms/JuristicOrganizationForm';

export interface SetOrganizationStepProps {
  organizationForm: FormInstance<OrganizationFormFields>;
  loading?: boolean;
  onFinish: (values: OrganizationFormFields) => void;
  onBack?: () => void;
}

const SetOrganizationStep: React.FC<SetOrganizationStepProps> = ({
  organizationForm,
  loading,
  onFinish,
}) => {
  const accountTypeValue = Form.useWatch('accountType', organizationForm);
  const [isSuccessCheckIdCard, setIsSuccessCheckIdCard] = useState(false);
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(false);
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(false);

  // Set default accountType on mount
  useEffect(() => {
    if (!organizationForm.getFieldValue('accountType')) {
      organizationForm.setFieldsValue({
        accountType: OrganizationTypes.PERSONAL,
      });
    }
  }, []);

  useEffect(() => {
    // Clear all fields when account type changes
    organizationForm.setFieldsValue({
      // Personal
      idCard: '',
      // Registered Individual
      registrationNumber: '',
      registrationName: '',
      // Juristic
      taxId: '',
      juristicType: 'LIMITED_COMPANY',
      juristicTypeId: 4,
      remarkTypeOther: '',
      juristicName: '',
      branchType: undefined,
      branchNumber: '',
      branchName: '',
      businessType: ['AGENT'],
      businessTypeDescription: '',
    });

    // Reset all validation states when account type changes
    setIsSuccessCheckIdCard(false);
    setIsSuccessCheckRegistrationNumber(false);
    setIsSuccessCheckTaxId(false);

    // Set default branch values for juristic type
    if (accountTypeValue === OrganizationTypes.JURISTIC) {
      organizationForm.setFieldsValue({
        branchType: 'HEAD_OFFICE',
        branchNumber: '00000',
        branchName: 'สำนักงานใหญ่',
      });
    }
  }, [accountTypeValue]);

  return (
    <Form
      form={organizationForm}
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
          {/* Account Type Selection */}
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
                        organizationForm.setFieldsValue({
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
                        organizationForm.setFieldsValue({
                          accountType: OrganizationTypes.REGISTERED_INDIVIDUAL,
                        })
                      }
                    />
                    <CardSelection
                      isSelected={accountType === OrganizationTypes.JURISTIC}
                      icon="ri-briefcase-2-line"
                      label="นิติบุคคล"
                      onClick={() =>
                        organizationForm.setFieldsValue({
                          accountType: OrganizationTypes.JURISTIC,
                        })
                      }
                    />
                  </div>
                </Form.Item>
              );
            }}
          </Form.Item>

          {/* Organization Forms Based on Account Type */}
          <div className="mt-6">
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const accountType = getFieldValue('accountType');
                if (accountType === OrganizationTypes.PERSONAL) {
                  return (
                    <PersonalOrganizationForm
                      form={organizationForm}
                      isSuccessCheckIdCard={isSuccessCheckIdCard}
                      setIsSuccessCheckIdCard={setIsSuccessCheckIdCard}
                    />
                  );
                } else if (
                  accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
                ) {
                  return (
                    <RegisteredIndividualForm
                      form={organizationForm}
                      isSuccessCheckRegistrationNumber={
                        isSuccessCheckRegistrationNumber
                      }
                      setIsSuccessCheckRegistrationNumber={
                        setIsSuccessCheckRegistrationNumber
                      }
                    />
                  );
                } else if (accountType === OrganizationTypes.JURISTIC) {
                  return (
                    <JuristicOrganizationForm
                      form={organizationForm}
                      isSuccessCheckTaxId={isSuccessCheckTaxId}
                      setIsSuccessCheckTaxId={setIsSuccessCheckTaxId}
                    />
                  );
                }
                return null;
              }}
            </Form.Item>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="absolute bottom-0 w-full">
        <Form.Item className="!mb-0">
          <Form.Item shouldUpdate noStyle>
            {({ getFieldsError, getFieldValue }) => {
              const hasErrors = getFieldsError().some(
                ({ errors }) => errors.length
              );
              const accountType = getFieldValue('accountType');
              const hasEmptyAccountType = !accountType;
              const isPersonalType = accountType === OrganizationTypes.PERSONAL;
              const isRegisteredIndividualType =
                accountType === OrganizationTypes.REGISTERED_INDIVIDUAL;
              const isJuristicType = accountType === OrganizationTypes.JURISTIC;

              const shouldDisable =
                hasErrors ||
                hasEmptyAccountType ||
                (isPersonalType && !isSuccessCheckIdCard) ||
                (isRegisteredIndividualType &&
                  !isSuccessCheckRegistrationNumber) ||
                (isJuristicType && !isSuccessCheckTaxId);

              return (
                <Button
                  htmlType="submit"
                  fullWidth
                  disabled={shouldDisable}
                  loading={loading}
                  bold="600"
                >
                  ลงทะเบียน
                </Button>
              );
            }}
          </Form.Item>
        </Form.Item>
      </div>
    </Form>
  );
};

export default SetOrganizationStep;
