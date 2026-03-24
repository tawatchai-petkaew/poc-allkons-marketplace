"use client";

import React, { useEffect, useState } from "react";
import { Form, FormInstance } from "antd";
import Button from "@/components/Button";
import Typography from "@/components/Typography";
import CardSelection from "@/components/Card/Selection";
import { OrganizationType } from "@/constants/enum/organization.enum";
import { OrganizationFormFields, ExistingOrganization } from "../../types";
import { RegisteredIndividualForm } from "./organization-forms/RegisteredIndividualForm";
import { JuristicOrganizationForm } from "./organization-forms/JuristicOrganizationForm";
import Select from "@/components/DataEntry/Select";
import { RegisteredIndividualFormFields } from "@/components/Form/Organization/RegisteredIndividualForm";
import { JuristicFormFields } from "@/components/Form/Organization/JuristicForm";

export interface SetOrganizationStepProps {
  organizationForm: FormInstance<OrganizationFormFields>;
  loading?: boolean;
  onFinish: (values: OrganizationFormFields) => void;
  onBack?: () => void;
  existingRegisteredIndividualOrgs?: ExistingOrganization[] | null;
  existingJuristicOrgs?: ExistingOrganization[] | null;
}

const SetOrganizationStep: React.FC<SetOrganizationStepProps> = ({
  organizationForm,
  loading,
  onFinish,
  existingRegisteredIndividualOrgs,
  existingJuristicOrgs,
}) => {
  const [selectedExistingOrg, setSelectedExistingOrg] = useState<number | null>(
    null,
  );
  const accountTypeValue = Form.useWatch("accountType", organizationForm);
  const [
    isSuccessCheckRegistrationNumber,
    setIsSuccessCheckRegistrationNumber,
  ] = useState(false);
  const [isSuccessCheckTaxId, setIsSuccessCheckTaxId] = useState(false);

  // Derive whether an existing org is selected (id !== 0 and not null)
  const isExistingOrgSelected =
    selectedExistingOrg !== null && selectedExistingOrg !== 0;

  // Set default accountType on mount
  useEffect(() => {
    if (!organizationForm.getFieldValue("accountType")) {
      organizationForm.setFieldsValue({
        accountType: OrganizationType.REGISTERED_INDIVIDUAL,
      });
    }
  }, [organizationForm]);

  useEffect(() => {
    // Clear all fields when account type changes
    organizationForm.setFieldsValue({
      // Personal
      idCard: "",
      // Registered Individual
      registrationNumber: "",
      registrationName: "",
      // Juristic
      taxId: "",
      juristicType: "LIMITED_COMPANY",
      juristicTypeId: 4,
      remarkTypeOther: "",
      juristicName: "",
      branchType: undefined,
      branchNumber: "",
      branchName: "",
      businessType: [],
      businessTypeDescription: "",
      selectedOrganizationId: undefined,
    });

    // Reset selected existing org — default to "สร้างองค์กรใหม่" (id=0) when org list exists
    const currentOrgList =
      accountTypeValue === OrganizationType.REGISTERED_INDIVIDUAL
        ? existingRegisteredIndividualOrgs
        : existingJuristicOrgs;
    const defaultOrgSelection =
      currentOrgList && currentOrgList.length > 0 ? 0 : null;
    setSelectedExistingOrg(defaultOrgSelection);
    if (defaultOrgSelection === 0) {
      organizationForm.setFieldsValue({ selectedOrganizationId: 0 });
    }

    // Reset all validation states when account type changes
    setIsSuccessCheckRegistrationNumber(false);
    setIsSuccessCheckTaxId(false);

    // Set default branch values for juristic type
    if (accountTypeValue === OrganizationType.JURISTIC) {
      organizationForm.setFieldsValue({
        branchType: "HEAD_OFFICE",
        branchNumber: "00000",
        branchName: "สำนักงานใหญ่",
      });
    }
  }, [
    accountTypeValue,
    organizationForm,
    existingRegisteredIndividualOrgs,
    existingJuristicOrgs,
  ]);

  return (
    <Form
      form={organizationForm}
      className="w-full sm:w-[500px]"
      layout="vertical"
      onFinish={onFinish}
      data-testid="form--register-identity"
      initialValues={{
        accountType: OrganizationType.REGISTERED_INDIVIDUAL,
      }}
    >
      <div className="flex justify-between">
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
            data-testid="badge--register-step-2"
          >
            กรอกข้อมูลเบื้องต้นเพื่อเริ่มต้นเปิดร้านของคุณบน ALLKONS
          </Typography>
        </div>
      </div>

      <div className="mt-6" data-testid="group--account-type">
        {/* Account Type Selection */}
        <Typography
          variant="paragraph-medium"
          className="!text-text-secondary !font-medium"
        >
          คุณต้องการสร้างบัญชีใช้งานบน Allkons ในนาม?
        </Typography>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const accountType = getFieldValue("accountType");

            // Get current organization list based on selected type
            const currentOrgList =
              accountType === OrganizationType.REGISTERED_INDIVIDUAL
                ? existingRegisteredIndividualOrgs
                : existingJuristicOrgs;

            return (
              <Form.Item name="accountType" className="!mb-0">
                <div className="w-full flex flex-col md:flex-row gap-2 mt-2">
                  <div className="flex-1">
                    <CardSelection
                      dataTestId="card--account-type-sole-prop"
                      isSelected={
                        accountType === OrganizationType.REGISTERED_INDIVIDUAL
                      }
                      icon="ri-file-list-3-line"
                      label="บุคคลธรรมดาที่จดทะเบียนพาณิชย์"
                      onClick={() => {
                        setSelectedExistingOrg(null);
                        organizationForm.setFieldsValue({
                          accountType: OrganizationType.REGISTERED_INDIVIDUAL,
                          selectedOrganizationId: undefined,
                        });
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <CardSelection
                      dataTestId="card--account-type-corporate"
                      isSelected={accountType === OrganizationType.JURISTIC}
                      icon="ri-briefcase-2-line"
                      label="นิติบุคคล"
                      onClick={() => {
                        setSelectedExistingOrg(null);
                        organizationForm.setFieldsValue({
                          accountType: OrganizationType.JURISTIC,
                          selectedOrganizationId: undefined,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Existing Organizations Selection - shown under selected type */}
                {currentOrgList && currentOrgList.length > 0 && (
                  <div className="mt-4">
                    <Select
                      dataTestId="select--existing-organization"
                      label="เลือกองค์กรที่เกี่ยวข้อง"
                      placeholder="เลือกองค์กร"
                      required
                      value={selectedExistingOrg}
                      onChange={(value) => {
                        setSelectedExistingOrg(value);

                        // Find the selected organization
                        const selectedOrg = currentOrgList.find(
                          (org) => org.organizationId === value,
                        );

                        if (selectedOrg && value !== 0) {
                          // Prefill form with organization data
                          if (
                            accountType ===
                            OrganizationType.REGISTERED_INDIVIDUAL
                          ) {
                            organizationForm.setFieldsValue({
                              selectedOrganizationId: value,
                              registrationName: selectedOrg.organizeName,
                              registrationNumber:
                                selectedOrg.registrationNumber || "",
                              idCard: selectedOrg.idCard || "",
                              businessType: selectedOrg.businessType || [],
                            });
                            setIsSuccessCheckRegistrationNumber(true);
                          } else if (
                            accountType === OrganizationType.JURISTIC
                          ) {
                            organizationForm.setFieldsValue({
                              selectedOrganizationId: value,
                              juristicName:
                                selectedOrg.juristicInfo?.juristicName ||
                                selectedOrg.organizeName,
                              taxId: selectedOrg.taxId || "",
                              branchType:
                                selectedOrg.organizeBranchType || "HEAD_OFFICE",
                              branchNumber: selectedOrg.branchNumber || "00000",
                              businessType: selectedOrg.businessType || [],
                              remarkTypeOther:
                                selectedOrg.remarkTypeOther || "",
                            });
                            setIsSuccessCheckTaxId(true);
                          }
                        } else {
                          // Reset form fields when selecting "สร้างองค์กรใหม่"
                          organizationForm.setFieldsValue({
                            selectedOrganizationId: value,
                            registrationName: "",
                            registrationNumber: "",
                            idCard: "",
                            juristicName: "",
                            taxId: "",
                            branchType:
                              accountType === OrganizationType.JURISTIC
                                ? "HEAD_OFFICE"
                                : undefined,
                            branchNumber:
                              accountType === OrganizationType.JURISTIC
                                ? "00000"
                                : "",
                            branchName:
                              accountType === OrganizationType.JURISTIC
                                ? "สำนักงานใหญ่"
                                : "",
                            businessType: [],
                            remarkTypeOther: "",
                          });
                          // Reset validation states
                          setIsSuccessCheckRegistrationNumber(false);
                          setIsSuccessCheckTaxId(false);
                        }
                      }}
                      options={currentOrgList.map((org) => ({
                        value: org.organizationId,
                        label:
                          org.organizationId === 0
                            ? org.organizeName
                            : `${org.organizeName}`,
                      }))}
                    />
                  </div>
                )}
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item name="selectedOrganizationId" noStyle />

        {/* Organization Forms Based on Account Type */}
        <div className="mt-6">
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const accountType = getFieldValue("accountType");
              if (accountType === OrganizationType.REGISTERED_INDIVIDUAL) {
                return (
                  <RegisteredIndividualForm
                    form={
                      organizationForm as unknown as FormInstance<RegisteredIndividualFormFields>
                    }
                    isSuccessCheckRegistrationNumber={
                      isSuccessCheckRegistrationNumber
                    }
                    setIsSuccessCheckRegistrationNumber={
                      setIsSuccessCheckRegistrationNumber
                    }
                    isAllFieldsDisabled={isExistingOrgSelected}
                  />
                );
              } else if (accountType === OrganizationType.JURISTIC) {
                return (
                  <JuristicOrganizationForm
                    form={
                      organizationForm as unknown as FormInstance<JuristicFormFields>
                    }
                    isSuccessCheckTaxId={isSuccessCheckTaxId}
                    setIsSuccessCheckTaxId={setIsSuccessCheckTaxId}
                    isAllFieldsDisabled={isExistingOrgSelected}
                  />
                );
              }
              return null;
            }}
          </Form.Item>
        </div>
      </div>

      {/* Submit Button */}
      <Form.Item shouldUpdate className="!mt-6 !mb-0">
        {({ getFieldsError, getFieldValue }) => {
          const hasErrors = getFieldsError().some(
            ({ errors }) => errors.length,
          );
          const accountType = getFieldValue("accountType");
          const selectedOrganizationId = getFieldValue(
            "selectedOrganizationId",
          );
          const hasEmptyAccountType = !accountType;
          const isRegisteredIndividualType =
            accountType === OrganizationType.REGISTERED_INDIVIDUAL;
          const isJuristicType = accountType === OrganizationType.JURISTIC;

          // If existing org selected (id !== 0), skip validation
          const hasSelectedExistingOrg =
            selectedOrganizationId && selectedOrganizationId !== 0;

          const shouldDisable =
            hasErrors ||
            hasEmptyAccountType ||
            (!hasSelectedExistingOrg &&
              ((isRegisteredIndividualType &&
                !isSuccessCheckRegistrationNumber) ||
                (isJuristicType && !isSuccessCheckTaxId)));

          return (
            <Button
              dataTestId="btn--accept-register"
              htmlType="submit"
              fullWidth
              disabled={shouldDisable}
              loading={loading}
            >
              ลงทะเบียน
            </Button>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default SetOrganizationStep;
