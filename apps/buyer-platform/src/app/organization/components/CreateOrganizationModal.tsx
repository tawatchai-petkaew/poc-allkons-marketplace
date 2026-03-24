'use client';

import Typography from '@/components/Typography';
import { useState, useEffect } from 'react';
import FormRegisteredIndividual from './FormRegisteredIndividual';
import FormJuristic from './FormJuristic';
import FormPersonal from './FormPersonal';
import CustomButton from '@/components/Button';
import { OrganizationType } from '@/common/interfaces/organization/user-with-org.response.interface';
import CardSelection from '@/components/Card/Selection';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import PopupConsent from '@/components/Popup/Consent';
import { Form } from 'antd';
import { useGlobalStore } from '@/store/global.store';
import {
  ICreateOrganizationPayload,
  ICreatePersonalOrganizationPayload,
  ICreateRegisteredIndividualOrganizationPayload,
  ICreateJuristicOrganizationPayload,
} from '@/common/interfaces/organization/create-organization.request.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganization } from '@/common/api/customer-service/organization.api';
import { useNotification } from '@/hooks/notification.hook';
import { IOrganizationWithRoleDto } from '@/common/interfaces/organization/user-with-org.response.interface';

interface Props {
  onClose: () => void;
  organizations?: IOrganizationWithRoleDto[];
}

const CreateOrganizationModal = ({ onClose, organizations = [] }: Props) => {
  const queryClient = useQueryClient();
  const { profile } = useGlobalStore();

  // Check if user already has a personal organization
  const hasPersonalOrg = organizations
    .filter(
      (org) => org.organization?.organizationType === OrganizationType.PERSONAL
    )
    ?.some((org) => org.isOwner);

  const [orgType, setOrgType] = useState<OrganizationType>(
    hasPersonalOrg
      ? OrganizationType.REGISTERED_INDIVIDUAL
      : OrganizationType.PERSONAL
  );
  const screenWidth = useScreenWidth();
  const [isConsentVisible, setIsConsentVisible] = useState(false);
  const [personalFormReady, setPersonalFormReady] = useState(false);
  const [registeredIndividualFormReady, setRegisteredIndividualFormReady] =
    useState(false);
  const [juristicFormReady, setJuristicFormReady] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  // Initialize only the active form instance based on orgType
  const [personalForm] = Form.useForm();
  const [registeredIndividualForm] = Form.useForm();
  const [juristicForm] = Form.useForm();

  // Reset the active form when switching organization types
  useEffect(() => {
    // Reset the form that's being switched away from
    switch (orgType) {
      case OrganizationType.PERSONAL:
        registeredIndividualForm.resetFields();
        juristicForm.resetFields();
        break;
      case OrganizationType.REGISTERED_INDIVIDUAL:
        personalForm.resetFields();
        juristicForm.resetFields();
        break;
      case OrganizationType.JURISTIC:
        personalForm.resetFields();
        registeredIndividualForm.resetFields();
        break;
    }
    // Reset ready states
    setPersonalFormReady(false);
    setRegisteredIndividualFormReady(false);
    setJuristicFormReady(false);
  }, [orgType, personalForm, registeredIndividualForm, juristicForm]);

  // Check if current form is valid for button state
  const isFormValid = () => {
    let isReady;

    switch (orgType) {
      case OrganizationType.PERSONAL:
        isReady = personalFormReady;
        break;
      case OrganizationType.REGISTERED_INDIVIDUAL:
        isReady = registeredIndividualFormReady;
        break;
      case OrganizationType.JURISTIC:
        isReady = juristicFormReady;
        break;
    }

    return isReady;
  };

  const { notification } = useNotification();

  const {
    mutate: createOrganizationMutation,
    isPending: isCreatingOrganization,
  } = useMutation({
    mutationKey: ['createOrganization'],
    mutationFn: async (payload: ICreateOrganizationPayload) => {
      const { data } = await createOrganization(payload);
      return data;
    },
    onSuccess: () => {
      onClose();

      queryClient.refetchQueries({
        queryKey: ['organization', profile?.uuid, 1],
      });
      queryClient.refetchQueries({
        queryKey: ['organization', profile?.uuid, 1, 999],
      });
      notification.success({
        message: 'สร้างองค์กรสำเร็จ',
        description: 'องค์กรของคุณถูกสร้างเรียบร้อยแล้ว',
      });
    },
    onError: () => {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'โปรดลองใหม่อีกครั้ง',
      });
    },
  });

  const handleCreateOrganization = async () => {
    let currentForm = personalForm;
    let payload: ICreateOrganizationPayload;

    switch (orgType) {
      case OrganizationType.PERSONAL:
        currentForm = personalForm;
        payload = {
          userId: profile?.id,
          countryCode: profile?.countryCode,
          phoneNumber: profile?.tel,
          skipRegister: true,
          organizationType: OrganizationType.PERSONAL,
          personalInfo: {
            idCard: currentForm.getFieldValue('idCard'),
            acceptTerms: true,
            businessType: [],
          },
        } as ICreatePersonalOrganizationPayload;
        break;
      case OrganizationType.REGISTERED_INDIVIDUAL:
        currentForm = registeredIndividualForm;
        payload = {
          userId: profile?.id,
          countryCode: profile?.countryCode,
          phoneNumber: profile?.tel,
          skipRegister: true,
          organizationType: OrganizationType.REGISTERED_INDIVIDUAL,
          registeredIndividualInfo: {
            idCard: currentForm.getFieldValue('idCard'),
            registrationName: currentForm.getFieldValue('registrationName'),
            businessType: currentForm.getFieldValue('businessType'),
            registrationNumber: currentForm.getFieldValue('registrationNumber'),
            acceptTerms: true,
            ...(currentForm.getFieldValue('businessType')?.includes('OTHER') &&
            currentForm.getFieldValue('businessTypeRemark')
              ? {
                  businessTypeDescription:
                    currentForm.getFieldValue('businessTypeRemark'),
                }
              : {}),
          },
        } as ICreateRegisteredIndividualOrganizationPayload;
        break;
      case OrganizationType.JURISTIC:
        currentForm = juristicForm;
        payload = {
          userId: profile?.id,
          countryCode: profile?.countryCode,
          phoneNumber: profile?.tel,
          skipRegister: true,
          organizationType: OrganizationType.JURISTIC,
          juristicInfo: {
            juristicName: currentForm.getFieldValue('juristicName'),
            businessType: currentForm.getFieldValue('businessType'),
            taxId: currentForm.getFieldValue('taxId'),
            juristicType: currentForm.getFieldValue('juristicType'),
            juristicTypeId: currentForm.getFieldValue('juristicTypeId'),
            branchType: 'HEAD_OFFICE',
            branchNumber: '00000',
            branchName:
              currentForm.getFieldValue('branchName') || 'สำนักงานใหญ่',
            acceptTerms: true,
            ...(currentForm.getFieldValue('businessType')?.includes('OTHER') &&
            currentForm.getFieldValue('businessTypeRemark')
              ? {
                  businessTypeDescription:
                    currentForm.getFieldValue('businessTypeRemark'),
                }
              : {}),
            ...(currentForm.getFieldValue('juristicType') === 'OTHER' &&
            currentForm.getFieldValue('juristicTypeRemark')
              ? {
                  remarkTypeOther:
                    currentForm.getFieldValue('juristicTypeRemark'),
                }
              : {}),
          },
        } as ICreateJuristicOrganizationPayload;
        break;
    }
    createOrganizationMutation(payload);
  };

  const handleSubmitConsent = () => {
    setIsConsentVisible(false);
    let currentForm;

    switch (orgType) {
      case OrganizationType.REGISTERED_INDIVIDUAL:
        currentForm = registeredIndividualForm;
        break;
      case OrganizationType.JURISTIC:
        currentForm = juristicForm;
        break;
    }

    currentForm?.setFieldValue('isCheckedMarketingConsent', true);
  };

  return (
    <div className={`max-w-[800px] mx-auto max-h-[65vh] overflow-y-auto `}>
      <PopupConsent
        visible={isConsentVisible}
        onClose={() => setIsConsentVisible(false)}
        onSubmitConsent={handleSubmitConsent}
      />
      <div className="bg-white px-4 flex flex-col gap-2 rounded-2xl">
        <Typography
          variant="paragraph-middle-regular"
          className="!text-text-secondary"
        >
          คุณต้องการสร้างบัญชีใช้งานบน Allkons ในนาม?
        </Typography>
        <div className="w-full flex flex-col md:flex-row gap-2">
          {!hasPersonalOrg && (
            <CardSelection
              isSelected={orgType === OrganizationType.PERSONAL}
              icon="ri-user-line"
              label="บุคคลธรรมดา"
              onClick={() => setOrgType(OrganizationType.PERSONAL)}
            />
          )}
          <CardSelection
            isSelected={orgType === OrganizationType.REGISTERED_INDIVIDUAL}
            icon="ri-file-list-3-line"
            label="บุคคลธรรมดาที่จดทะเบียนพาณิชย์"
            onClick={() => setOrgType(OrganizationType.REGISTERED_INDIVIDUAL)}
          />
          <CardSelection
            isSelected={orgType === OrganizationType.JURISTIC}
            icon="ri-briefcase-2-line"
            label="นิติบุคคล"
            onClick={() => setOrgType(OrganizationType.JURISTIC)}
          />
        </div>
        {orgType === OrganizationType.PERSONAL && (
          <FormPersonal
            key={`personal-${formResetKey}`}
            form={personalForm}
            setFormReady={setPersonalFormReady}
          />
        )}
        {orgType === OrganizationType.REGISTERED_INDIVIDUAL && (
          <FormRegisteredIndividual
            key={`registered-${formResetKey}`}
            form={registeredIndividualForm}
            setIsConsentVisible={(e) => setIsConsentVisible(e)}
            setFormReady={setRegisteredIndividualFormReady}
          />
        )}
        {orgType === OrganizationType.JURISTIC && (
          <FormJuristic
            key={`juristic-${formResetKey}`}
            form={juristicForm}
            setIsConsentVisible={(e) => setIsConsentVisible(e)}
            setFormReady={setJuristicFormReady}
          />
        )}
        <CustomButton
          variant="solid"
          color="primary"
          className="w-full mt-8"
          onClick={handleCreateOrganization}
          disabled={!isFormValid()}
          loading={isCreatingOrganization}
        >
          สร้างองค์กร
        </CustomButton>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
