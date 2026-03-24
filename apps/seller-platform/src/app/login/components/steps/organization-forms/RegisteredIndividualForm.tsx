"use client";

import React from "react";
import { FormInstance } from "antd";
import {
  RegisteredIndividualForm as SharedRegisteredIndividualForm,
  RegisteredIndividualFormFields,
} from "@/components/Form/Organization/RegisteredIndividualForm";

// ===========================================
// Types
// ===========================================

interface RegisteredIndividualFormProps {
  form: FormInstance<RegisteredIndividualFormFields>;
  isSuccessCheckRegistrationNumber: boolean;
  setIsSuccessCheckRegistrationNumber: (value: boolean) => void;
  isAllFieldsDisabled?: boolean;
}

// ===========================================
// Component
// ===========================================

export const RegisteredIndividualForm: React.FC<
  RegisteredIndividualFormProps
> = ({
  form,
  isSuccessCheckRegistrationNumber,
  setIsSuccessCheckRegistrationNumber,
  isAllFieldsDisabled,
}) => {
  return (
    <SharedRegisteredIndividualForm
      form={form}
      showBusinessType={false}
      isSuccessCheckRegistrationNumber={isSuccessCheckRegistrationNumber}
      setIsSuccessCheckRegistrationNumber={setIsSuccessCheckRegistrationNumber}
      withFormWrapper={false}
      isAllFieldsDisabled={isAllFieldsDisabled}
    />
  );
};
