"use client";

import React from "react";
import { FormInstance } from "antd";
import {
  JuristicForm,
  JuristicFormFields,
  isValidThaiJuristicId,
} from "@/components/Form/Organization/JuristicForm";

// ===========================================
// Types
// ===========================================

interface JuristicOrganizationFormProps {
  form: FormInstance<JuristicFormFields>;
  isSuccessCheckTaxId: boolean;
  setIsSuccessCheckTaxId: (value: boolean) => void;
  isAllFieldsDisabled?: boolean;
}

// ===========================================
// Component
// ===========================================

export const JuristicOrganizationForm: React.FC<
  JuristicOrganizationFormProps
> = ({ form, isSuccessCheckTaxId, setIsSuccessCheckTaxId, isAllFieldsDisabled }) => {
  return (
    <JuristicForm
      form={form}
      showBusinessType={false}
      isSuccessCheckTaxId={isSuccessCheckTaxId}
      setIsSuccessCheckTaxId={setIsSuccessCheckTaxId}
      withFormWrapper={false}
      isAllFieldsDisabled={isAllFieldsDisabled}
    />
  );
};

// Re-export for backward compatibility
export { isValidThaiJuristicId } from "@/components/Form/Organization/JuristicForm";
